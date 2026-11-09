import React from 'react';
import { useAcademy } from '../context/AcademyContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useAcademy();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-blue-500 shrink-0" />;
        let borderClass = 'border-blue-400/40';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
          borderClass = 'border-emerald-400/40';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
          borderClass = 'border-amber-400/40';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
          borderClass = 'border-rose-400/40';
        }

        return (
          <div
            key={toast.id}
            className={`glass-card rounded-2xl p-3.5 border shadow-2xl flex items-start gap-3 text-xs animate-in slide-in-from-bottom-5 duration-200 pointer-events-auto backdrop-blur-2xl ${borderClass}`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 font-medium leading-relaxed">{toast.message}</div>
          </div>
        );
      })}
    </div>
  );
}

