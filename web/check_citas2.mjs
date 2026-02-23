import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function check() {
  const { data, error } = await supabase.from('citas').select('*')
  if (error) console.error(error)
  else console.log(data.length > 0 ? Object.keys(data[0]) : "No hay citas")
}

check()
