import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSpaceWeather } from '../api/noaa'
import { useAuroraStore } from '../store/auroraStore'

const STALE_MS = 3 * 60 * 1000

/**
 * Polls NOAA SWPC and mirrors results into the Zustand store as shader uniforms.
 * staleTime 2–5 min — do not poll faster.
 */
export function useSpaceWeather() {
  const setWeather = useAuroraStore((s) => s.setWeather)
  const setPollingStatus = useAuroraStore((s) => s.setPollingStatus)
  const setLastError = useAuroraStore((s) => s.setLastError)

  const query = useQuery({
    queryKey: ['space-weather'],
    queryFn: ({ signal }) => fetchSpaceWeather(signal),
    staleTime: STALE_MS,
    refetchInterval: STALE_MS,
    retry: 2,
  })

  useEffect(() => {
    if (query.isLoading || query.isFetching) {
      setPollingStatus(query.isSuccess ? 'success' : 'loading')
    }
  }, [query.isLoading, query.isFetching, query.isSuccess, setPollingStatus])

  useEffect(() => {
    if (query.data) {
      setWeather(query.data)
      setPollingStatus('success')
      setLastError(null)
    }
  }, [query.data, setWeather, setPollingStatus, setLastError])

  useEffect(() => {
    if (query.isError) {
      setPollingStatus('error')
      setLastError(
        query.error instanceof Error ? query.error.message : 'Failed to fetch NOAA data',
      )
    }
  }, [query.isError, query.error, setPollingStatus, setLastError])

  useEffect(() => {
    if (query.isSuccess && query.isStale && !query.isFetching) {
      setPollingStatus('stale')
    }
  }, [query.isSuccess, query.isStale, query.isFetching, setPollingStatus])

  return query
}
