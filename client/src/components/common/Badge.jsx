import React from 'react';
import { CheckCircle2, XCircle, Unlink, Hourglass, Info, AlertTriangle, AlertCircle } from 'lucide-react';

/**
 * Insignia de estado accesible según estándar WCAG 2.1 AA (Metáfora Consola NOC).
 * Cumple la regla inflexible: El color nunca es la única señal (Color + Ícono + Texto en mayúsculas).
 *
 * @param {'up'|'down'|'unreachable'|'pending'|'info'|'warning'|'critical'} status
 */
export function Badge({ status, label, className = '' }) {
  const configs = {
    up: {
      bg: 'bg-[#ECFDF5]',
      border: 'border-[#10B981]',
      text: 'text-emerald-800',
      icon: CheckCircle2,
      defaultLabel: 'DISPONIBLE'
    },
    down: {
      bg: 'bg-[#FEF2F2]',
      border: 'border-[#EF4444]',
      text: 'text-rose-800',
      icon: XCircle,
      defaultLabel: 'NO DISPONIBLE'
    },
    unreachable: {
      bg: 'bg-[#FFFBEB]',
      border: 'border-[#F59E0B]',
      text: 'text-amber-800',
      icon: Unlink,
      defaultLabel: 'INACCESIBLE'
    },
    pending: {
      bg: 'bg-[#F3F4F6]',
      border: 'border-[#6B7280]',
      text: 'text-gray-700',
      icon: Hourglass,
      defaultLabel: 'PENDIENTE'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      icon: Info,
      defaultLabel: 'INFO'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-400',
      text: 'text-amber-800',
      icon: AlertTriangle,
      defaultLabel: 'ADVERTENCIA'
    },
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-800',
      icon: AlertCircle,
      defaultLabel: 'CRÍTICA'
    }
  };

  const current = configs[status] || configs.pending;
  const IconComponent = current.icon;
  const displayLabel = label || current.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${current.bg} ${current.border} ${current.text} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
}
