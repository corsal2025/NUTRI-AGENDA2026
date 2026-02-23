const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local.bak-20260213-111706', 'utf8');

const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function run() {
  const { data, error } = await supabase.from('citas').select('*');
  console.log('citas count:', data?.length);
  const { data: config } = await supabase.from('configuraciones').select('*');
  console.log('configuraciones count:', config?.length);
  const { data: perfiles } = await supabase.from('perfiles').select('id, nombre_completo, rol');
  console.log('perfiles:', perfiles);
}
run();
