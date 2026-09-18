import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getDeviceThresholds,
  saveDeviceThresholds,
  type ThresholdInput,
} from '../services/alertThresholds'

export function useDeviceThresholds(deviceId: string | undefined) {
  return useQuery({
    queryKey: ['alert-thresholds', deviceId],
    queryFn: () => getDeviceThresholds(deviceId!),
    enabled: !!deviceId,
  })
}

export function useSaveDeviceThresholds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ deviceId, entries }: { deviceId: string; entries: ThresholdInput[] }) =>
      saveDeviceThresholds(deviceId, entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-thresholds'] })
    },
  })
}
