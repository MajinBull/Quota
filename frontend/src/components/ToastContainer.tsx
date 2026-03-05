import { useToastStore } from '../stores/toastStore';
import type { ToastType } from '../stores/toastStore';

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-500 dark:border-emerald-600',
    icon: '✓'
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-500 dark:border-red-600',
    icon: '✕'
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-500 dark:border-amber-600',
    icon: '⚠'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-500 dark:border-blue-600',
    icon: 'ℹ'
  }
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];

        return (
          <div
            key={toast.id}
            className={`${style.bg} border-l-4 ${style.border} rounded-lg shadow-xl dark:shadow-slate-900 p-4 flex items-start gap-3 animate-slide-in-right`}
          >
            <span className="text-2xl flex-shrink-0">{style.icon}</span>
            <p className="text-sm font-medium text-slate-900 dark:text-white flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0"
              aria-label="Chiudi"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
