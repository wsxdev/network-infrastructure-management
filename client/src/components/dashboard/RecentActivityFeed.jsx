import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { History, ArrowRight } from 'lucide-react';

export function RecentActivityFeed({ events = [] }) {
  return (
    <Card
      title="Actividad Reciente del Sistema"
      subtitle="Registro cronológico de transiciones y eventos de red"
      actions={<History className="w-4 h-4 text-slate-400" />}
    >
      {events.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          <p className="text-sm">Sin eventos registrados recientemente.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {events.map((evt) => (
            <div
              key={evt._id}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800">
                    {evt.deviceId?.name || 'Dispositivo de Red'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(evt.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Badge status={evt.previousStatus} />
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  <Badge status={evt.newStatus} />
                </div>
                <p className="text-[11px] text-slate-600 mt-1">{evt.reason}</p>
              </div>

              {evt.responseTimeMs && (
                <span className="text-[10px] font-mono font-medium text-slate-500 shrink-0 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {evt.responseTimeMs} ms
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
