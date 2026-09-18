import { useQuery } from '@tanstack/react-query'
import { listDevices, getDevice, getDeviceSummary, type DeviceFilters } from '../services/devices'

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
