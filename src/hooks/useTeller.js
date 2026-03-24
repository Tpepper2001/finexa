import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTeller() {
  const [entries, setEntries]   = useState([])
  const [session, setSession]   = useState(null)
  const [loading, setLoading]   = useState(true)

  const loadEntries = useCallback(async () => {
    const { data } = await supabase
      .from('teller_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setEntries(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadEntries() }, [loadEntries])

  const postEntry = async ({ amount, direction, note }) => {
    const { data, error } = await supabase
      .from('teller_entries')
      .insert({ amount, direction, note, session_id: session?.id || null })
      .select()
      .single()
    if (!error) loadEntries()
    return { data, error }
  }

  const totalCredit = entries.filter(e => e.direction === 'credit').reduce((s, e) => s + Number(e.amount), 0)
  const totalDebit  = entries.filter(e => e.direction === 'debit').reduce((s, e) => s + Number(e.amount), 0)

  return { entries, loading, session, postEntry, totalCredit, totalDebit }
}
