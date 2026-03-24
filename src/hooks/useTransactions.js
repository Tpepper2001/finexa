import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTransactions(limit = 50) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    setTransactions(data || [])
    setLoading(false)
  }, [limit])

  useEffect(() => {
    load()
    const ch = supabase.channel('transactions-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, load)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [load])

  const logTransaction = async (payload) => {
    const { data, error } = await supabase.from('transactions').insert(payload).select().single()
    if (!error) load()
    return { data, error }
  }

  return { transactions, loading, logTransaction, load }
}
