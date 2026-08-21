import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [captainName, setCaptainName] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()
      if (cancelled) return
      if (error) {
        console.warn('Profile fetch error:', error.message)
        setCaptainName(session.user.email.split('@')[0])
        return
      }
      if (data?.full_name) {
        setCaptainName(data.full_name)
      } else {
        setCaptainName(session.user.email.split('@')[0])
      }
    }
    fetchProfile()
    return () => { cancelled = true }
  }, [session])

  const signIn = useCallback(async (email, password, fullName) => {
    setAuthLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthLoading(false)
      return { error }
    }
    if (fullName) {
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', data.user.id)
      setCaptainName(fullName)
    }
    setAuthLoading(false)
    return { error: null }
  }, [])

  const signUp = useCallback(async (email, password, fullName) => {
    setAuthLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setAuthLoading(false)
      return { error }
    }
    if (data?.user && fullName) {
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', data.user.id)
    }
    setAuthLoading(false)
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setCaptainName('')
  }, [])

  return { session, loading, authLoading, captainName, signIn, signUp, signOut }
}
