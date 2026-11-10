import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Search, Filter, RefreshCw, Edit, Trash2, Zap, MoreVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function DeviceTable({
  devices = [],
  isLoading = false,
  onEditDevice,
  onDeleteDevice,
  onPingDevice,
  onSelectDevice
}) {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredDevices = devices.filter((device) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      device.name?.toLowerCase().includes(term) ||
      (device.ipAddress && device.ipAddress.includes(searchTerm)) ||
      (device.macAddress && device.macAddress.toLowerCase().includes(term)) ||
      (device.vendor && device.vendor.toLowerCase().includes(term)) ||
      (device.fabricante && device.fabricante.toLowerCase().includes(term)) ||
      (device.model && device.model.toLowerCase().includes(term)) ||
      (device.modelo && device.modelo.toLowerCase().includes(term)) ||
      (device.location && device.location.toLowerCase().includes(term)) ||
      (device.ubicacion && device.ubicacion.toLowerCase().includes(term));

    const matchesStatus = statusFilter === '' || device.status === statusFilter;
    const matchesType = typeFilter === '' || device.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, IP, MAC, fabricante, modelo o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-mineral-green-500/20 focus:border-mineral-green-600 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-mineral-green-600"
          >
            <option value="">Todos los Estados</option>
            <option value="up">Disponible (UP)</option>
            <option value="down">No Disponible (DOWN)</option>
            <option value="unreachable">Inaccesible</option>
            <option value="pending">Pendiente</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-mineral-green-600"
          >
            <option value="">Todos los Tipos</option>
            <option value="router">Router</option>
            <option value="switch">Switch</option>
            <option value="server">Servidor</option>
            <option value="workstation">Estación / PC</option>
            <option value="ap">Access Point</option>
            <option value="other">Otro</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Dispositivo</th>
                <th className="py-3 px-4">Dirección IP</th>
                <th className="py-3 px-4">Dirección MAC</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Latencia</th>
                <th className="py-3 px-4">Ubicación</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    Cargando inventario de infraestructura...
                  </td>
                </tr>
              ) : filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No se encontraron dispositivos con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr
                    key={device._id}
                    onClick={() => onSelectDevice && onSelectDevice(device)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>
                        <span>{device.name}</span>
                        {(device.vendor || device.model) && (
                          <span className="text-[10px] text-slate-500 block font-normal">
                            {[device.vendor, device.model].filter(Boolean).join(' - ')}
                          </span>
                        )}
                        {device.parentId && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Padre: {device.parentId.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">{device.ipAddress || (device.isManaged === false ? 'Sin IP' : '—')}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{device.macAddress || '—'}</td>
                    <td className="py-3 px-4 uppercase font-semibold text-slate-500 text-[10px]">
                      {device.type}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={device.status} />
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {device.responseTimeMs !== null && device.responseTimeMs !== undefined
                        ? `${device.responseTimeMs} ms`
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{device.location}</td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {device.ipAddress && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onPingDevice(device)}
                            title="Sondear ICMP ahora"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                          </Button>
                        )}
                        {isAdmin && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEditDevice(device)}
                              title="Editar dispositivo"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteDevice(device)}
                              title="Baja lógica (RF-02.04)"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-noc-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
