import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (options: { type: ToastType; title?: string; message: string; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, message, duration = 3500 }: { type: ToastType; title?: string; message: string; duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string, title: string = 'Berhasil') => {
    toast({ type: 'success', title, message });
  }, [toast]);

  const error = useCallback((message: string, title: string = 'Gagal') => {
    toast({ type: 'error', title, message });
  }, [toast]);

  const info = useCallback((message: string, title: string = 'Informasi') => {
    toast({ type: 'info', title, message });
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed top-3 sm:top-5 left-3 right-3 sm:left-auto sm:right-5 z-50 flex flex-col gap-2 w-auto sm:w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-2.5 p-3 sm:p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
                isSuccess
                  ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-500/10'
                  : isError
                  ? 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-500/10'
                  : 'bg-blue-50/95 border-blue-200 text-blue-900 shadow-blue-500/10'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />}
                {isError && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />}
                {!isSuccess && !isError && <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0 pr-1">
                {t.title && <h4 className="text-xs sm:text-sm font-bold tracking-tight mb-0.5 truncate">{t.title}</h4>}
                <p className="text-[11px] sm:text-xs font-medium leading-relaxed opacity-90 break-words">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 -mr-1 -mt-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
