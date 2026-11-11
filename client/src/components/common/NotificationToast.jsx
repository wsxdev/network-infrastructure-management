import React from 'react';
import { useAlerts } from '../../context/AlertContext';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function NotificationToast() {
  const { toasts, removeToast } = useAlerts();

  if (toasts.length === 0) return null;

  const severityConfigs = {
    critical: {
      border: 'border-l-4 border-red-600',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bg: 'bg-white'
    },
    warning: {
      border: 'border-l-4 border-amber-500',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      bg: 'bg-white'
    },
    info: {
      border: 'border-l-4 border-blue-500',
      icon: Info,
      iconColor: 'text-blue-500',
      bg: 'bg-white'
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const config = severityConfigs[toast.severity] || severityConfigs.info;
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border border-slate-200 ${config.bg} ${config.border} transform transition-all duration-200 animate-slide-in`}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
