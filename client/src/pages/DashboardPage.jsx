import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { MetricKpiCard } from '../components/dashboard/MetricKpiCard';
import { ActiveAlertsWidget } from '../components/dashboard/ActiveAlertsWidget';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { DaemonHealthCard } from '../components/dashboard/DaemonHealthCard';
import { Server, CheckCircle2, XCircle, Unlink, Activity, Clock } from 'lucide-react';

export function DashboardPage() {
  const queryClient = useQueryClient();

  // KPIs de monitoreo con actualización controlada cada 5 segundos (RNF-02)
  const { data: kpiData } = useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      const { data } = await api.get('/metrics/kpis');
      return data.data;
    },
    refetchInterval: 5000
  });

  // Alertas activas
  const { data: alertsData, refetch: refetchAlerts } = useQuery({
    queryKey: ['active-alerts'],
    queryFn: async () => {
      const { data } = await api.get('/alerts?status=abierta&limit=20');
      return data.data;
    },
    refetchInterval: 5000
  });

  // Eventos recientes de red
  const { data: eventsData } = useQuery({
    queryKey: ['recent-events'],
    queryFn: async () => {
      const { data } = await api.get('/metrics/events?limit=15');
      return data.data;
    },
    refetchInterval: 5000
  });

  const kpis = kpiData || {
    totalDevices: 0,
    upCount: 0,
    downCount: 0,
    unreachableCount: 0,
    availabilityPct: 100,
    avgResponseTimeMs: 0
  };

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Torre de Control NOC
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Visión unificada del estado operativo de los equipos y enlaces del laboratorio
        </p>
      </div>

      {/* Grid de KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricKpiCard
          title="Total Equipos"
          value={kpis.totalDevices}
          subtitle="Inventario activo"
          icon={Server}
          color="slate"
        />
        <MetricKpiCard
          title="Disponibles"
          value={kpis.upCount}
          subtitle="Respondiendo ICMP"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricKpiCard
          title="No Disponibles"
          value={kpis.downCount}
          subtitle="Caídas confirmadas"
          icon={XCircle}
          color="rose"
        />
        <MetricKpiCard
          title="Inaccesibles"
          value={kpis.unreachableCount}
          subtitle="Aislamiento por switch"
          icon={Unlink}
          color="amber"
        />
        <MetricKpiCard
          title="Disponibilidad"
          value={kpis.availabilityPct}
          unit="%"
          subtitle="SLA calculado"
          icon={Activity}
          color="primary"
        />
        <MetricKpiCard
          title="Latencia Media"
          value={kpis.avgResponseTimeMs}
          unit="ms"
          subtitle="RTT en equipos activos"
          icon={Clock}
          color="slate"
        />
      </div>

      {/* Grid Central: Alertas Activas y Eventos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveAlertsWidget
          alerts={alertsData || []}
          onAlertAcknowledge={() => {
            refetchAlerts();
            queryClient.invalidateQueries({ queryKey: ['alerts/stats'] });
          }}
        />

        <RecentActivityFeed events={eventsData || []} />
      </div>

      {/* Tarjeta de Salud del Daemon Centinela */}
      <DaemonHealthCard
        lastPulseTime={kpis.timestamp}
        monitoredCount={kpis.totalDevices}
      />
    </div>
  );
}
