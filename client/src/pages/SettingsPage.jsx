import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Settings, Shield, RotateCcw, Save, AlertCircle } from 'lucide-react';

export function SettingsPage() {
  const [formData, setFormData] = useState({
    pingIntervalSec: 30,
    discoveryIntervalMin: 10,
    pingTimeoutMs: 3000,
    consecutiveFailuresForDown: 3,
    consecutiveSuccessesForUp: 2,
    maxConcurrentPings: 15
  });
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: configData, refetch } = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const { data } = await api.get('/config');
      return data.data;
    }
  });

  useEffect(() => {
    if (configData?.current) {
      setFormData(configData.current);
    }
  }, [configData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = {
        pingIntervalSec: Number(formData.pingIntervalSec),
        discoveryIntervalMin: Number(formData.discoveryIntervalMin),
        pingTimeoutMs: Number(formData.pingTimeoutMs),
        consecutiveFailuresForDown: Number(formData.consecutiveFailuresForDown),
        consecutiveSuccessesForUp: Number(formData.consecutiveSuccessesForUp),
        maxConcurrentPings: Number(formData.maxConcurrentPings)
      };

      await api.put('/config', payload);
      setMessage({ type: 'success', text: 'Parámetros actualizados satisfactoriamente.' });
      refetch();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al actualizar configuración.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('¿Restablecer los parámetros a los valores seguros predeterminados?')) {
      try {
        await api.post('/config/reset');
        setMessage({ type: 'success', text: 'Parámetros restablecidos a sus valores predeterminados.' });
        refetch();
      } catch (err) {
        setMessage({ type: 'error', text: 'Fallo al restablecer configuración.' });
      }
    }
  };

  const guardrails = configData?.guardrails || {};

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-mineral-green-700" />
          Configuración y Límites Seguros (Guardrails)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ajuste de parámetros del Escuadrón Centinela según especificación técnica (Sección 8.7)
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card
          title="Parámetros de Monitoreo ICMP y Concurrencia"
          subtitle="Ajustes vinculantes para el Daemon Ping Worker"
          actions={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Valores</span>
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Intervalo de Ping (segundos)
              </label>
              <input
                type="number"
                min={guardrails.PING_INTERVAL_MIN || 10}
                max={guardrails.PING_INTERVAL_MAX || 300}
                value={formData.pingIntervalSec}
                onChange={(e) => setFormData({ ...formData, pingIntervalSec: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Rango permitido: {guardrails.PING_INTERVAL_MIN || 10}s - {guardrails.PING_INTERVAL_MAX || 300}s
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Timeout de Sonda ICMP (milisegundos)
              </label>
              <input
                type="number"
                min={guardrails.PING_TIMEOUT_MIN || 1000}
                max={guardrails.PING_TIMEOUT_MAX || 10000}
                value={formData.pingTimeoutMs}
                onChange={(e) => setFormData({ ...formData, pingTimeoutMs: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Rango permitido: {guardrails.PING_TIMEOUT_MIN || 1000}ms - {guardrails.PING_TIMEOUT_MAX || 10000}ms
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fallos Consecutivos para DOWN (Histéresis)
              </label>
              <input
                type="number"
                min={guardrails.FAILURES_FOR_DOWN_MIN || 2}
                max={guardrails.FAILURES_FOR_DOWN_MAX || 10}
                value={formData.consecutiveFailuresForDown}
                onChange={(e) =>
                  setFormData({ ...formData, consecutiveFailuresForDown: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Umbral de confirmación de caída (Previene falsos positivos)
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Éxitos Consecutivos para UP
              </label>
              <input
                type="number"
                min={guardrails.SUCCESSES_FOR_UP_MIN || 1}
                max={guardrails.SUCCESSES_FOR_UP_MAX || 5}
                value={formData.consecutiveSuccessesForUp}
                onChange={(e) =>
                  setFormData({ ...formData, consecutiveSuccessesForUp: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Umbral para declarar restablecimiento del servicio
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Concurrencia Máxima de Pings (p-limit)
              </label>
              <input
                type="number"
                min={guardrails.MAX_CONCURRENT_PINGS_MIN || 5}
                max={guardrails.MAX_CONCURRENT_PINGS_MAX || 50}
                value={formData.maxConcurrentPings}
                onChange={(e) => setFormData({ ...formData, maxConcurrentPings: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Límite de hilos simultáneos (RNF-15: Valor estándar 15)
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Intervalo de Descubrimiento ARP (minutos)
              </label>
              <input
                type="number"
                min={guardrails.DISCOVERY_INTERVAL_MIN || 2}
                max={guardrails.DISCOVERY_INTERVAL_MAX || 60}
                value={formData.discoveryIntervalMin}
                onChange={(e) => setFormData({ ...formData, discoveryIntervalMin: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Frecuencia del escáner en segundo plano
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSaving}>
              <Save className="w-4 h-4" />
              <span>Guardar Parámetros Seguros</span>
            </Button>
          </div>
        </Card>
      </form>

      {/* Tarjeta Informativa de Estándares */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <Shield className="w-5 h-5 text-mineral-green-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900 block">
            Cumplimiento Normativo ISO/IEC 25010 y ISO/IEC 27001
          </span>
          <p className="mt-0.5 leading-relaxed">
            Las modificaciones en estos guardrails son auditadas de forma inmutable en MongoDB (RNF-08).
            Los valores límites impiden la sobrecarga del kernel de Linux y garantizan el cumplimiento de latencias menores a 2 segundos (RNF-01).
          </p>
        </div>
      </div>
    </div>
  );
}
