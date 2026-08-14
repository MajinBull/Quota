import type { BacktestResult, Portfolio } from '../types';

interface BacktestWorkerResponse {
  id: number;
  result?: BacktestResult;
  error?: string;
}

interface PendingRequest {
  resolve: (result: BacktestResult) => void;
  reject: (error: Error) => void;
}

let worker: Worker | null = null;
let nextRequestId = 1;
const pendingRequests = new Map<number, PendingRequest>();

function rejectPendingRequests(message: string) {
  for (const request of pendingRequests.values()) {
    request.reject(new Error(message));
  }
  pendingRequests.clear();
}

function getWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(new URL('../workers/backtestWorker.ts', import.meta.url), {
    type: 'module',
  });

  worker.onmessage = (event: MessageEvent<BacktestWorkerResponse>) => {
    const response = event.data;
    const pending = pendingRequests.get(response.id);
    if (!pending) return;

    pendingRequests.delete(response.id);
    if (response.result) {
      pending.resolve(response.result);
    } else {
      pending.reject(new Error(response.error ?? 'Backtest non riuscito'));
    }
  };

  worker.onerror = () => {
    rejectPendingRequests('Il motore locale si è arrestato. Ricarica la pagina e riprova.');
    worker?.terminate();
    worker = null;
  };

  return worker;
}

export function executeBacktestLocal(portfolio: Portfolio): Promise<BacktestResult> {
  const id = nextRequestId++;

  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    getWorker().postMessage({ id, portfolio });
  });
}
