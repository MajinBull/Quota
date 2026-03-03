import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { runBacktest } from './engine/backtester';
import { getHistoricalData } from './data/cache';
import { validatePortfolio } from './utils/validation';
import type { Portfolio } from '@quota/shared/types';

interface ExecuteBacktestRequest {
  portfolio: Portfolio;
}

interface ExecuteBacktestResponse {
  success: boolean;
  result?: any; // BacktestResult
  remainingBacktests?: number;
  error?: string;
}

/**
 * Cloud Function: Execute a backtest with limit enforcement
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

      console.log(`User ${uid} - Premium: ${isPremium}, Count: ${currentCount}/20`);

      // 4. Enforce free tier limit (20 backtests/month)
      if (!isPremium && currentCount >= 20) {
        throw new HttpsError(
          'resource-exhausted',
          'Hai raggiunto il limite mensile di 20 backtest. Passa a Premium per backtest illimitati!'
        );
      }

      // 5. CRITICAL: Atomically increment counter BEFORE execution
      // This prevents bypass attempts by ensuring counter increments even if function fails
      await userDoc.ref.update({
        backtestExecutionCount: admin.firestore.FieldValue.increment(1),
      });

      console.log(`Counter incremented for user ${uid}`);

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

      // 9. Calculate remaining backtests
      const remainingBacktests = isPremium ? -1 : Math.max(0, 20 - (currentCount + 1));

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
