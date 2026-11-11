import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, Server, Settings, ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { isAdmin } = useAuth();

  const navItems = [
    { name: 'Consola NOC', path: '/', icon: LayoutDashboard },
    { name: 'Topología', path: '/topology', icon: Network },
    { name: 'Inventario', path: '/inventory', icon: Server }
  ];

  if (isAdmin) {
    navItems.push({ name: 'Configuración', path: '/settings', icon: Settings });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
            Monitoreo
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-mineral-green-50 text-mineral-green-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Escuadrón Centinela Daemon Indicator */}
      <div className="p-4 border-t border-slate-100 m-2 rounded-xl bg-slate-50 border border-slate-200/60">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-800">Escuadrón Centinela</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Daemon ICMP autónomo activo (p-limit 15 hilos).
        </p>
      </div>
    </aside>
  );
}
