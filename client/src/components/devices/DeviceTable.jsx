import { AlertTriangle, EyeOff, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';
import { DeviceStatusBadge } from './DeviceStatusBadge';
import { CAPABILITY_LABELS, DEVICE_TYPE_LABELS } from '../../constants/devices';

export function DeviceTable({
  devices = [],
  isLoading = false,
  error = null,
  onRetry
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900 md:text-base">
          Dispositivos registrados
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {devices.length} equipo{devices.length === 1 ? '' : 's'} en el inventario
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Equipo</th>
              <th scope="col" className="px-5 py-3 font-semibold">IP</th>
              <th scope="col" className="px-5 py-3 font-semibold">Tipo</th>
              <th scope="col" className="px-5 py-3 font-semibold">Estado</th>
              <th scope="col" className="px-5 py-3 font-semibold">Monitoreo</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-3.5 w-48 rounded bg-slate-200" />
                      <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
                    </td>
                    <td className="px-5 py-4"><div className="h-3.5 w-24 rounded bg-slate-200" /></td>
                    <td className="px-5 py-4"><div className="h-3.5 w-20 rounded bg-slate-100" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-28 rounded-full bg-slate-200" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-24 rounded bg-slate-100" /></td>
                  </tr>
                ))
              : null}

            {!isLoading && error ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <AlertTriangle className="mx-auto h-7 w-7 text-red-400" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    No se pudo cargar el inventario
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{error.message}</p>
                  <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    Reintentar
                  </Button>
                </td>
              </tr>
            ) : null}

            {!isLoading && !error && devices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <Inbox className="mx-auto h-7 w-7 text-slate-300" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Todavía no hay dispositivos registrados
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Usa “Registrar dispositivo” para agregar el primero.
                  </p>
                </td>
              </tr>
            ) : null}

            {!isLoading && !error
              ? devices.map((device) => (
                  <tr key={device._id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-900">{device.name}</span>
                        {!device.isMonitorable ? (
                          <EyeOff
                            className="h-3.5 w-3.5 text-stone-400"
                            aria-label="Sin monitoreo directo"
                          />
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {device.location || 'Sin ubicación'}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-3">
                      {device.ipAddress ? (
                        <span className="font-mono text-xs text-slate-700">{device.ipAddress}</span>
                      ) : (
                        <span className="text-xs italic text-slate-400">Sin IP</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-600">
                      {DEVICE_TYPE_LABELS[device.type] ?? device.type}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3">
                      <DeviceStatusBadge status={device.status} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-3">
                      {device.isMonitorable ? (
                        <span className="text-xs font-semibold text-emerald-700">
                          {CAPABILITY_LABELS[device.monitoringCapability] ?? 'Activo'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600">
                          <EyeOff className="h-3 w-3" aria-hidden="true" />
                          No monitorizable
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DeviceTable;
