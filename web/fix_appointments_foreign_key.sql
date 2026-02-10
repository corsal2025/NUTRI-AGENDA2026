-- Fix Foreign Key Constraint for Appointments
-- This redirects the patient_id check to auth.users (authentication system) instead of public.patients

ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Ensure RLS allows the user to insert
DROP POLICY IF EXISTS "Users can create own appointments" ON public.appointments;
CREATE POLICY "Users can create own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

-- Force cache reload just in case
NOTIFY pgrst, 'reload schema';
