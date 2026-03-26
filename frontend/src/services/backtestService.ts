import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import type { Portfolio, BacktestResult } from '../types';

interface ExecuteBacktestResponse {
  success: boolean;
  result?: BacktestResult;
  remainingBacktests?: number;
  error?: string;
}

export interface BacktestResponse {
  result: BacktestResult;
  remainingBacktests: number;
}

/**
 * Execute a backtest via Cloud Function
 * This ensures server-side token validation and prevents client-side bypasses
 *
 * @param portfolio Portfolio configuration
 * @param adCompletionToken Optional ad completion token for free users
 * @returns Backtest result and remaining backtests count
 */
export async function executeBacktestRemote(
  portfolio: Portfolio,
  adCompletionToken?: string | null
): Promise<BacktestResponse> {
  try {
    // Call Cloud Function
    const callable = httpsCallable<
      { portfolio: Portfolio; adCompletionToken?: string },
      ExecuteBacktestResponse
    >(functions, 'executeBacktest');

    const response = await callable({
      portfolio,
      adCompletionToken: adCompletionToken || undefined,
    });

    if (!response.data.success || !response.data.result) {
      throw new Error(response.data.error || 'Backtest execution failed');
    }

    // Log remaining backtests for user awareness
    const remaining = response.data.remainingBacktests ?? -1;
    if (remaining >= 0) {
      console.log(`Remaining backtests this month: ${remaining}`);
    }

    return {
      result: response.data.result,
      remainingBacktests: remaining,
    };
  } catch (error: any) {
    console.error('Backtest execution error:', error);

    // Extract Firebase error message if available
    if (error.code === 'functions/resource-exhausted') {
      throw new Error('Hai raggiunto il limite mensile di 20 backtest. Passa a Premium!');
    }

    if (error.code === 'functions/unauthenticated') {
      throw new Error('Devi effettuare il login per eseguire backtest');
    }

    if (error.code === 'functions/failed-precondition') {
      // Ad token required but not provided
      throw new Error(error.message || 'Devi guardare un video pubblicitario per eseguire il backtest');
    }

    if (error.code === 'functions/invalid-argument') {
      // Could be invalid portfolio OR invalid ad token
      throw new Error(error.message || 'Richiesta non valida');
    }

    // Generic error
    throw new Error(error.message || 'Errore durante l\'esecuzione del backtest');
  }
}
