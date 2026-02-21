"use client";

export const dynamic = 'force-dynamic'

import { motion } from "framer-motion";
import {
    Activity, Heart, Wind, Utensils, Target,
    TrendingUp, Calendar, ChevronRight, Search,
    Bell, Plus, User, BarChart2, Save, LogOut
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfessionalDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: p } = await supabase
                    .from('perfiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();
                setProfile(p);

                const { data: evals } = await supabase
                    .from('antropometria')
                    .select('*')
                    .eq('patient_id', user.id)
                    .order('date', { ascending: false })
                    .limit(1);

                if (evals && evals.length > 0) {
                    setStats(evals[0]);
                }
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-400 animate-pulse">Cargando tablero profesional...</p>
            </div>
        </div>
    );

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-serif">
                        Panel de Control
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Bienvenido, <span className="font-bold text-fuchsia-600">{profile?.nombre_completo || 'Nutricionista'}</span>.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-fuchsia-600 transition-colors">
                        <Bell size={20} />
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/evaluate')}
                        className="bg-fuchsia-600 text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-100 hover:bg-fuchsia-700 transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        Nueva Evaluación
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Activity}
                    label="Pacientes Activos"
                    value="42"
                    subtext="+3 esta semana"
                    color="fuchsia"
                />
                <StatCard
                    icon={Calendar}
                    label="Citas Pendientes"
                    value="8"
                    subtext="Hoy: 3 citas"
                    color="indigo"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Evolución Media"
                    value="1.4%"
                    subtext="Baja de grasa"
                    color="emerald"
                />
                <StatCard
                    icon={Heart}
                    label="Puntuación Médica"
                    value="98"
                    subtext="Índice de Salud"
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Side: Recent Evaluations & Clients */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 font-serif text-lg">Últimas Mediciones</h3>
                            <button className="text-fuchsia-600 text-sm font-bold flex items-center gap-1 hover:underline">
                                Ver todas <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="p-8">
                            <EvaluationTable stats={stats} />
                        </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
                            <div className="size-12 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center">
                                <BarChart2 size={24} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg">Analíticas Detalladas</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Accede a comparativas visuales, somatocartas evolutivas y proyecciones.
                            </p>
                            <button
                                onClick={() => router.push('/dashboard/statistics')}
                                className="text-fuchsia-600 font-bold text-sm flex items-center gap-1 group"
                            >
                                Explorar estadísticas <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
                            <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <User size={24} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg">Directorio de Pacientes</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Gestiona perfiles, historiales médicos y progresos.
                            </p>
                            <button
                                onClick={() => router.push('/dashboard/patients')}
                                className="text-emerald-600 font-bold text-sm flex items-center gap-1 group"
                            >
                                Gestionar pacientes <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </section>
                </div>

                {/* Right Side: Appointment Calendar & Profile */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Simplified Profile Section */}
                    <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                            <div className="size-20 rounded-3xl bg-slate-100 flex items-center justify-center text-gray-400 border-4 border-white shadow-lg overflow-hidden">
                                <User size={40} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg leading-tight">{profile?.nombre_completo || 'Verónica Amaya'}</h3>
                                <p className="text-fuchsia-600 font-bold text-xs uppercase tracking-widest mt-1">Nutricionista Clínica</p>
                            </div>
                            <div className="w-full pt-4 space-y-3 border-t border-gray-50">
                                <ProfileItem icon={Activity} label="Especialidad" value="Composición Corporal" />
                                <ProfileItem icon={Save} label="Registro" value="ISAK Nivel 1" />
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 text-gray-400 text-xs font-bold hover:text-red-500 transition-colors pt-2"
                            >
                                <LogOut size={14} /> Cerrar Sesión
                            </button>
                        </div>
                    </section>

                    {/* Compact Upcoming Appointments */}
                    <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 font-serif">Próximas Citas</h3>
                            <span className="text-[10px] font-black bg-slate-50 text-gray-400 px-2 py-1 rounded-lg uppercase tracking-widest">Hoy</span>
                        </div>
                        <div className="space-y-4">
                            <AppointmentItem time="10:30" name="Javier Ortega" type="Control Control" isFirst={false} />
                            <AppointmentItem time="11:45" name="Marcela Ruiz" type="Evaluación Inicial" isFirst={true} />
                            <AppointmentItem time="16:00" name="Roberto Gómez" type="Seguimiento" isFirst={false} />
                        </div>
                        <button className="w-full py-4 bg-slate-50 text-gray-600 font-bold rounded-2xl hover:bg-slate-100 transition-colors text-sm">
                            Ver Agenda Completa
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, subtext, color }: any) {
    const colorClasses: any = {
        fuchsia: "bg-fuchsia-50 text-fuchsia-600",
        indigo: "bg-indigo-50 text-indigo-600",
        emerald: "bg-emerald-50 text-emerald-600",
        rose: "bg-rose-50 text-rose-600"
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow cursor-default group">
            <div className={`size-12 rounded-2xl flex items-center justify-center ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <h4 className="text-2xl font-black text-gray-900 tracking-tight">{value}</h4>
                <p className="text-[10px] text-gray-500 font-medium mt-1">{subtext}</p>
            </div>
        </div>
    );
}

function EvaluationTable({ stats }: any) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <th className="pb-4">Fecha</th>
                        <th className="pb-4">Paciente</th>
                        <th className="pb-4">Peso</th>
                        <th className="pb-4">Masa Muscular</th>
                        <th className="pb-4">Grasa %</th>
                        <th className="pb-4 text-right">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    <tr className="group">
                        <td className="py-4 text-sm font-bold text-gray-700">09 Feb, 2026</td>
                        <td className="py-4 text-sm font-bold text-gray-900">Marcus Thorne (Yo)</td>
                        <td className="py-4 text-sm text-gray-600 font-medium">{stats?.weight || "72.4"} kg</td>
                        <td className="py-4 text-sm text-gray-600 font-medium">{stats?.mass_muscle_kg?.toFixed(1) || "38.2"} kg</td>
                        <td className="py-4">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stats?.mass_fat_pct?.toFixed(1) || "14.2"}%</span>
                        </td>
                        <td className="py-4 text-right">
                            <button className="p-2 text-gray-300 hover:text-fuchsia-600 transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </td>
                    </tr>
                    {/* Placeholder for more rows */}
                    {[1, 2].map((i) => (
                        <tr key={i} className="group opacity-40">
                            <td className="py-4 text-sm text-gray-400">08 Feb, 2026</td>
                            <td className="py-4 text-sm text-gray-400 italic">Datos de prueba - Historial</td>
                            <td className="py-4 text-sm text-gray-300">--</td>
                            <td className="py-4 text-sm text-gray-300">--</td>
                            <td className="py-4 text-sm text-gray-300">--</td>
                            <td className="py-4 text-right">
                                <ChevronRight size={18} className="text-gray-200 inline" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ProfileItem({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
                <Icon size={14} className="text-fuchsia-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-[10px] font-black text-gray-900">{value}</span>
        </div>
    );
}

function AppointmentItem({ time, name, type, isFirst }: any) {
    return (
        <div className="flex items-center gap-4 group cursor-pointer">
            <div className="text-sm font-black text-gray-900 w-12">{time}</div>
            <div className="flex-1 flex flex-col">
                <span className="text-sm font-bold text-gray-800 group-hover:text-fuchsia-600 transition-colors">{name}</span>
                <span className="text-[10px] text-gray-400 font-medium">{type}</span>
            </div>
            {isFirst && (
                <span className="text-[8px] font-black bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full uppercase">Nuevo</span>
            )}
        </div>
    );
}
