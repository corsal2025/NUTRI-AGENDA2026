require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if(!serviceRoleKey) {
  console.log("No service role key found. Look in Supabase dashboard");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { data, error } = await supabase.auth.admin.updateUserById(
    'b7fd9b46-3d5c-4489-84b9-0b6b5fe3ba43',
    { password: 'NutriAgenda2026!' }
  )

  if (error) {
    console.error("Error updating user:", error);
  } else {
    console.log("Successfully reset password.");
  }
}
run();
