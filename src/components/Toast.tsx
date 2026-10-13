import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 rounded-lg border border-white/20 bg-neutral-950/95 px-4 py-3 text-xs text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-white shrink-0 drop-shadow-[0_0_6px_#ffffff]" />}
            {toast.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="h-4 w-4 text-white shrink-0" />}
            <span className="leading-snug">{toast.text}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-neutral-400 hover:text-white shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
