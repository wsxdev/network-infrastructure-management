import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { DeviceTable } from '../components/inventory/DeviceTable';
import { DeviceModal } from '../components/inventory/DeviceModal';
import { DeviceDetailDrawer } from '../components/inventory/DeviceDetailDrawer';
import { Button } from '../components/common/Button';
import { Plus, Server, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function InventoryPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: devicesResponse, isLoading, refetch } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data } = await api.get('/devices?limit=200');
      return data;
    },
    refetchInterval: 5000
  });

  const devices = devicesResponse?.data || [];

  const handleSaveDevice = async (formData, deviceId) => {
    if (deviceId) {
      await api.put(`/devices/${deviceId}`, formData);
    } else {
      await api.post('/devices', formData);
    }
    refetch();
    queryClient.invalidateQueries({ queryKey: ['topology'] });
    queryClient.invalidateQueries({ queryKey: ['kpis'] });
  };

  const handleDeleteDevice = async (device) => {
    if (
      window.confirm(
        `¿Confirmar baja lógica de "${device.name}"? Conforme a RF-02.04 se preservará el histórico sin eliminación física.`
      )
    ) {
      try {
        await api.delete(`/devices/${device._id}`);
        refetch();
        queryClient.invalidateQueries({ queryKey: ['topology'] });
        queryClient.invalidateQueries({ queryKey: ['kpis'] });
      } catch (err) {
        alert(err.response?.data?.message || 'Error al dar de baja el dispositivo.');
      }
    }
  };

  const handlePing = async (device) => {
    try {
      await api.post(`/devices/${device._id}/ping`);
      refetch();
    } catch (err) {
      console.error('Error al sondear:', err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Server className="w-5 h-5 text-mineral-green-700" />
            Inventario de Infraestructura
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro y administración de equipos de telecomunicaciones, servidores y terminales
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isLoading}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </Button>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingDevice(null);
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Dispositivo</span>
            </Button>
          )}
        </div>
      </div>

      <DeviceTable
        devices={devices}
        isLoading={isLoading}
        onEditDevice={(device) => {
          setEditingDevice(device);
          setIsModalOpen(true);
        }}
        onDeleteDevice={handleDeleteDevice}
        onPingDevice={handlePing}
        onSelectDevice={(device) => {
          setSelectedDevice(device);
          setIsDrawerOpen(true);
        }}
      />

      {isModalOpen && (
        <DeviceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDevice}
          device={editingDevice}
          availableParents={devices}
        />
      )}

      <DeviceDetailDrawer
        device={selectedDevice}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onPing={handlePing}
      />
    </div>
  );
}
