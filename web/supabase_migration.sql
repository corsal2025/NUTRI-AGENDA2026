-- Create table for subscription plans
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL, -- Storing as numeric for calculations
  price_display text, -- For display like "$24.990"
  period text DEFAULT '/mes',
  features text[] DEFAULT '{}',
  is_popular boolean DEFAULT false,
  description text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create table for global application settings (bank details, contact info)
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Policies for PLANS
CREATE POLICY "Public read access plans" ON public.plans FOR SELECT USING (active = true);
CREATE POLICY "Admin all access plans" ON public.plans FOR ALL USING (auth.role() = 'authenticated');

-- Policies for APP_CONFIG
CREATE POLICY "Public read access config" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Admin all access config" ON public.app_config FOR ALL USING (auth.role() = 'authenticated');

-- Create table for appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid REFERENCES auth.users(id),
  date_time timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies for APPOINTMENTS
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can create own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
-- Simplified admin policy (in production use a role check)
CREATE POLICY "Admin manage all appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');

-- Seed Features for Plans
INSERT INTO public.plans (name, price, price_display, period, features, is_popular, description)
VALUES 
('Básico', 24990, '$24.990', '/mes', ARRAY['Plan de alimentación personalizado','Evaluación antropométrica básica','Soporte por WhatsApp L-V','Rutina de ejercicios en casa'], false, 'Ideal para comenzar tu cambio'),
('Premium', 39990, '$39.990', '/mes', ARRAY['Todo lo del plan Básico','Análisis de composición corporal 3D','Seguimiento semanal detallado','Recetario exclusivo','Video llamada mensual 30min'], true, 'Nuestra opción más completa'),
('Trimestral', 99990, '$99.990', '/3 meses', ARRAY['Ahorro del 15% en total','Planificación a largo plazo','Suplementación deportiva guiada','Acceso a comunidad exclusiva'], false, 'Compromiso total con tu salud');

-- Seed Bank Details in APP_CONFIG
INSERT INTO public.app_config (key, value, description)
VALUES 
('bank_details', '{
  "bank": "Banco Santander",
  "account": "12.345.678-9",
  "type": "Cuenta Corriente",
  "rut": "15.678.901-2",
  "name": "Verónica Amaya",
  "email": "contacto@nutriveronica.cl"
}'::jsonb, 'Datos de transferencia bancaria'),
('contact_info', '{
  "whatsapp": "56962265626",
  "email": "contacto@nutriveronica.cl"
}'::jsonb, 'Información de contacto general'),
('availability', '{
  "monday": ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"],
  "tuesday": ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"],
  "wednesday": ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"],
  "thursday": ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"],
  "friday": ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00"],
  "saturday": [],
  "sunday": []
}'::jsonb, 'Configuración semanal de horarios disponibles');
