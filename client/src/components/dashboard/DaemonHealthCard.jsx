import React from 'react';
import { Card } from '../common/Card';
import { ShieldCheck, Cpu, HardDrive, Clock } from 'lucide-react';

export function DaemonHealthCard({ lastPulseTime, monitoredCount = 0 }) {
  return (
    <Card
      title="Estado del Escuadrón Centinela"
      subtitle="Supervisión autónoma y salud del proceso de monitoreo"
      actions={
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Operativo
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-mineral-green-700" />
          <div>
            <span className="text-slate-500 block text-[11px]">Concurrencia</span>
            <span className="font-semibold text-slate-900">15 hilos ICMP (p-limit)</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-mineral-green-700" />
          <div>
            <span className="text-slate-500 block text-[11px]">Hosts Monitoreados</span>
            <span className="font-semibold text-slate-900">{monitoredCount} dispositivos</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
          <Clock className="w-5 h-5 text-mineral-green-700" />
          <div>
            <span className="text-slate-500 block text-[11px]">Última Comprobación</span>
            <span className="font-semibold text-slate-900">
              {lastPulseTime ? new Date(lastPulseTime).toLocaleTimeString() : 'En ejecución'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-mineral-green-700" />
          <div>
            <span className="text-slate-500 block text-[11px]">Regla de Quórum</span>
            <span className="font-semibold text-slate-900">70% de tolerancia</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
