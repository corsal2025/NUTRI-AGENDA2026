const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local.bak-20260213-111706', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function run() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const { data, error } = await supabase.from('citas').insert([
    {
      id_paciente: '16a13d08-40f1-4fbe-abde-1ccf22603bbd',
      fecha_cita: dateStr,
      hora_cita: '10:00:00',
      estado_pago: 'pendiente'
    },
    {
      id_paciente: '69baa74b-254d-44f3-804b-4e96f27bb0b4',
      fecha_cita: dateStr,
      hora_cita: '15:30:00',
      estado_pago: 'pagado'
    }
  ]);

  if (error) {
    console.error("Error inserting citas:", error);
  } else {
    console.log("Successfully inserted appointments.");
  }
}
run();
