import { runBacktest } from '../engine/backtester';
import type { BacktestResult, Portfolio } from '../types';

interface BacktestRequest {
  id: number;
  portfolio: Portfolio;
}

interface BacktestResponse {
  id: number;
  result?: BacktestResult;
  error?: string;
}

self.onmessage = async (event: MessageEvent<BacktestRequest>) => {
  const { id, portfolio } = event.data;

  try {
    const result = await runBacktest(portfolio);
    const response: BacktestResponse = result
      ? { id, result }
      : { id, error: 'Il backtest non ha prodotto risultati. Verifica date e asset selezionati.' };
    self.postMessage(response);
  } catch (error) {
    const response: BacktestResponse = {
      id,
      error: error instanceof Error ? error.message : 'Errore sconosciuto durante il backtest',
    };
    self.postMessage(response);
  }
};

export {};
