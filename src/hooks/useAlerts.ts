import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listAlerts,
  getAlertSummary,
  getRecentAlerts,
  resolveAlert,
  type AlertFilters,
} from '../services/alerts'

export function useAlerts(filters: AlertFilters = {}) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => listAlerts(filters),
  })
}

export function useAlertSummary() {
  return useQuery({
    queryKey: ['alert-summary'],
    queryFn: getAlertSummary,
  })
}

export function useRecentAlerts(limit = 8) {
  return useQuery({
    queryKey: ['recent-alerts', limit],
    queryFn: () => getRecentAlerts(limit),
  })
}

export function useResolveAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, remark }: { id: string; remark: string }) => resolveAlert(id, remark),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alert-summary'] })
      queryClient.invalidateQueries({ queryKey: ['recent-alerts'] })
    },
  })
}
