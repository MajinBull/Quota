import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

// Extend Window for AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdModalProps {
  onAdCompleted: (token: string) => void;
  onClose: () => void;
}

export function AdModal({ onAdCompleted, onClose }: AdModalProps) {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(30);
  const [isVisible, setIsVisible] = useState(true);
  const [adError, setAdError] = useState(false);

  // Load AdSense ad
  useEffect(() => {
    try {
      // Push ad to AdSense queue
      const ads = window.adsbygoogle || [];
      ads.push({});
    } catch (error) {
      console.error('Ad load failed:', error);
      setAdError(true);
    }
  }, []);

  // Countdown timer (only when visible)
  useEffect(() => {
    if (!isVisible || countdown <= 0 || adError) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isVisible, adError]);

  // Visibility tracking - pause timer when tab hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Generate token when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && user && !adError) {
      const token = generateToken(user.uid);
      onAdCompleted(token);
    }
  }, [countdown, user, onAdCompleted, adError]);

  function generateToken(userId: string): string {
    const timestamp = Date.now();
    const nonce = crypto.randomUUID();
    const payload = `${userId}|${timestamp}|${nonce}`;
    const signature = btoa(payload);
    return `${payload}|${signature}`;
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-3xl w-full mx-4 relative">
        {/* Close button (disabled during countdown) */}
        <button
          onClick={onClose}
          disabled={countdown > 0 && !adError}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
          title={countdown > 0 ? `Attendi ${countdown}s` : 'Chiudi'}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {adError ? 'Impossibile caricare la pubblicità' : 'Guarda un breve messaggio pubblicitario'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {adError
              ? 'Per favore disabilita l\'adblocker o passa a Premium per continuare'
              : 'Attendi 30 secondi per eseguire il backtest gratuitamente'
            }
          </p>
        </div>

        {/* Ad Container */}
        {!adError && (
          <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 mb-6 min-h-[280px] flex items-center justify-center overflow-hidden">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', minHeight: '250px' }}
              data-ad-client="ca-pub-8990391589287773"
              data-ad-slot="8778272868"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
        )}

        {/* Countdown Display */}
        {!adError && (
          <div className="text-center mb-6">
            {countdown > 0 ? (
              <div className="space-y-2">
                <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">
                  {countdown}s
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {!isVisible && '⏸️ Timer in pausa (torna alla tab per continuare)'}
                  {isVisible && 'Il backtest verrà eseguito automaticamente...'}
                </p>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((30 - countdown) / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ Completato!
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Esecuzione backtest in corso...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error State - Premium CTA */}
        {adError && (
          <div className="space-y-4 mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Adblocker rilevato</strong> o pubblicità non disponibile.
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                Per eseguire backtest gratuiti, disabilita l'adblocker e ricarica la pagina.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Passa a Premium (Nessuna Pubblicità)
            </button>
          </div>
        )}

        {/* Premium CTA (always visible) */}
        {!adError && (
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Stanco di guardare pubblicità?
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Con Premium ottieni backtest <strong>istantanei illimitati</strong> senza interruzioni
              </p>
              <button
                onClick={onClose}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-sm"
              >
                Scopri Premium →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
