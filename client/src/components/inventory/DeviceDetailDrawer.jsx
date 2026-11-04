import React from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { X, Zap, Clock, MapPin, Globe, Cpu, Server, Activity } from 'lucide-react';

export function DeviceDetailDrawer({ device, isOpen, onClose, onPing }) {
  if (!isOpen || !device) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Ficha de Dispositivo
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">{device.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6 flex-1 overflow-y-auto text-xs">
        {/* Status Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-slate-600 font-medium">Estado Operativo</span>
          <Badge status={device.status} />
        </div>

        {/* Latency & Connectivity */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
            Conectividad ICMP
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-2xs">
              <span className="text-slate-400 text-[10px] block">Tiempo de Respuesta</span>
              <span className="text-lg font-bold font-mono text-slate-900">
                {device.responseTimeMs ? `${device.responseTimeMs} ms` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-2xs">
              <span className="text-slate-400 text-[10px] block">Último Avistamiento</span>
              <span className="text-xs font-semibold text-slate-800">
                {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'Desconocido'}
              </span>
            </div>
          </div>

          {device.ipAddress && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => onPing && onPing(device)}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Ejecutar Sonda ICMP Manual</span>
            </Button>
          )}
        </div>

        {/* Network Specs */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
            Identificación de Red
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Dirección IPv4
              </span>
              <span className="font-mono font-semibold text-slate-800">
                {device.ipAddress || 'No configurada'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Dirección MAC
              </span>
              <span className="font-mono font-semibold text-slate-800">
                {device.macAddress || 'No detectada'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" /> Tipo de Dispositivo
              </span>
              <span className="font-semibold uppercase text-slate-800">{device.type}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Ubicación
              </span>
              <span className="font-medium text-slate-800">{device.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
