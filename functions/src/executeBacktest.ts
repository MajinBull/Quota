import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { runBacktest } from './engine/backtester';
import { getHistoricalData } from './data/cache';
import { validatePortfolio } from './utils/validation';
import type { Portfolio } from '@quota/shared/types';

interface ExecuteBacktestRequest {
  portfolio: Portfolio;
  adCompletionToken?: string; // Token from ad completion (required for free users)
}

interface ExecuteBacktestResponse {
  success: boolean;
  result?: any; // BacktestResult
  remainingBacktests?: number;
  error?: string;
}

/**
 * Validate ad completion token
 * Format: "userId|timestamp|nonce|signature"
 *
 * @param token Token string from client
 * @param expectedUserId User ID that should match token
 * @returns true if valid, false otherwise
 */
function validateAdCompletionToken(
  token: string,
  expectedUserId: string
): boolean {
  try {
    console.log('🔍 Validating token:', { token: token.substring(0, 50) + '...', expectedUserId });

    const parts = token.split('|');
    console.log('📋 Token parts:', { count: parts.length, parts: parts.map(p => p.substring(0, 20) + '...') });

    if (parts.length !== 4) {
      console.error('❌ Token validation failed: invalid format (expected 4 parts, got', parts.length, ')');
      return false;
    }

    const [userId, timestampStr, nonce, signature] = parts;

    // 1. Verify userId matches
    console.log('🆔 UserId check:', { received: userId, expected: expectedUserId, match: userId === expectedUserId });
    if (userId !== expectedUserId) {
      console.error('❌ Token validation failed: userId mismatch');
      return false;
    }

    // 2. Verify timestamp (must be <5 minutes old)
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      console.error('❌ Token validation failed: invalid timestamp:', timestampStr);
      return false;
    }

    const now = Date.now();
    const ageMinutes = (now - timestamp) / 1000 / 60;

    console.log('⏰ Timestamp check:', {
      received: timestamp,
      now,
      ageMinutes: ageMinutes.toFixed(2),
      valid: ageMinutes >= 0 && ageMinutes <= 5
    });

    if (ageMinutes > 5) {
      console.error(`❌ Token validation failed: expired (${ageMinutes.toFixed(1)} minutes old)`);
      return false;
    }

    if (ageMinutes < 0) {
      console.error(`❌ Token validation failed: timestamp in future (${ageMinutes.toFixed(1)} minutes)`);
      return false;
    }

    // 3. Nonce verification (currently just check it exists)
    if (!nonce || nonce.length === 0) {
      console.error('❌ Token validation failed: missing nonce');
      return false;
    }

    // 4. Signature verification (basic - can be enhanced with HMAC later)
    if (!signature || signature.length === 0) {
      console.error('❌ Token validation failed: missing signature');
      return false;
    }

    console.log(`✅ Token validated successfully for user ${userId} (age: ${ageMinutes.toFixed(1)}m)`);
    return true;
  } catch (error) {
    console.error('💥 Token validation exception:', error);
    return false;
  }
}

/**
 * Cloud Function: Execute a backtest with ad token validation
 *
 * Security:
 * - Verifies user authentication
 * - Checks premium status from Firestore
 * - Enforces 20 backtest/month limit for free tier
 * - Atomically increments counter BEFORE execution
 *
 * Performance:
 * - Uses global cache for historical data (warm starts ~1s, cold starts ~3-5s)
 * - Returns full backtest result
 */
export const executeBacktest = onCall<ExecuteBacktestRequest>(
  { region: 'us-central1', memory: '512MiB', timeoutSeconds: 300 },
  async (request): Promise<ExecuteBacktestResponse> => {
    const data = request.data;
    const context = request;
    const startTime = Date.now();

    try {
      // 1. Authentication check
      if (!context.auth) {
        throw new HttpsError(
          'unauthenticated',
          'You must be logged in to run backtests'
        );
      }

      const uid = context.auth.uid;
      console.log(`Backtest request from user: ${uid}`);

      // 2. Validate portfolio input
      const portfolio = data.portfolio;
      const validationError = validatePortfolio(portfolio);

      if (validationError) {
        throw new HttpsError(
          'invalid-argument',
          `Invalid portfolio: ${validationError}`
        );
      }

      // 3. Load user document and check limits
      const userDoc = await admin.firestore().collection('users').doc(uid).get();

      if (!userDoc.exists) {
        throw new HttpsError(
          'not-found',
          'User data not found. Please re-login.'
        );
      }

      const userData = userDoc.data()!;
      const isPremium = userData.isPremium === true;
      const currentCount = userData.backtestExecutionCount || 0;

      console.log(`User ${uid} - Premium: ${isPremium}, Analytics count: ${currentCount}`);

      // 4. Validate ad completion token for free users
      if (!isPremium) {
        const adToken = data.adCompletionToken;

        if (!adToken) {
          throw new HttpsError(
            'failed-precondition',
            'Devi guardare un video pubblicitario per eseguire il backtest. Passa a Premium per rimuovere le pubblicità!'
          );
        }

        if (!validateAdCompletionToken(adToken, uid)) {
          throw new HttpsError(
            'invalid-argument',
            'Token pubblicitario non valido o scaduto. Riprova a guardare il video.'
          );
        }

        console.log(`Ad token validated successfully for user ${uid}`);
      }

      // 5. Increment counter for analytics (optional, no longer a limit)
      await userDoc.ref.update({
        backtestExecutionCount: admin.firestore.FieldValue.increment(1),
      });

      console.log(`Analytics counter incremented for user ${uid}`);

      // 6. Load historical data from cache
      const historicalData = getHistoricalData();

      // 7. Build asset data map for portfolio
      const assetDataMap = new Map();
      const missingAssets: string[] = [];

      for (const allocation of portfolio.allocations) {
        const assetData = historicalData.get(allocation.symbol);

        if (!assetData) {
          missingAssets.push(allocation.symbol);
        } else {
          assetDataMap.set(allocation.symbol, assetData);
        }
      }

      if (missingAssets.length > 0) {
        throw new HttpsError(
          'not-found',
          `Asset data not found for: ${missingAssets.join(', ')}`
        );
      }

      // 8. Execute backtest
      console.log(`Running backtest for ${portfolio.allocations.length} assets...`);
      const result = runBacktest(portfolio, assetDataMap);

      if (!result) {
        throw new HttpsError(
          'internal',
          'Backtest execution failed - no result returned'
        );
      }

      // 9. Calculate remaining backtests (always unlimited now, -1 indicates no limit)
      const remainingBacktests = -1; // No limits: Premium = no ads, Free = with ads

      const executionTime = Date.now() - startTime;
      console.log(`Backtest completed in ${executionTime}ms for user ${uid}`);

      // 10. Return result
      return {
        success: true,
        result,
        remainingBacktests,
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(`Backtest error after ${executionTime}ms:`, error);

      // Re-throw HttpsErrors as-is
      if (error instanceof HttpsError) {
        throw error;
      }

      // Wrap other errors
      throw new HttpsError(
        'internal',
        `Backtest failed: ${error.message || 'Unknown error'}`
      );
    }
  }
);
