import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useSchedules(session) {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: true })
        .order('departure_time', { ascending: true })
      if (!cancelled) {
        if (fetchError) {
          console.warn('Schedules fetch error:', fetchError.message)
          setError(fetchError.message)
        }
        if (data) setSchedules(data)
        setLoading(false)
      }
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

  const deleteSchedule = useCallback(async (id) => {
    if (!session) return { error: 'Not authenticated' }
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)
    if (!error) {
      setSchedules(prev => prev.filter(s => s.id !== id))
    }
    return { error }
  }, [session])

  const updateSchedule = useCallback(async (id, updates) => {
    if (!session) return { error: 'Not authenticated' }
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    const { data, error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
    if (error) {
      console.warn('Schedule update failed (kept local):', error.message)
    } else if (data && data[0]) {
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...data[0] } : s))
    }
    return { error, data: data?.[0] }
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

  return { schedules, loading, error, addSchedules, deleteSchedulesByDate, deleteSchedule, updateSchedule, clearAll }
}
