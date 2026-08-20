import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useSchedules(session) {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: true })
        .order('departure_time', { ascending: true })
      if (!cancelled && data) setSchedules(data)
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [session])

  const addSchedules = useCallback(async (legs) => {
    if (!session) return { error: 'Not authenticated' }
    const records = legs.map(leg => ({
      user_id: session.user.id,
      flight_number: leg.flightNumber,
      airline: leg.airline,
      departure: leg.departure,
      departure_city: leg.departureCity,
      arrival: leg.arrival,
      arrival_city: leg.arrivalCity,
      departure_time: leg.departureTime,
      arrival_time: leg.arrivalTime,
      block_time: leg.blockTime,
      distance: leg.distance,
      date: leg.date,
      status: leg.status,
    }))
    const { data, error: insertError } = await supabase.from('schedules').insert(records).select()
    if (!insertError && data) {
      setSchedules(prev => [...prev, ...data].sort((a, b) =>
        a.date.localeCompare(b.date) || a.departure_time.localeCompare(b.departure_time)
      ))
    }
    return { error: insertError, data }
  }, [session])

  const deleteSchedulesByDate = useCallback(async (dateStr) => {
    if (!session) return { error: 'Not authenticated' }
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('user_id', session.user.id)
      .eq('date', dateStr)
    if (!error) {
      setSchedules(prev => prev.filter(s => s.date !== dateStr))
    }
    return { error }
  }, [session])

  const clearAll = useCallback(async () => {
    if (!session) return { error: 'Not authenticated' }
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('user_id', session.user.id)
    if (!error) setSchedules([])
    return { error }
  }, [session])

  return { schedules, loading, addSchedules, deleteSchedulesByDate, clearAll }
}
