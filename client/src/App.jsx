import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Activity, ShieldCheck } from 'lucide-react';
import { DeviceInventoryPage } from './pages/DeviceInventoryPage';

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-6 shadow-xs">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mineral-green-700 text-white shadow-xs">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                ESPOCH NOC
              </span>
              <p className="text-[11px] font-medium text-slate-500">
                Laboratorio de Telecomunicaciones FIE
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Torre de Control Lista
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route path="/devices" element={<DeviceInventoryPage />} />
          <Route path="*" element={<Navigate to="/devices" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
