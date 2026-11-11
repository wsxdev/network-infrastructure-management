import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';

export function useDevices(filters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['devices', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);

      const { data } = await api.get(`/devices?${params.toString()}`);
      return data;
    },
    // Sondeo controlado cada 5 segundos conforme a RNF-02
    refetchInterval: 5000,
    staleTime: 4000
  });

  useEffect(() => {
    const socket = getSocket();

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      queryClient.invalidateQueries({ queryKey: ['topology'] });
    };

    socket.on('device:statusChanged', invalidate);
    socket.on('device:discovered', invalidate);
    socket.on('daemon:cycleCompleted', invalidate);

    return () => {
      socket.off('device:statusChanged', invalidate);
      socket.off('device:discovered', invalidate);
      socket.off('daemon:cycleCompleted', invalidate);
    };
  }, [queryClient]);

  return query;
}
