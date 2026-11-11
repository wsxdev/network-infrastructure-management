import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const DEVICES_KEY = ['devices'];

export function useDevices() {
  return useQuery({
    queryKey: DEVICES_KEY,
    queryFn: async () => {
      const { data } = await api.get('/devices');
      return data.data;
    }
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/devices', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICES_KEY });
    }
  });
}
