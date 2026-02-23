const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local.bak-20260213-111706', 'utf8');

const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: citas, error: errorCitas } = await supabase.from('citas').select('*, perfiles(*)');
  console.log("Citas in Supabase + Perfiles relation:", JSON.stringify(citas, null, 2), errorCitas);
}

run();
