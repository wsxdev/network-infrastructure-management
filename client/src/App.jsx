import React from 'react';
import { Activity, Server, ShieldCheck } from 'lucide-react';

export function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-mineral-green-700 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-base">ESPOCH NOC</span>
            <p className="text-[11px] text-slate-500 font-medium">Laboratorio de Telecomunicaciones FIE</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Torre de Control Lista
          </span>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs space-y-4 max-w-lg w-full">
          <div className="w-14 h-14 rounded-2xl bg-mineral-green-50 text-mineral-green-700 flex items-center justify-center mx-auto border border-mineral-green-100">
            <Server className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Sistema de Monitoreo y Administración de Redes
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Centro de Operaciones de Red (NOC) - Escuela Superior Politécnica de Chimborazo
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Estado del Repositorio:</span>
              <span className="text-mineral-green-700 font-bold">Limpio y Preparado</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Próximo Hito:</span>
              <span>Sprint 1 - Autenticación y Gestión de Usuarios</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
