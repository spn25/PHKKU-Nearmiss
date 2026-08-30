import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-emerald-900/95 border-emerald-500/80 text-emerald-100',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />,
        };
      case 'error':
        return {
          bg: 'bg-red-900/95 border-red-500/80 text-red-100',
          icon: <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />,
        };
      default:
        return {
          bg: 'bg-slate-900/95 border-blue-500/80 text-blue-100',
          icon: <Info className="w-6 h-6 text-blue-400 shrink-0" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md ${style.bg}`}
      >
        {style.icon}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight text-white">{toast.title}</p>
          {toast.message && (
            <p className="text-xs mt-1 text-slate-200 opacity-90 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors"
          aria-label="Close Notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
