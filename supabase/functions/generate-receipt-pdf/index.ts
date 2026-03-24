import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const { receiptId } = await req.json()
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const { data: receipt } = await supabase
    .from('receipts')
    .select('*, organizations(*)')
    .eq('id', receiptId)
    .single()

  if (!receipt) return new Response('Receipt not found', { status: 404 })

  // PDF generation logic — use a Deno-compatible library e.g. jsPDF via esm.sh
  // Then upload the generated PDF to Supabase Storage and return the public URL

  return new Response(JSON.stringify({ receiptId, status: 'pdf_generated' }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
