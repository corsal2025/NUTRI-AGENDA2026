'use client';

import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { appointmentService, Appointment } from '../services/appointmentService';
import { configService } from '../services/configService';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { PaymentModal } from './PaymentModal';
import 'react-day-picker/dist/style.css';

// Custom styles to match the design system (Fuchsia Premium theme)
const css = `
  .rdp {
    --rdp-accent-color: #c026d3;
    --rdp-background-color: #fdf4ff;
    margin: 0 auto;
    width: fit-content;
  }
  .rdp-month {
    width: 100%;
  }
  .rdp-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 4px;
  }
  .rdp-day {
    width: 52px !important;
    height: 52px !important;
    border-radius: 12px !important;
    font-size: 0.95rem;
    font-weight: 600;
  }
  .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
    background-color: #c026d3 !important;
    color: white !important;
    box-shadow: 0 8px 15px -3px rgba(192, 38, 211, 0.3);
  }
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: #fdf4ff !important;
    color: #c026d3 !important;
    transform: scale(1.05);
  }
  .rdp-caption_label {
    font-size: 1.125rem;
    font-weight: 800;
    color: #0f172a;
    font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    text-transform: capitalize;
  }
`;

export function CalendarWidget() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [bookingTime, setBookingTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [availabilityConfig, setAvailabilityConfig] = useState<any>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [lastApptId, setLastApptId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            try {
                // Load parallel data
                const [apptData, configData] = await Promise.all([
                    appointmentService.getAppointments(),
                    configService.getConfig('availability')
                ]);

                setAppointments(apptData);
                setAvailabilityConfig(configData || {});
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Update available slots when selected date changes
    useEffect(() => {
        if (!selectedDate || !availabilityConfig) {
            setAvailableSlots([]);
            return;
        }

        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[selectedDate.getDay()];
        const daySlots = availabilityConfig[dayName] || [];

        // Filter out existing appointments
        const bookedTimes = appointments
            .filter(app => isSameDay(new Date(app.start_time), selectedDate))
            .map(app => format(new Date(app.start_time), 'HH:mm'));

        const freeSlots = daySlots.filter((slot: string) => !bookedTimes.includes(slot));
        setAvailableSlots(freeSlots);

        // Reset selected time if not valid or empty
        if (freeSlots.length > 0) {
            setBookingTime(freeSlots[0]);
        } else {
            setBookingTime('');
        }

    }, [selectedDate, availabilityConfig, appointments]);

    const handleBook = async () => {
        if (!selectedDate || !user || !bookingTime) return;

        // Construct date_time string
        const [hours, minutes] = bookingTime.split(':');
        const dateTime = new Date(selectedDate);
        dateTime.setHours(parseInt(hours), parseInt(minutes));

        try {
            const newAppt = await appointmentService.createAppointment({
                patient_id: user.id,
                date_time: dateTime.toISOString(),
                duration_minutes: 60,
                notes: "Consulta General",
            });

            setLastApptId(newAppt.id);
            setAppointments(prev => [...prev, newAppt]);

            const supabase = createClient();
            // Verificar si el usuario tiene un plan activo
            const { data: profile } = await supabase
                .from('perfiles')
                .select('plan_id')
                .eq('user_id', user.id)
                .single();

            if (!profile?.plan_id) {
                // Si no tiene plan, abrimos el modal informando que debe elegir uno
                setIsPaymentModalOpen(true);
            } else {
                alert('¡Cita agendada con éxito!');
            }
        } catch (error: any) {
            console.error(error);
            alert(`Error al agendar la cita: ${error.message || 'Inténtalo nuevamente.'}`);
        }
    };

    const selectedDayAppointments = appointments.filter(app =>
        selectedDate && isSameDay(new Date(app.start_time), selectedDate)
    );

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm">
            <style>{css}</style>

            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 font-serif">Calendario</h3>
                <p className="text-sm text-gray-500">Agenda tu próxima consulta</p>
            </div>

            <div className="flex justify-center w-full">
                <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={es}
                    showOutsideDays
                    modifiers={{
                        booked: appointments.map(a => new Date(a.start_time))
                    }}
                    modifiersStyles={{
                        booked: { fontWeight: '900', color: '#c026d3', textDecoration: 'underline' }
                    }}
                />
            </div>

            <div className="mt-6 border-t pt-4">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center justify-center gap-2">
                    <Clock size={16} />
                    {selectedDate ? format(selectedDate, 'dP MMMM, yyyy', { locale: es }) : 'Selecciona una fecha'}
                </h4>

                {/* Existing Appointments */}
                <div className="space-y-2 mb-4 max-w-xs mx-auto">
                    {loading ? (
                        <p className="text-sm text-gray-400 text-center">Cargando...</p>
                    ) : selectedDayAppointments.length > 0 ? (
                        selectedDayAppointments.map(app => (
                            <div key={app.id} className="text-[11px] p-2.5 bg-fuchsia-50 text-fuchsia-700 rounded-xl border border-fuchsia-100 font-bold text-center">
                                {format(new Date(app.start_time), 'HH:mm')} - {app.notes}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400 italic text-center">No hay citas agendadas para hoy.</p>
                    )}
                </div>

                {/* Booking Form */}
                {selectedDate && (
                    <div className="flex flex-col sm:flex-row gap-2 items-center justify-center mt-4">
                        {loading ? (
                            <div className="animate-pulse h-10 w-32 bg-slate-100 rounded-xl"></div>
                        ) : availableSlots.length > 0 ? (
                            <>
                                <select
                                    value={bookingTime}
                                    onChange={(e) => setBookingTime(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl block w-full sm:w-auto p-2.5 focus:ring-fuchsia-500 focus:border-fuchsia-500 text-center"
                                >
                                    {availableSlots.map(time => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleBook}
                                    disabled={!user || !bookingTime}
                                    className="text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:ring-4 focus:ring-fuchsia-200 font-bold rounded-xl text-sm px-6 py-2.5 focus:outline-none flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-fuchsia-100 w-full sm:w-auto transition-all active:scale-95"
                                >
                                    <Plus size={16} /> {user ? 'Agendar' : 'Inicia sesión'}
                                </button>
                            </>
                        ) : (
                            <p className="text-sm text-rose-500 font-bold bg-rose-50 px-4 py-2 rounded-xl text-center w-full">
                                Sin horarios disponibles
                            </p>
                        )}
                    </div>
                )}
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Asegura tu cita nutricional"
                planName={`Consulta: ${selectedDate ? format(selectedDate, 'dd/MM') : ''} ${bookingTime}`}
                planPrice={35000} // Precio base de consulta, ajustable
                appointmentId={lastApptId}
            />
        </div>
    );
}
