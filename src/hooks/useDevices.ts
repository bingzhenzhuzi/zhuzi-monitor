import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listDevices,
  getDevice,
  getDeviceSummary,
  createDevice,
  type DeviceFilters,
  type DeviceInput,
} from '../services/devices'

export function useDevices(filters: DeviceFilters = {}) {
  return useQuery({
    queryKey: ['devices', filters],
    queryFn: () => listDevices(filters),
  })
}

export function useDevice(id: string | undefined) {
  return useQuery({
    queryKey: ['device', id],
    queryFn: () => getDevice(id as string),
    enabled: Boolean(id),
  })
}

export function useDeviceSummary() {
  return useQuery({
    queryKey: ['device-summary'],
    queryFn: getDeviceSummary,
  })
}

export function useCreateDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DeviceInput) => createDevice(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['device-summary'] })
    },
  })
}
