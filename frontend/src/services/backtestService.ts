import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import type { Portfolio, BacktestResult } from '../types';

interface ExecuteBacktestResponse {
  success: boolean;
  result?: BacktestResult;
  remainingBacktests?: number;
  error?: string;
}

/**
 * Execute a backtest via Cloud Function
 * This ensures server-side limit enforcement and prevents client-side bypasses
 *
 * @param portfolio Portfolio configuration
 * @returns Backtest result or throws error
 */
export async function executeBacktestRemote(portfolio: Portfolio): Promise<BacktestResult> {
  try {
    // Call Cloud Function
    const callable = httpsCallable<{ portfolio: Portfolio }, ExecuteBacktestResponse>(
      functions,
      'executeBacktest'
    );

    const response = await callable({ portfolio });

    if (!response.data.success || !response.data.result) {
      throw new Error(response.data.error || 'Backtest execution failed');
    }

    // Log remaining backtests for user awareness
    if (response.data.remainingBacktests !== undefined && response.data.remainingBacktests >= 0) {
      console.log(`Remaining backtests this month: ${response.data.remainingBacktests}`);
    }

    return response.data.result;
  } catch (error: any) {
    console.error('Backtest execution error:', error);

    // Extract Firebase error message if available
    if (error.code === 'functions/resource-exhausted') {
      throw new Error('Hai raggiunto il limite mensile di 20 backtest. Passa a Premium!');
    }

    if (error.code === 'functions/unauthenticated') {
      throw new Error('Devi effettuare il login per eseguire backtest');
    }

    if (error.code === 'functions/invalid-argument') {
      throw new Error(error.message || 'Portfolio non valido');
    }

    // Generic error
    throw new Error(error.message || 'Errore durante l\'esecuzione del backtest');
  }
}
