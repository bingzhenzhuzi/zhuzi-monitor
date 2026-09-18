import { useQuery } from '@tanstack/react-query'
import {
  getSensorSeries,
  getHistoryData,
  getOnlineRateTrend,
  type HistoryQuery,
} from '../services/sensorData'

export function useSensorSeries(deviceId: string | undefined, hours: number, refetchInterval?: number) {
  return useQuery({
    queryKey: ['sensor-series', deviceId, hours],
    queryFn: () => getSensorSeries(deviceId as string, hours),
    enabled: Boolean(deviceId),
    refetchInterval,
  })
}

export function useHistoryData(query: HistoryQuery, enabled = true) {
  return useQuery({
    queryKey: ['history', query],
    queryFn: () => getHistoryData(query),
    enabled: enabled && query.deviceIds.length > 0,
  })
}

export function useOnlineRateTrend() {
  return useQuery({
    queryKey: ['online-rate-trend'],
    queryFn: getOnlineRateTrend,
  })
}
