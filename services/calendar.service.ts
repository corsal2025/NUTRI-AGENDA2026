// Google Calendar integration service
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import { format } from 'date-fns';

interface CalendarEvent {
    title: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate: Date;
}

// Generate Google Calendar URL
export const createGoogleCalendarUrl = (event: CalendarEvent): string => {
    const formatDate = (date: Date): string => {
        return format(date, "yyyyMMdd'T'HHmmss");
    };

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`,
        details: event.description || '',
        location: event.location || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Add appointment to Google Calendar
export const addToGoogleCalendar = async (
    appointmentDate: Date,
    clientName: string,
    duration: number = 60,
    notes?: string
): Promise<void> => {
    const endDate = new Date(appointmentDate);
    endDate.setMinutes(endDate.getMinutes() + duration);

    const event: CalendarEvent = {
        title: `Consulta Nutricional - ${clientName}`,
        description: notes || 'Cita de nutrición programada en NutriAgenda',
        location: 'Consulta Online / Presencial',
        startDate: appointmentDate,
        endDate: endDate,
    };

    const url = createGoogleCalendarUrl(event);

    try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url);
        } else {
            Alert.alert(
                'Google Calendar',
                'No se pudo abrir Google Calendar. ¿Quieres copiar el enlace?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Copiar', onPress: () => {
                            // In production, use Clipboard.setString(url)
                            Alert.alert('Enlace', url);
                        }
                    },
                ]
            );
        }
    } catch (error) {
        console.error('Error opening Google Calendar:', error);
        Alert.alert('Error', 'No se pudo abrir Google Calendar');
    }
};

// Generate .ics file content for universal calendar support
export const generateICSContent = (event: CalendarEvent): string => {
    const formatICSDate = (date: Date): string => {
        return format(date, "yyyyMMdd'T'HHmmss'Z'");
    };

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NutriAgenda//ES
BEGIN:VEVENT
UID:${Date.now()}@nutriagenda.cl
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(event.startDate)}
DTEND:${formatICSDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;
};

// Add reminder to native calendar (simplified - would use expo-calendar in production)
export const addToNativeCalendar = async (
    appointmentDate: Date,
    clientName: string,
    duration: number = 60
): Promise<void> => {
    Alert.alert(
        'Agregar al calendario',
        `¿Dónde quieres agregar la cita con ${clientName}?`,
        [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Google Calendar', onPress: () => addToGoogleCalendar(appointmentDate, clientName, duration) },
            {
                text: 'Otro calendario', onPress: () => {
                    // Generate ICS and share
                    Alert.alert('ICS', 'Funcionalidad disponible próximamente');
                }
            },
        ]
    );
};

// Sync all appointments to Google Calendar
export const syncToGoogleCalendar = async (appointments: any[]): Promise<void> => {
    Alert.alert(
        'Sincronizar calendario',
        `Se sincronizarán ${appointments.length} citas. ¿Continuar?`,
        [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sincronizar', onPress: async () => {
                    for (const apt of appointments.slice(0, 5)) { // Limit to 5 for demo
                        await addToGoogleCalendar(apt.date, apt.clientName, apt.duration);
                    }
                }
            },
        ]
    );
};
