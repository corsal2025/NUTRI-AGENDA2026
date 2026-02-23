"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, Video, FileText, ChevronRight, Users, CheckCircle, Plus, X, Search } from "lucide-react";
import { appointmentService } from "@/services/appointmentService";
import { configService } from "@/services/configService";

export default function AdminAgendaPage() {
    const [citas, setCitas] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Data para el combobox
    const [patients, setPatients] = useState<any[]>([]);
    const [availabilityConfig, setAvailabilityConfig] = useState<any>({});

    useEffect(() => {
        fetchCitas();
        fetchPatientsAndConfig();
        fetchProfile();
    }, []);

    async function fetchProfile() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('perfiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
            if (data) setProfile(data);
        }
    }

    async function fetchCitas() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('citas')
            .select(`
                *,
                perfiles (
                    nombre_completo,
                    email,
                    telefono
                )
            `)
            .order('fecha_cita', { ascending: true })
            .order('hora_cita', { ascending: true });

        if (error) {
            console.error("Error fetching citas:", error);
        } else {
            setCitas(data || []);
        }
        setLoading(false);
    }

    async function fetchPatientsAndConfig() {
        const supabase = createClient();
        const { data: pats } = await supabase.from('perfiles').select('*').eq('rol', 'paciente');
        if (pats) setPatients(pats);

        const config = await configService.getConfig('availability');
        if (config) setAvailabilityConfig(config);
    }

    const citasDelDia = citas.filter(cita =>
        isSameDay(new Date(`${cita.fecha_cita}T00:00:00`), selectedDate)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <div className="flex flex-col space-y-2 mb-4">
                        {profile && (
                            <p className="text-fuchsia-600 font-bold tracking-wide">
                                ¡Hola, {profile.nombre_completo?.split(' ')[0]}!
                            </p>
                        )}
                        <h1 className="text-4xl font-bold text-gray-900 font-serif">
                            Agenda de Consultas
                        </h1>
                    </div>
                    <p className="text-gray-500 font-medium">
                        Administra tus reservas y revisa las próximas atenciones médicas.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-fuchsia-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-fuchsia-700 transition"
                >
                    <Plus size={20} /> Agendar Cita
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lateral Side: Minimapa Mes / Filtros */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 font-serif mb-6 flex items-center gap-2">
                            <Calendar className="text-fuchsia-600" /> Resumen de Hoy
                        </h3>

                        <div className="flex flex-col gap-4">
                            <div className="p-6 bg-fuchsia-50/50 rounded-3xl border border-fuchsia-100">
                                <p className="text-fuchsia-800 text-sm font-bold uppercase tracking-wide">Citas Programadas</p>
                                <p className="text-4xl font-black text-fuchsia-600 mt-2">{citasDelDia.length}</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-slate-600 text-sm font-bold uppercase tracking-wide">Pendientes de Pago</p>
                                <p className="text-4xl font-black text-slate-800 mt-2">
                                    {citasDelDia.filter(c => c.estado_pago === 'pendiente').length}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 mt-2">
                                <p className="text-sm font-bold text-gray-600 mb-2">Seleccionar Fecha Rápida:</p>
                                <input
                                    type="date"
                                    className="w-full p-3 rounded-xl border border-slate-200 text-gray-700"
                                    value={format(selectedDate, 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        if (e.target.value) setSelectedDate(new Date(e.target.value + 'T00:00:00'));
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Lista de Citas del Día */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 font-serif">
                            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                        </h2>
                    </div>

                    {citasDelDia.length > 0 ? (
                        <div className="space-y-4">
                            {citasDelDia.map(cita => (
                                <div key={cita.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row gap-6 relative overflow-hidden">
                                    {/* Indicador de estado */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${cita.estado_pago === 'pagado' ? 'bg-emerald-400' : 'bg-amber-400'}`} />

                                    <div className="flex flex-col justify-center items-center px-4 md:border-r border-gray-100 shrink-0">
                                        <p className="text-3xl font-black text-gray-900">
                                            {cita.hora_cita.substring(0, 5)}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            60 MIN
                                        </p>
                                    </div>

                                    <div className="flex-grow space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                    <Users size={18} className="text-fuchsia-500" />
                                                    {cita.perfiles?.nombre_completo || 'Paciente'}
                                                </h4>
                                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                    {cita.perfiles?.email || cita.id_paciente}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cita.estado_pago === 'pagado'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                }`}>
                                                {cita.estado_pago}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 pt-2 items-center">
                                            {cita.link_reunion && (
                                                <a href={cita.link_reunion} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
                                                    <Video size={14} /> Meet
                                                </a>
                                            )}
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                                                <FileText size={14} /> Ficha Médica
                                            </button>

                                            <div className="ml-auto px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                                                <span className="font-medium text-gray-400">Agendado por:</span> Administración
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center shrink-0">
                                        <button className="h-12 w-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-fuchsia-600 group-hover:text-white transition-all">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                            <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 shadow-sm border border-slate-100 mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="text-gray-900 font-bold text-lg">Día Despejado</h4>
                            <p className="text-gray-500 text-sm mt-1">No hay citas programadas para esta fecha.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-6 px-6 py-2 bg-fuchsia-50 text-fuchsia-600 font-bold rounded-xl hover:bg-fuchsia-100 transition"
                            >
                                Agendar una ahora
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Nueva Cita */}
            {isModalOpen && (
                <NewAppointmentModal
                    onClose={() => setIsModalOpen(false)}
                    patients={patients}
                    availabilityConfig={availabilityConfig}
                    onSuccess={() => {
                        fetchCitas();
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}

function NewAppointmentModal({ onClose, patients, availabilityConfig, onSuccess }: any) {
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [time, setTime] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    // Referencia para click outside dropdown
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredPatients = patients.filter((p: any) =>
        p.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generateTimeSlots = () => {
        const slots = [];
        for (let i = 8; i <= 18; i++) {
            const hour = i.toString().padStart(2, '0');
            slots.push(`${hour}:00`);
            slots.push(`${hour}:30`);
        }
        return slots;
    };

    const slots = generateTimeSlots();

    const handleSave = async () => {
        if (!selectedPatient) return alert("Selecciona un paciente");
        if (!date || !time) return alert("Selecciona fecha y hora");

        setSaving(true);
        try {
            await appointmentService.createAppointment({
                patient_id: selectedPatient.id,
                date_time: `${date}T${time}:00`,
                duration_minutes: 60,
                notes: notes
            });
            alert("Cita agendada exitosamente!");
            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert("Error agendando cita: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
                        <Calendar size={20} className="text-fuchsia-600" /> Nueva Cita
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Buscador Paciente con Autocompletado */}
                    <div className="space-y-2 relative" ref={dropdownRef}>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Paciente</label>
                        {!selectedPatient ? (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-100 focus:border-fuchsia-500 text-sm"
                                    placeholder="Escribe para buscar paciente..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                />
                                {showDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map((p: any) => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => {
                                                        setSelectedPatient(p);
                                                        setShowDropdown(false);
                                                    }}
                                                    className="p-3 hover:bg-fuchsia-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0"
                                                >
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-800">{p.nombre_completo}</p>
                                                        <p className="text-xs text-gray-500">{p.email}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-sm text-gray-500 text-center">No hay coincidencias</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 border border-fuchsia-200 bg-fuchsia-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-fuchsia-200 text-fuchsia-700 flex items-center justify-center font-bold text-xs">
                                        {selectedPatient.nombre_completo?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-fuchsia-900">{selectedPatient.nombre_completo}</p>
                                        <p className="text-xs text-fuchsia-600/70">{selectedPatient.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPatient(null)}
                                    className="text-fuchsia-400 hover:text-fuchsia-600 p-1"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500">Fecha</label>
                            <input
                                type="date"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:border-fuchsia-500 text-sm font-bold"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    setTime("");
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500">Hora</label>
                            <select
                                className="w-full p-3 border border-gray-200 rounded-xl focus:border-fuchsia-500 text-sm font-bold"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            >
                                <option value="">Selecciona</option>
                                {slots.length > 0 ? (
                                    slots.map((s: string) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))
                                ) : (
                                    <option value="" disabled>Sin horas disp. este día</option>
                                )}
                            </select>
                        </div>
                    </div>

                    {slots.length === 0 && (
                        <p className="text-xs text-rose-500 font-medium">⚠️ No hay horarios configurados de atención para este día.</p>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Notas u Observaciones (Opcional)</label>
                        <textarea
                            className="w-full p-3 border border-gray-200 rounded-xl focus:border-fuchsia-500 text-sm resize-none"
                            rows={3}
                            placeholder="Link de videollamada, motivo de consulta..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedPatient || !date || !time}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-fuchsia-600 text-white font-bold hover:bg-fuchsia-700 transition disabled:opacity-50"
                    >
                        {saving ? <div className="animate-spin size-4 border-2 border-white/40 border-t-white rounded-full"></div> : null}
                        {saving ? 'Guardando...' : 'Guardar Cita'}
                    </button>
                </div>
            </div>
        </div>
    );
}
