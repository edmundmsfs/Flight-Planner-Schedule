import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { LOCAL_AIRPORTS } from '../utils/airports'

export function useAirports(session) {
  const [airports, setAirports] = useState(LOCAL_AIRPORTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    async function fetchAirports() {
      setLoading(true)
      const { data, error } = await supabase
        .from('airports')
        .select('*')
        .order('icao', { ascending: true })
      if (error) {
        console.warn('Airports fetch error, using local fallback:', error.message)
      }
      if (!cancelled && data && data.length > 0) {
        const merged = new Map()
        LOCAL_AIRPORTS.forEach(a => merged.set(a.icao, a))
        data.forEach(a => merged.set(a.icao, a))
        setAirports([...merged.values()])
      }
      if (!cancelled) setLoading(false)
    }
    fetchAirports()
    return () => { cancelled = true }
  }, [session])

  return { airports, loading }
}
