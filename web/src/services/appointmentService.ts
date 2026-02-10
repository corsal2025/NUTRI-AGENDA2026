import { createClient } from '@/utils/supabase/client';

export interface Appointment {
    id: string; // UUID
    patient_id: string;
    start_time: string; // ISO string (DB column: start_time)
    end_time: string;   // ISO string (DB column: end_time)
    notes?: string;
    status: string;
}

export const appointmentService = {
    async getAppointments(): Promise<Appointment[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('appointments')
            .select('*');

        if (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
        return data as Appointment[];
    },

    async createAppointment(appointmentData: { patient_id: string, date_time: string, duration_minutes: number, notes?: string }): Promise<Appointment> {
        const supabase = createClient();

        const startTime = new Date(appointmentData.date_time);
        const endTime = new Date(startTime.getTime() + appointmentData.duration_minutes * 60000);

        const appointmentToSave = {
            patient_id: appointmentData.patient_id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            notes: appointmentData.notes,
            status: 'scheduled'
        };

        const { data, error } = await supabase
            .from('appointments')
            .insert([appointmentToSave])
            .select()
            .single();

        if (error) {
            console.error('Error creating appointment full details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }

        // --- Send Email Notification ---
        try {
            // 1. Get current user (patient) details
            const { data: { user } } = await supabase.auth.getUser();
            const patientEmail = user?.email;
            const patientName = user?.user_metadata?.full_name || 'Paciente';

            // 2. Get Nutritionist Email from App Config
            const { data: config } = await supabase
                .from('app_config')
                .select('value')
                .eq('key', 'contact_info')
                .single();

            // value is JSONB, so we cast it or access it safely
            const configValue = config?.value as { email?: string } | null;
            const nutritionistEmail = configValue?.email;

            // 3. Call API
            if (patientEmail) {
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        patientEmail,
                        patientName,
                        date: startTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                        time: startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                        type: 'Consulta General', // Could be dynamic if we added type to params
                        nutritionistEmail
                    })
                });
            }
        } catch (emailError) {
            console.error('Error sending email notification (non-blocking):', emailError);
            // We do not throw here to avoid failing the appointment if just email fails
        }

        return data as Appointment;
    }
};
