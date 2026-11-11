import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { Bell, Volume2, VolumeX, LogOut, ShieldCheck, Activity } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { activeAlertsCount, soundEnabled, setSoundEnabled } = useAlerts();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand & Metáfora Torre de Control */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-mineral-green-700 flex items-center justify-center text-white shadow-xs">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-base">ESPOCH NOC</span>
            <span className="text-[10px] font-semibold bg-mineral-green-100 text-mineral-green-800 px-1.5 py-0.5 rounded tracking-wide uppercase">
              Torre de Control
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Laboratorio de Telecomunicaciones FIE</p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Audio Mute/Unmute toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Silenciar alertas sonoras' : 'Activar alertas sonoras'}
          className={`p-2 rounded-lg border transition-colors ${
            soundEnabled
              ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Bell Alerts Counter */}
        <div className="relative">
          <div className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <Bell className="w-4 h-4" />
          </div>
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {activeAlertsCount > 99 ? '99+' : activeAlertsCount}
            </span>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* User Role Pill & Logout */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</span>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-mineral-green-700" />
              <span className="text-[10px] uppercase font-bold text-mineral-green-700 tracking-wider">
                {user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-2 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
