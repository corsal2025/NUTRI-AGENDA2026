import { AppointmentEmail } from '@/components/emails/AppointmentEmail';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Resend inside the handler to avoid build errors if key is missing
// const resend = new Resend(process.env.RESEND_API_KEY); // MOVED INSIDE

export async function POST(req: NextRequest) {
    try {
        const { patientEmail, patientName, date, time, type, nutritionistEmail } = await req.json();

        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY is not defined. Email sending skipped.');
            return NextResponse.json({ success: false, error: 'API Key missing' }, { status: 500 });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        // 1. Send email to Patient
        const dataPatient = await resend.emails.send({
            from: 'NutriAgenda <citas@resend.dev>', // Update this with your verified domain in production
            to: [patientEmail],
            subject: 'Confirmación de Cita - NutriAgenda',
            react: AppointmentEmail({ patientName, date, time, type }),
        });

        // 2. Send notification to Nutritionist (if email provided)
        if (nutritionistEmail) {
            await resend.emails.send({
                from: 'NutriAgenda System <system@resend.dev>',
                to: [nutritionistEmail],
                subject: `Nueva Cita Agendada: ${patientName}`,
                react: AppointmentEmail({ patientName, date, time: `${time} (Paciente: ${patientName})`, type }),
            });
        }

        return NextResponse.json({ success: true, data: dataPatient });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}
