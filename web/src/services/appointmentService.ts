import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

export interface Appointment {
    id: string; // UUID
    patient_id: string;
    start_time: string; // Construido combinando fecha y hora de BD para que Frontend funcione
    notes?: string;     // Vamos a usar esto en DB si lo agregamos, o dejarlo out
    status: string;     // viene de estado_pago / estado_cita
}

export const appointmentService = {
    async getAppointments(): Promise<Appointment[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('citas')
            .select('*');

        if (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }

        // Mapear de esquema BD a esquema Frontend
        const mappedData: Appointment[] = (data || []).map((cita: any) => {
            const startStr = `${cita.fecha_cita}T${cita.hora_cita}`;
            return {
                id: cita.id,
                patient_id: cita.id_paciente,
                start_time: startStr,
                end_time: startStr, // placeholder
                notes: cita.link_reunion || 'Consulta',
                status: cita.estado_pago
            };
        });

        return mappedData;
    },

    async createAppointment(appointmentData: { patient_id: string, date_time: string, duration_minutes: number, notes?: string }): Promise<Appointment> {
        const supabase = createClient();

        const startTime = new Date(appointmentData.date_time);
        const fecha = format(startTime, 'yyyy-MM-dd');
        const hora = format(startTime, 'HH:mm:ss');

        const citaToSave = {
            id_paciente: appointmentData.patient_id,
            fecha_cita: fecha,
            hora_cita: hora,
            estado_pago: 'pendiente',
            link_reunion: appointmentData.notes
            // id_sucursal omitido temporalmente o podríamos fetchear una
        };

        const { data, error } = await supabase
            .from('citas')
            .insert([citaToSave])
            .select()
            .single();

        if (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }

        const startStr = `${data.fecha_cita}T${data.hora_cita}`;
        const newAppt: Appointment = {
            id: data.id,
            patient_id: data.id_paciente,
            start_time: startStr,
            status: data.estado_pago,
            notes: data.link_reunion
        };

        return newAppt;
    }
};
