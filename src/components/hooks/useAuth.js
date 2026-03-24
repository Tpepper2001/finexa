import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getProfile } from '../lib/auth'

export function useAuth() {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) { setProfile(null); return }
    getProfile(session.user.id).then(({ data }) => setProfile(data))
  }, [session])

  return { session, profile, loading, supabase }
}
