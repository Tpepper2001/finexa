import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const PENSION_RATE = 0.08
const TAX_RATE    = 0.075

serve(async (req) => {
  const { runId } = await req.json()
  const supabase  = createClient(SUPABASE_URL, SUPABASE_KEY)

  const { data: run }  = await supabase.from('payroll_runs').select('*').eq('id', runId).single()
  const { data: emps } = await supabase.from('employees').select('*').eq('org_id', run.org_id).eq('active', true)

  const entries = (emps || []).map(e => {
    const gross      = Number(e.salary_ngn)
    const pension    = gross * PENSION_RATE
    const tax        = gross * TAX_RATE
    const deductions = pension + tax
    return { run_id: runId, employee_id: e.id, gross, deductions }
  })

  await supabase.from('payroll_entries').insert(entries)
  await supabase.from('payroll_runs').update({ status: 'processed' }).eq('id', runId)

  return new Response(JSON.stringify({ processed: entries.length }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
