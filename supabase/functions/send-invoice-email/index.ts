import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const { invoiceId } = await req.json()
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, organizations(*)')
    .eq('id', invoiceId)
    .single()

  if (!invoice) return new Response('Invoice not found', { status: 404 })

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'invoices@finexa.ng',
      to:      invoice.client_email,
      subject: `Invoice from ${invoice.organizations.name}`,
      html:    `<p>Dear ${invoice.client_name},</p>
                <p>Please find your invoice for <strong>₦${Number(invoice.total_ngn).toLocaleString()}</strong>.</p>
                <p>Due date: ${invoice.due_date}</p>
                <p>— ${invoice.organizations.name}</p>`,
    }),
  })

  if (!res.ok) return new Response('Email failed', { status: 500 })

  await supabase.from('invoices').update({ status: 'sent' }).eq('id', invoiceId)

  return new Response(JSON.stringify({ sent: true }), { headers: { 'Content-Type': 'application/json' } })
})
