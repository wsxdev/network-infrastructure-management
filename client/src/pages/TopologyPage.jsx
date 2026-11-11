import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { TopologyCanvas } from '../components/topology/TopologyCanvas';
import { DeviceDetailDrawer } from '../components/inventory/DeviceDetailDrawer';
import { Button } from '../components/common/Button';
import { RefreshCw, Network } from 'lucide-react';

export function TopologyPage() {
  const queryClient = useQueryClient();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: topologyData, isLoading, refetch } = useQuery({
    queryKey: ['topology'],
    queryFn: async () => {
      const { data } = await api.get('/devices/topology');
      return data.data;
    },
    refetchInterval: 5000
  });

  const handleSelectNode = (deviceData) => {
    setSelectedDevice(deviceData);
    setIsDrawerOpen(true);
  };

  const handlePing = async (device) => {
    try {
      await api.post(`/devices/${device.id || device._id}/ping`);
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
            <Network className="w-5 h-5 text-mineral-green-700" />
            Topología del Laboratorio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lienzo dinámico con diferenciación entre enlaces confirmados (físicos) e inferidos (lógicos)
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          isLoading={isLoading}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualizar Lienzo</span>
        </Button>
      </div>

      <TopologyCanvas
        initialNodes={topologyData?.nodes || []}
        initialEdges={topologyData?.edges || []}
        onSelectDevice={handleSelectNode}
      />

      <DeviceDetailDrawer
        device={selectedDevice}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onPing={handlePing}
      />
    </div>
  );
}
