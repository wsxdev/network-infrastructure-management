import React from 'react';

export function MetricKpiCard({ title, value, unit = '', subtitle, icon: Icon, color = 'emerald' }) {
  const colorSchemes = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    slate: 'bg-slate-50 text-slate-700 border-slate-200/60',
    primary: 'bg-mineral-green-50 text-mineral-green-800 border-mineral-green-200/60'
  };

  const scheme = colorSchemes[color] || colorSchemes.slate;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">{title}</span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
        </div>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${scheme}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
