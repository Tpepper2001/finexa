import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useReceipts() {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase.from('receipts').select('*').order('date', { ascending: false })
    setReceipts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const uploadReceipt = async (file, meta = {}) => {
    setUploading(true)
    const path = `receipts/${Date.now()}_${file.name}`
    const { error: uploadErr } = await supabase.storage.from('receipts').upload(path, file)
    if (uploadErr) { setUploading(false); return { error: uploadErr } }

    const { error } = await supabase.from('receipts').insert({
      storage_path: path,
      merchant: meta.merchant || 'Uploaded',
      amount:   meta.amount   || 0,
      date:     meta.date     || new Date().toISOString().split('T')[0],
    })
    setUploading(false)
    if (!error) load()
    return { error }
  }

  const getPublicUrl = (storagePath) =>
    supabase.storage.from('receipts').getPublicUrl(storagePath).data.publicUrl

  return { receipts, loading, uploading, uploadReceipt, getPublicUrl, load }
}
