import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchAirlineRoutes, mergeWithStaticRoutes, getRealFlightsForRoute } from '../utils/airlabs'

export function useRealRoutes(airlineName, staticRoutes) {
  const [realRoutes, setRealRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    if (!airlineName) return

    const controller = new AbortController()
    abortRef.current = controller

    fetchAirlineRoutes(airlineName, { signal: controller.signal })
      .then(routes => {
        if (!controller.signal.aborted) {
          setError(null)
          setRealRoutes(routes)
          setLastFetched(new Date())
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [airlineName])

  const refetch = useCallback(async (airline) => {
    if (!airline) return
    setLoading(true)
    setError(null)
    try {
      const routes = await fetchAirlineRoutes(airline)
      setRealRoutes(routes)
      setLastFetched(new Date())
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const merged = staticRoutes.length > 0
    ? mergeWithStaticRoutes(realRoutes, staticRoutes)
    : realRoutes

  const getFlights = useCallback((fromIcao, toIcao) => {
    return getRealFlightsForRoute(realRoutes, fromIcao, toIcao)
  }, [realRoutes])

  return {
    realRoutes,
    mergedRoutes: merged,
    loading,
    error,
    lastFetched,
    refetch,
    getFlights,
    hasRealData: realRoutes.length > 0,
  }
}
