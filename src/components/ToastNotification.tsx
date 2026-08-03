import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm sm:max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 animate-slide-up ${
        isSuccess
          ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-100 backdrop-blur-md"
          : isError
          ? "bg-rose-950/90 border-rose-500/40 text-rose-100 backdrop-blur-md"
          : "bg-slate-900/90 border-slate-700 text-slate-100 backdrop-blur-md"
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-teal-400" />}
      </div>

      <div className="flex-1 text-xs sm:text-sm">
        <h4 className="font-bold leading-snug">{toast.title}</h4>
        {toast.message && <p className="mt-1 opacity-90 leading-relaxed text-[11px] sm:text-xs">{toast.message}</p>}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-100 p-1 rounded-lg transition-colors cursor-pointer"
        title="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
