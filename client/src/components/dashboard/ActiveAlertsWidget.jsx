import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Check, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export function ActiveAlertsWidget({ alerts = [], onAlertAcknowledge }) {
  const handleAcknowledge = async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}/acknowledge`);
      if (onAlertAcknowledge) onAlertAcknowledge();
    } catch (err) {
      console.error('Error reconociendo alerta:', err);
    }
  };

  return (
    <Card
      title="Centro de Alarmas Activas"
      subtitle="Incidencias pendientes de atención operativa"
      actions={
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-mineral-green-700" />
          <span className="text-xs font-semibold text-slate-600">{alerts.length} activas</span>
        </div>
      }
    >
      {alerts.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          <p className="text-sm">No existen alarmas activas en la infraestructura.</p>
          <span className="text-xs text-slate-400 mt-1 block">La red opera dentro de parámetros normales.</span>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {alerts.map((alert) => (
            <div key={alert._id} className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge status={alert.severity} />
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{alert.title}</h4>
                </div>
                <p className="text-xs text-slate-600 break-words">{alert.message}</p>
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                  {alert.deviceId && <span>• Dispositivo: {alert.deviceId.name}</span>}
                </div>
              </div>

              {alert.status === 'abierta' && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="shrink-0 text-xs py-1"
                  onClick={() => handleAcknowledge(alert._id)}
                  title="Reconocer alerta"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Reconocer</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
