import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Lightweight query — just enough to keep the DB connection warm
  const { error } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)

  const status = error ? 'error' : 'ok'
  console.log(`[keep-alive] ${new Date().toISOString()} — ${status}`)

  return new Response(JSON.stringify({ status, timestamp: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
