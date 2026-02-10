import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/callback`
)

export async function POST(req: NextRequest) {
    try {
        const { appointmentId, userId } = await req.json()

        const supabase = await createClient()

        // Get appointment details
        const { data: appointment } = await supabase
            .from('appointments')
            .select('*, perfiles(*)')
            .eq('id', appointmentId)
            .single()

        if (!appointment) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
        }

        // Get nutritionist's Google tokens
        const { data: nutritionist } = await supabase
            .from('perfiles')
            .select('google_access_token, google_refresh_token')
            .eq('rol', 'nutricionista')
            .single()

        if (!nutritionist?.google_access_token) {
            return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 })
        }

        // Set credentials
        oauth2Client.setCredentials({
            access_token: nutritionist.google_access_token,
            refresh_token: nutritionist.google_refresh_token
        })

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

        // Create event
        const event = {
            summary: `Consulta: ${appointment.perfiles.nombre_completo}`,
            description: `Consulta nutricional con ${appointment.perfiles.nombre_completo}`,
            start: {
                dateTime: appointment.fecha_hora,
                timeZone: 'America/Santiago',
            },
            end: {
                dateTime: new Date(new Date(appointment.fecha_hora).getTime() + 60 * 60 * 1000).toISOString(),
                timeZone: 'America/Santiago',
            },
            attendees: [
                { email: appointment.perfiles.email }
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 },
                ],
            },
        }

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            sendUpdates: 'all'
        })

        // Save event ID
        await supabase
            .from('appointments')
            .update({ google_event_id: response.data.id })
            .eq('id', appointmentId)

        return NextResponse.json({
            success: true,
            eventId: response.data.id,
            link: response.data.htmlLink
        })

    } catch (error: any) {
        console.error('Google Calendar Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
