import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac }   from 'https://deno.land/std@0.168.0/node/crypto.ts'

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY')!
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const body = await req.text()
  const sig  = req.headers.get('x-paystack-signature') || ''
  const hash = createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex')

  if (hash !== sig) return new Response('Unauthorized', { status: 401 })

  const event = JSON.parse(body)
  if (event.event !== 'charge.success') return new Response('Ignored', { status: 200 })

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const ref = event.data.reference

  await supabase.from('invoices').update({ status: 'paid' }).eq('reference', ref)
  await supabase.from('transactions').insert({
    type: 'invoice_payment',
    amount: event.data.amount / 100,
    direction: 'credit',
    reference: ref,
    description: `Paystack: ${event.data.customer.email}`,
  })

  return new Response('OK', { status: 200 })
})
