import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setInvoices(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const ch = supabase.channel('invoices-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, load)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [load])

  const createInvoice = async (payload) => {
    const { data, error } = await supabase.from('invoices').insert(payload).select().single()
    if (!error) load()
    return { data, error }
  }

  const updateInvoice = async (id, payload) => {
    const { data, error } = await supabase.from('invoices').update(payload).eq('id', id).select().single()
    if (!error) load()
    return { data, error }
  }

  const deleteInvoice = async (id) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (!error) load()
    return { error }
  }

  return { invoices, loading, error, load, createInvoice, updateInvoice, deleteInvoice }
}
