"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    User, Mail, Phone, Camera, Save, MapPin, Briefcase, Calendar,
    Clock, ChevronRight, Target, TrendingUp, Activity, Heart,
    Stethoscope, Moon, Droplets, Cigarette, Beer, History, Pill, Scissors, Baby, Settings, ShieldCheck,
    CreditCard, Lock, Building2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image";
import { configService, Plan, AppConfig } from "@/services/configService";
import clsx from "clsx";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        async function getProfile() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from("perfiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (data) {
                    setProfile({ ...data, email: user.email });
                } else {
                    setProfile({ id: user.id, email: user.email, rol: "paciente" });
                }
            } else {
                // Si no hay usuario (acceso sin clave), buscamos el perfil de Raúl (admin) por defecto
                const { data, error } = await supabase
                    .from("perfiles")
                    .select("*")
                    .eq("rol", "admin")
                    .single();

                if (data) {
                    setProfile(data);
                } else {
                    // Fallback extremo si ni el admin existe
                    setProfile({ nombre_completo: "Administrador", rol: "admin" });
                }
            }
            setLoading(false);
        }
        getProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) return null;

    if (profile.rol === 'admin') {
        return <AdminProfileView profile={profile} setProfile={setProfile} />;
    }

    return <PatientProfileView profile={profile} />;
}

// ------------------------------------------------------------------------------------------
// ADMIN VIEW - DISEÑO ORIGINAL RESTAURADO (+ TABS AGENDA/PERFIL Y DATOS DE VERÓNICA)
// ------------------------------------------------------------------------------------------
function AdminProfileView({ profile, setProfile }: { profile: any, setProfile: any }) {
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");

    const [availability, setAvailability] = useState<any>({
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
    });
    const [selectedDayTab, setSelectedDayTab] = useState("monday");

    const [plans, setPlans] = useState<Plan[]>([]);
    const [bankDetails, setBankDetails] = useState<AppConfig['bank_details']>({
        bank: "",
        account: "",
        type: "",
        rut: "",
        name: "",
        email: ""
    });

    const daysOfWeek = [
        { id: "monday", label: "Lun" }, { id: "tuesday", label: "Mar" }, { id: "wednesday", label: "Mié" },
        { id: "thursday", label: "Jue" }, { id: "friday", label: "Vie" }, { id: "saturday", label: "Sáb" },
        { id: "sunday", label: "Dom" }
    ];

    // Horas disponibles para configurar: de 08:00 a 20:00 cada 30 min
    const allPossibleTimeSlots = [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
        "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
    ];

    // Por defecto mostramos de 08:00 a 18:00 si no hay configuración, o los que ella ya tenga elegidos
    const [timeSlots, setTimeSlots] = useState<string[]>([
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
        "16:00", "17:00", "18:00"
    ]);

    const dayLabels: { [key: string]: string } = {
        monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves',
        friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo'
    };

    useEffect(() => {
        async function fetchAvailAndPlans() {
            const availData = await configService.getConfig('availability');
            if (availData) setAvailability(availData);

            const plansData = await configService.getPlans();
            if (plansData) setPlans(plansData);

            const bankData = await configService.getConfig('bank_details');
            if (bankData) setBankDetails(bankData);

            // Si el perfil de admin no tiene su nombre, le ponemos los datos de Verónica por defecto para ayudar al onboarding
            if (!profile.nombre_completo || profile.nombre_completo === "Admin Nutri-Agenda") {
                setProfile((prev: any) => ({
                    ...prev,
                    nombre_completo: "Verónica Amaya",
                    especialidad: "Nutricionista Clínica",
                    ubicacion: "Consulta Online / Presencial",
                    telefono: "+56 9 1234 5678"
                }));
            }

            // Actualizar los timeSlots mostrados basados en lo que ella ya tiene guardado
            // (Si tiene guardado algo fuera del rango 8-18, lo incluimos en la vista)
            const allSavedSlots = new Set<string>();
            Object.values(availData || {}).forEach((daySlots: any) => {
                if (Array.isArray(daySlots)) {
                    daySlots.forEach(slot => allSavedSlots.add(slot));
                }
            });

            if (allSavedSlots.size > 0) {
                // Combinamos el set estándar con sus slots guardados para que aparezcan en el panel de edición
                const combined = Array.from(new Set([...timeSlots, ...Array.from(allSavedSlots)])).sort();
                setTimeSlots(combined);
            }
        }
        fetchAvailAndPlans();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const supabase = createClient();

            const { error: pError } = await supabase
                .from("perfiles")
                .update({
                    nombre_completo: profile.nombre_completo,
                    telefono: profile.telefono,
                    especialidad: profile.especialidad,
                    ubicacion: profile.ubicacion,
                })
                .eq("id", profile.id);

            if (pError) throw pError;

            if (plans.length > 0) {
                await Promise.all(plans.map(plan => configService.updatePlan(plan.id, plan)));
            }
            await configService.updateConfig('availability', availability);
            await configService.updateConfig('bank_details', bankDetails);



            alert("Perfil y configuración actualizados correctamente");
        } catch (error: any) {
            console.error(error);
            alert("Error al actualizar: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePlanUpdate = (index: number, field: keyof Plan, value: any) => {
        const newPlans = [...plans];
        newPlans[index] = { ...newPlans[index], [field]: value };
        setPlans(newPlans);
    };

    const toggleTimeSlot = (day: string, slot: string) => {
        setAvailability((prev: any) => {
            const currentSlots = prev[day] || [];
            const newSlots = currentSlots.includes(slot)
                ? currentSlots.filter((s: string) => s !== slot)
                : [...currentSlots, slot].sort();
            return { ...prev, [day]: newSlots };
        });
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-gray-900 font-serif">Ajustes de Perfil</h1>
                    <p className="text-gray-500 font-medium">Gestiona tu identidad digital y presencia en la plataforma.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 px-10 py-4 bg-fuchsia-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-lg shadow-fuchsia-100 hover:bg-fuchsia-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                    {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div> : <Save className="w-4 h-4" />}
                    GUARDAR CAMBIOS
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {/* Tabs Selector para Admin */}
                    <div className="flex p-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                        <TabButton id="personal" active={activeTab} onClick={setActiveTab} icon={User} label="Información General" />
                        <TabButton id="availability" active={activeTab} onClick={setActiveTab} icon={Calendar} label="Gestión de Agenda" />
                        <TabButton id="settings" active={activeTab} onClick={setActiveTab} icon={Settings} label="Configuración" />
                    </div>

                    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-12 relative overflow-hidden min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'personal' && (
                                <motion.div key="personal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                    <div className="border-l-4 border-fuchsia-500 pl-6 space-y-1">
                                        <h2 className="text-2xl font-bold text-gray-900 font-serif">Información Personal</h2>
                                        <p className="text-gray-400 font-medium text-sm">Tus datos básicos de contacto e identificación</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <ProfileInput label="Nombre Completo" value={profile.nombre_completo} onChange={(v: any) => setProfile({ ...profile, nombre_completo: v })} icon={<User />} />
                                        <ProfileInput label="Fecha de Registro" value={profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ""} disabled icon={<Calendar />} />
                                        <div className="md:col-span-2">
                                            <ProfileInput label="Email" value={profile.email} disabled icon={<Mail />} />
                                        </div>
                                        <ProfileInput label="Teléfono Móvil" value={profile.telefono} onChange={(v: any) => setProfile({ ...profile, telefono: v })} icon={<Phone />} />
                                    </div>

                                    <div className="pt-12 border-t border-slate-50 space-y-8">
                                        <div className="border-l-4 border-fuchsia-500 pl-6 space-y-1">
                                            <h2 className="text-2xl font-bold text-gray-900 font-serif">Detalles Profesionales</h2>
                                            <p className="text-gray-400 font-medium text-sm">Información visible para tus pacientes</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <ProfileInput label="Especialidad / Título" value={profile.especialidad} onChange={(v: any) => setProfile({ ...profile, especialidad: v })} icon={<Briefcase />} />
                                            <ProfileInput label="Ciudad / Ubicación" value={profile.ubicacion} onChange={(v: any) => setProfile({ ...profile, ubicacion: v })} icon={<MapPin />} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'availability' && (
                                <motion.div key="availability" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                    <div className="border-l-4 border-fuchsia-500 pl-6 space-y-1">
                                        <h2 className="text-2xl font-bold text-gray-900 font-serif">Disponibilidad Horaria Semanal</h2>
                                        <p className="text-gray-400 font-medium text-sm">Configura los bloques de atención haciendo clic en cada horario.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 shadow-sm bg-white">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/50">
                                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 sticky left-0 bg-slate-50 z-20 w-24">Horario</th>
                                                        {daysOfWeek.map(day => (
                                                            <th key={day.id} className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-600 border-b border-slate-100 min-w-[100px]">
                                                                {day.label}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {timeSlots.map((slot) => (
                                                        <tr key={slot} className="group hover:bg-fuchsia-50/10 transition-colors">
                                                            <td className="p-3 text-center border-b border-slate-50 sticky left-0 bg-white group-hover:bg-fuchsia-50/20 z-10">
                                                                <span className="text-[11px] font-black text-slate-500 bg-slate-100/50 px-2 py-1 rounded-lg">{slot}</span>
                                                            </td>
                                                            {daysOfWeek.map(day => {
                                                                const isActive = availability[day.id]?.includes(slot);
                                                                return (
                                                                    <td key={`${day.id}-${slot}`} className="p-1 border-b border-slate-50 text-center">
                                                                        <button
                                                                            onClick={() => toggleTimeSlot(day.id, slot)}
                                                                            className={clsx(
                                                                                "w-full py-3 rounded-xl text-[10px] font-bold transition-all border",
                                                                                isActive
                                                                                    ? "bg-[#c026d3] border-[#c026d3] text-white shadow-sm shadow-fuchsia-100"
                                                                                    : "bg-transparent border-transparent text-slate-300 hover:border-fuchsia-100 hover:text-fuchsia-400"
                                                                            )}
                                                                        >
                                                                            {isActive ? "ACTIVO" : "—"}
                                                                        </button>
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex flex-wrap gap-4 items-center justify-between p-6 bg-emerald-50/30 rounded-[2.5rem] border border-emerald-100">
                                            <div className="flex gap-4 items-center">
                                                <div className="size-10 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                                    <Clock size={20} />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-bold text-emerald-900">Vista de Grilla Activa</p>
                                                    <p className="text-[11px] text-emerald-600 font-medium">Haz clic en un bloque para activar o desactivar la disponibilidad.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {daysOfWeek.map(day => {
                                                    const hasSelected = availability[day.id]?.length > 0;
                                                    return (
                                                        <button
                                                            key={day.id}
                                                            onClick={() => {
                                                                setAvailability((prev: any) => ({
                                                                    ...prev,
                                                                    [day.id]: hasSelected ? [] : [...timeSlots]
                                                                }));
                                                            }}
                                                            title={`Activar/Desactivar todo el ${day.label}`}
                                                            className={clsx(
                                                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all border",
                                                                hasSelected ? "bg-fuchsia-600 border-fuchsia-600 text-white" : "bg-white border-slate-200 text-slate-400"
                                                            )}
                                                        >
                                                            {day.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Bloqueos Excepcionales Placeholder */}
                                        <div className="pt-10 border-t border-slate-100 space-y-6">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">Bloqueos Excepcionales</h3>
                                                    <p className="text-gray-500 text-xs">Añade excepciones para días puntuales (Ej: Vacaciones).</p>
                                                </div>
                                                <button className="flex items-center gap-2 px-4 py-2 bg-fuchsia-50 text-[#c026d3] rounded-xl text-xs font-bold hover:bg-fuchsia-100 transition-all border border-fuchsia-100">
                                                    <Calendar size={16} /> Bloquear Fecha
                                                </button>
                                            </div>
                                            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                                                <p className="text-sm text-gray-400 italic">Próximamente: Historial de bloqueos excepcionales activos.</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === 'settings' && (
                                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                    <div className="border-l-4 border-fuchsia-500 pl-6 space-y-1">
                                        <h2 className="text-2xl font-bold text-gray-900 font-serif">Configuración del Sistema</h2>
                                        <p className="text-gray-400 font-medium text-sm">Gestiona planes de precios y seguridad de tu cuenta.</p>
                                    </div>

                                    <div className="space-y-8">

                                        {/* Planes y Precios */}
                                        <div className="pt-8 border-t border-slate-100 space-y-6">
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <CreditCard size={18} className="text-fuchsia-500" /> Planes de Atención
                                            </h3>

                                            <div className="space-y-4">
                                                {plans.map((plan, index) => (
                                                    <div key={plan.id} className="p-6 border border-gray-100 rounded-[2rem] bg-slate-50 flex flex-wrap gap-4 items-start shadow-sm hover:border-fuchsia-200 transition-colors">
                                                        <div className="flex-1 min-w-[200px] space-y-1">
                                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nombre del Plan</label>
                                                            <input
                                                                type="text"
                                                                value={plan.name}
                                                                onChange={(e) => handlePlanUpdate(index, 'name', e.target.value)}
                                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-fuchsia-500"
                                                            />
                                                        </div>
                                                        <div className="w-32 space-y-1">
                                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">P. Visible</label>
                                                            <input
                                                                type="text"
                                                                value={plan.price_display}
                                                                onChange={(e) => handlePlanUpdate(index, 'price_display', e.target.value)}
                                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-fuchsia-500"
                                                            />
                                                        </div>
                                                        <div className="w-32 space-y-1">
                                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">P. Real</label>
                                                            <input
                                                                type="number"
                                                                value={plan.price}
                                                                onChange={(e) => handlePlanUpdate(index, 'price', Number(e.target.value))}
                                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-fuchsia-500"
                                                            />
                                                        </div>
                                                        <div className="w-full basis-full space-y-1">
                                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Descripción</label>
                                                            <textarea
                                                                value={plan.description || ''}
                                                                onChange={(e) => handlePlanUpdate(index, 'description', e.target.value)}
                                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 resize-none outline-none focus:border-fuchsia-500"
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Datos Bancarios para Pagos */}
                                        <div className="pt-8 border-t border-slate-100 space-y-6">
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 text-indigo-600">
                                                <Building2 size={18} /> Datos para Transferencias
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/30 p-8 rounded-[2.5rem] border border-indigo-100/50">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Banco</label>
                                                    <input
                                                        type="text"
                                                        value={bankDetails.bank}
                                                        onChange={(e) => setBankDetails({ ...bankDetails, bank: e.target.value })}
                                                        className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-gray-700 focus:border-indigo-500 outline-none"
                                                        placeholder="Ej: Banco Estado"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10_px] font-black uppercase tracking-widest text-indigo-400">Tipo de Cuenta</label>
                                                    <input
                                                        type="text"
                                                        value={bankDetails.type}
                                                        onChange={(e) => setBankDetails({ ...bankDetails, type: e.target.value })}
                                                        className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-gray-700 focus:border-indigo-500 outline-none"
                                                        placeholder="Ej: Cuenta Rut"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Número de Cuenta</label>
                                                    <input
                                                        type="text"
                                                        value={bankDetails.account}
                                                        onChange={(e) => setBankDetails({ ...bankDetails, account: e.target.value })}
                                                        className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-gray-700 focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">RUT Titular</label>
                                                    <input
                                                        type="text"
                                                        value={bankDetails.rut}
                                                        onChange={(e) => setBankDetails({ ...bankDetails, rut: e.target.value })}
                                                        className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-gray-700 focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Nombre Titular</label>
                                                    <input
                                                        type="text"
                                                        value={bankDetails.name}
                                                        onChange={(e) => setBankDetails({ ...bankDetails, name: e.target.value })}
                                                        className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-gray-700 focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Email Confirmación</label>
                                                    <input
                                                        type="email"
                                                        value={bankDetails.email}
                                                        onChange={(e) => setBankDetails({ ...bankDetails, email: e.target.value })}
                                                        className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-gray-700 focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="size-48 rounded-[2.5rem] bg-fuchsia-50 flex items-center justify-center text-fuchsia-200 border-8 border-slate-50 shadow-inner overflow-hidden relative">
                                <NextImage
                                    src="/veronica.png"
                                    alt="Verónica Amaya"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <button className="absolute -bottom-4 -right-4 p-4 bg-white text-fuchsia-600 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all z-10 border border-slate-100">
                                <Camera className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mt-8 space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                {profile.nombre_completo || 'Verónica Amaya'}
                            </h3>
                            <div className="flex flex-col items-center gap-2">
                                <span className="px-4 py-1.5 bg-fuchsia-50 text-fuchsia-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    Cuenta Administradora
                                </span>
                                <p className="text-gray-400 text-sm font-medium">{profile.especialidad || 'Nutricionista'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-start gap-4">
                        <div className="size-10 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <p className="text-emerald-800 font-bold text-sm">Información Profesional</p>
                            <p className="text-emerald-700/70 text-xs mt-0.5 leading-relaxed">
                                Esta información será visible en tus reportes generados y en la cabecera de tus planes de alimentación.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------------------------------
// PATIENT VIEW - MODO SOLO LECTURA BLOQUEADO
// ------------------------------------------------------------------------------------------
function PatientProfileView({ profile }: { profile: any }) {
    const [activeTab, setActiveTab] = useState("personal");
    const [stats, setStats] = useState<any>(null);
    const [habits, setHabits] = useState<any>({});
    const [medical, setMedical] = useState<any>({});
    const [family, setFamily] = useState<any>({});

    useEffect(() => {
        async function loadClinicalData() {
            const supabase = createClient();
            const [statsRes, habitsRes, medRes, famRes] = await Promise.all([
                supabase.from('antropometria').select('*').eq('patient_id', profile.id).order('date', { ascending: false }).limit(1),
                supabase.from('paciente_info').select('*').eq('patient_id', profile.id).single(),
                supabase.from('antecedentes_medicos').select('*').eq('patient_id', profile.id).single(),
                supabase.from('antecedentes_familiares').select('*').eq('patient_id', profile.id).single(),
            ]);

            if (statsRes.data && statsRes.data.length > 0) setStats(statsRes.data[0]);
            if (habitsRes.data) setHabits(habitsRes.data);
            if (medRes.data) setMedical(medRes.data);
            if (famRes.data) setFamily(famRes.data);
        }
        loadClinicalData();
    }, [profile.id]);

    const router = useRouter();

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-gray-900 font-serif">Mi Ficha Clínica</h1>
                    <p className="text-gray-500 font-medium">Consulta tu historial médico y hábitos de salud.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center">
                        <div className="relative group">
                            <div className="size-48 rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-inner bg-slate-100 flex items-center justify-center relative">
                                <NextImage src="https://placehold.co/400x400?text=Avatar" alt="Avatar" width={400} height={400} className="object-cover" />
                            </div>
                        </div>
                        <div className="mt-8 text-center space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">{profile.nombre_completo || 'Usuario'}</h3>
                            <div className="flex flex-col items-center gap-2">
                                <span className="px-4 py-1.5 bg-fuchsia-50 text-fuchsia-600 rounded-full text-[10px] font-black uppercase tracking-wider">Identidad Validada</span>
                                <p className="text-gray-400 text-sm font-medium">{profile.rut || 'Sin Identificación'}</p>
                            </div>
                        </div>
                    </div>

                    {stats && (
                        <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-100 space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <div className="relative z-10">
                                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Último Control</p>
                                <h4 className="text-xl font-black mt-1">Tu Estado Actual</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <p className="text-white/60 text-[10px] font-bold uppercase">Peso</p>
                                    <p className="text-xl font-black">{stats.weight} kg</p>
                                </div>
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <p className="text-white/60 text-[10px] font-bold uppercase">Músculo</p>
                                    <p className="text-xl font-black">{stats.mass_muscle_kg?.toFixed(1) || '--'} kg</p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard/resultados')}
                                className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <TrendingUp className="size-4" /> Ver mi evolución
                            </button>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-8 space-y-8">
                    <div className="flex p-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                        <TabButton id="personal" active={activeTab} onClick={setActiveTab} icon={User} label="Datos Básicos" />
                        <TabButton id="habits" active={activeTab} onClick={setActiveTab} icon={Activity} label="Hábitos" />
                        <TabButton id="medical" active={activeTab} onClick={setActiveTab} icon={Stethoscope} label="Ficha Médica" />
                    </div>

                    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-100 shadow-sm min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'personal' && (
                                <motion.div key="personal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                    <div className="border-l-4 border-fuchsia-500 pl-6 space-y-1">
                                        <h2 className="text-2xl font-bold text-gray-900 font-serif">Datos de Contacto</h2>
                                        <p className="text-gray-400 font-medium text-sm">Información esencial (Modificable en consulta por el nutricionista)</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <ProfileInput label="Nombre Completo" value={profile.nombre_completo} disabled={true} icon={<User />} />
                                        <ProfileInput label="RUT / Identificación" value={profile.rut} disabled={true} icon={<Target />} />
                                        <div className="md:col-span-2">
                                            <ProfileInput label="Email" value={profile.email} disabled={true} icon={<Mail />} />
                                        </div>
                                        <ProfileInput label="Teléfono Móvil" value={profile.telefono} disabled={true} icon={<Phone />} />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'habits' && (
                                <motion.div key="habits" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                    <div className="border-l-4 border-fuchsia-500 pl-6 space-y-1">
                                        <h2 className="text-2xl font-bold text-gray-900 font-serif">Estilo de Vida</h2>
                                        <p className="text-gray-400 font-medium text-sm">Hábitos registrados en tu evaluación nutricional.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <ProfileInput label="Edad Actual" value={habits.edad} disabled={true} icon={<Baby />} />
                                        <ProfileInput label="Ocupación" value={habits.ocupacion} disabled={true} icon={<Briefcase />} />
                                        <ProfileInput label="Horas de Sueño" value={habits.horas_sueno} disabled={true} icon={<Moon />} />
                                        <ProfileInput label="Consumo Agua (Lts)" value={habits.consumo_agua} disabled={true} icon={<Droplets />} />
                                        <div className="md:col-span-2">
                                            <ProfileInput label="Actividad Física" value={habits.actividad_fisica} disabled={true} icon={<Activity />} />
                                        </div>
                                        <div className="flex items-center gap-10 pt-4">
                                            <ClinialSwitch label="Fumador" active={habits.tabaco} onClick={() => { }} icon={Cigarette} disabled />
                                            <ClinialSwitch label="Bebe Alcohol" active={habits.alcohol} onClick={() => { }} icon={Beer} disabled />
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <ProfileTextArea label="Objetivo de consulta" value={habits.objetivo} disabled={true} />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'medical' && (
                                <motion.div key="medical" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                    <div className="space-y-8">
                                        <ProfileTextArea label="Patologías Diagnosticadas" value={medical.patologias} disabled={true} icon={<Stethoscope />} />
                                        <ProfileTextArea label="Medicamentos actuales" value={medical.medicamentos} disabled={true} icon={<Pill />} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <ProfileTextArea label="Cirugías Previas" value={medical.cirugias} disabled={true} icon={<Scissors />} />
                                            <ProfileTextArea label="Alergias Conocidas" value={medical.alergias} disabled={true} icon={<Activity />} />
                                        </div>
                                        <div className="pt-10 border-t border-slate-50 space-y-6">
                                            <div className="border-l-4 border-fuchsia-500 pl-6 space-y-1">
                                                <h2 className="text-2xl font-bold text-gray-900 font-serif">Antecedentes Familiares</h2>
                                                <p className="text-gray-400 font-medium text-sm">Factores genéticos hereditarios</p>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <ClinialSwitch label="Diabetes" active={family.diabetes} onClick={() => { }} disabled />
                                                <ClinialSwitch label="HTA" active={family.hta} onClick={() => { }} disabled />
                                                <ClinialSwitch label="Obesidad" active={family.obesidad} onClick={() => { }} disabled />
                                                <ClinialSwitch label="Cáncer" active={family.cancer} onClick={() => { }} disabled />
                                            </div>
                                            <ProfileTextArea label="Otros antecedentes" value={family.otros} disabled={true} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------------------------------
// SHARED UI COMPONENTS
// ------------------------------------------------------------------------------------------
function TabButton({ id, active, onClick, icon: Icon, label }: any) {
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={clsx(
                "flex items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shrink-0",
                isActive
                    ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-100"
                    : "text-gray-400 hover:text-gray-900 hover:bg-slate-50"
            )}
        >
            <Icon size={16} />
            <span>{label}</span>
        </button>
    );
}

function ClinialSwitch({ label, active, onClick, icon: Icon, disabled }: any) {
    return (
        <button
            onClick={disabled ? undefined : onClick}
            type="button"
            className={clsx(
                "flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm transition-all border shrink-0",
                active
                    ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-lg shadow-fuchsia-100"
                    : "bg-white text-gray-400 border-gray-100",
                disabled && "opacity-70 cursor-not-allowed"
            )}
        >
            {Icon && <Icon size={18} />}
            {label}
        </button>
    );
}

function ProfileTextArea({ label, value, disabled, placeholder, icon }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className={clsx("px-5 py-4 rounded-2xl border transition-all flex gap-4",
                disabled ? 'bg-slate-50 border-gray-100 opacity-80' : 'bg-white border-gray-200 focus-within:border-fuchsia-500'
            )}>
                {icon && <div className="text-gray-400 pt-1 shrink-0">{icon}</div>}
                <textarea
                    rows={3}
                    value={value || ""}
                    readOnly={disabled}
                    placeholder={placeholder}
                    className="flex-grow bg-transparent outline-none text-gray-900 text-sm font-bold placeholder:text-gray-300 resize-none"
                />
            </div>
        </div>
    );
}

function ProfileInput({ label, value, onChange, disabled, icon }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${disabled ? 'bg-slate-50 border-gray-100 opacity-80' : 'bg-white border-gray-200 focus-within:border-fuchsia-500 focus-within:ring-4 focus-within:ring-fuchsia-500/5'}`}>
                <div className="text-gray-400 shrink-0">
                    {icon}
                </div>
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={disabled}
                    readOnly={disabled}
                    className="flex-grow bg-transparent outline-none text-gray-900 text-sm font-bold placeholder:text-gray-300"
                />
            </div>
        </div>
    );
}
