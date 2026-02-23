const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local.bak-20260213-111706', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Downgrading users 'Usuario Nuevo' to 'paciente'...");
  
  // Down grade 'Usuario Nuevo' (there are two of them from previous listing)
  const { data, error } = await supabase
    .from('perfiles')
    .update({ rol: 'paciente' })
    .match({ nombre_completo: 'Usuario Nuevo' })

  if (error) {
    console.error("Error updating users:", error);
  } else {
    console.log("Successfully downgraded users.", data);
  }
}
run();
