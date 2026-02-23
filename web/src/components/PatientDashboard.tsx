"use client";

import { motion } from "framer-motion";
import {
    Calendar,
    TrendingUp,
    CreditCard,
    ChevronRight,
    Activity,
    Clock,
    Target,
    ArrowUpRight
} from "lucide-react";
import { useRouter } from "next/navigation";

export function PatientDashboard({ profile, stats }: any) {
    const router = useRouter();

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gray-900 font-serif">
                    ¡Hola, {profile?.nombre_completo?.split(' ')[0] || 'Paciente'}!
                </h1>
                <p className="text-gray-500 font-medium">Aquí tienes un resumen de tu progreso nutricional.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Main Stats Area */}
                <div className="md:col-span-8 space-y-8">
                    {/* Next Appointment Card */}
                    <section className="bg-gradient-to-br from-fuchsia-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-fuchsia-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />

                        <div className="relative z-10 flex items-center gap-6">
                            <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <Calendar size={32} />
                            </div>
                            <div>
                                <p className="text-fuchsia-100 text-sm font-bold uppercase tracking-widest">Próximo Control</p>
                                <h3 className="text-2xl font-black mt-1">Lunes 24 de Febrero, 10:30</h3>
                                <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
                                    <Clock size={14} /> Faltan 2 días para tu cita
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/dashboard/agenda')}
                            className="relative z-10 bg-white text-fuchsia-600 px-8 py-4 rounded-2xl font-black text-sm shadow-lg hover:bg-fuchsia-50 transition-all active:scale-95 whitespace-nowrap"
                        >
                            VER AGENDA
                        </button>
                    </section>

                    {/* Progress Summary Grid */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Target size={24} />
                                </div>
                                <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg uppercase tracking-widest">-2.4 kg</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tu Peso Actual</p>
                                <h4 className="text-3xl font-black text-gray-900 tracking-tight">
                                    {stats?.weight || "--"} <span className="text-lg font-medium text-gray-400">kg</span>
                                </h4>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard/resultados')}
                                className="text-emerald-600 font-bold text-sm flex items-center gap-1 group"
                            >
                                Ver mi evolución <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="size-12 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center">
                                    <Activity size={24} />
                                </div>
                                <span className="text-[10px] font-black bg-fuchsia-50 text-fuchsia-600 px-2 py-1 rounded-lg uppercase tracking-widest">+1.2%</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Masa Muscular</p>
                                <h4 className="text-3xl font-black text-gray-900 tracking-tight">
                                    {stats?.mass_muscle_kg?.toFixed(1) || "--"} <span className="text-lg font-medium text-gray-400">kg</span>
                                </h4>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard/resultados')}
                                className="text-fuchsia-600 font-bold text-sm flex items-center gap-1 group"
                            >
                                Detalle por segmento <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </section>
                </div>

                {/* Sidebar Areas */}
                <div className="md:col-span-4 space-y-8">
                    {/* Payments / Membership */}
                    <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mb-16 -mr-16" />

                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-400 border border-white/10">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg leading-tight">Pagos y Plan</h4>
                                <p className="text-slate-400 text-xs font-medium">Mensualidad Activa</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Próximo Vencimiento</span>
                                <span className="font-bold">10 Mar, 2026</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[60%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/dashboard/pagos')}
                            className="w-full py-4 bg-white text-slate-900 font-black text-xs rounded-2xl hover:bg-slate-100 transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            Gestionar Pagos
                            <ArrowUpRight size={14} />
                        </button>
                    </section>

                    {/* Quick Tips or Message */}
                    <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
                        <div className="size-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">Tip del Día</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            "Recuerda hidratarte bien antes de tu sesión de entrenamiento de hoy. Intenta beber al menos 500ml de agua extra."
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
