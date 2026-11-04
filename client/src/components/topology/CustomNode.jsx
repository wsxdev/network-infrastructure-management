import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Router, Cpu, Server, Monitor, Wifi, HardDrive, CheckCircle2, XCircle, Unlink, Hourglass } from 'lucide-react';

const typeIcons = {
  router: Router,
  switch: Cpu,
  server: Server,
  workstation: Monitor,
  ap: Wifi,
  other: HardDrive
};

const statusStyles = {
  up: {
    border: 'border-emerald-500',
    ring: 'ring-emerald-100',
    iconBg: 'bg-emerald-50 text-emerald-700',
    statusIcon: CheckCircle2,
    badgeText: 'UP'
  },
  down: {
    border: 'border-rose-500',
    ring: 'ring-rose-100',
    iconBg: 'bg-rose-50 text-rose-700',
    statusIcon: XCircle,
    badgeText: 'DOWN'
  },
  unreachable: {
    border: 'border-amber-500',
    ring: 'ring-amber-100',
    iconBg: 'bg-amber-50 text-amber-700',
    statusIcon: Unlink,
    badgeText: 'INACCESIBLE'
  },
  pending: {
    border: 'border-slate-400',
    ring: 'ring-slate-100',
    iconBg: 'bg-slate-50 text-slate-600',
    statusIcon: Hourglass,
    badgeText: 'PENDIENTE'
  }
};

export const CustomNode = memo(({ data }) => {
  const Icon = typeIcons[data.type] || HardDrive;
  const style = statusStyles[data.status] || statusStyles.pending;
  const StatusIcon = style.statusIcon;

  return (
    <div
      className={`px-4 py-3 shadow-md rounded-xl bg-white border-2 ${style.border} ring-4 ${style.ring} min-w-[190px] transition-all hover:shadow-lg`}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-mineral-green-700" />

      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-bold text-slate-900 truncate" title={data.name}>
              {data.name}
            </h4>
          </div>
          <p className="text-[11px] font-mono text-slate-600 truncate">{data.ipAddress || 'Sin IP'}</p>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
          <StatusIcon className="w-3 h-3" />
          <span>{style.badgeText}</span>
        </span>

        {data.responseTimeMs !== null && data.responseTimeMs !== undefined && (
          <span className="font-mono text-slate-500 font-medium">{data.responseTimeMs} ms</span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-mineral-green-700" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
