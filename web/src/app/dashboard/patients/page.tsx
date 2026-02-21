"use client";

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react";
import {
    Users, Search, Filter, Plus, MoreHorizontal,
    Mail, Phone, Calendar, ArrowRight, UserPlus,
    Activity, ChevronRight, FileText
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export default function PatientsPage() {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [patients, setPatients] = useState<any[]>([]);
    const [view, setView] = useState<"grid" | "list">("list");

    useEffect(() => {
        async function fetchPatients() {
            setLoading(true);
            const supabase = createClient();

            // Fetch profiles with role 'paciente'
            const { data, error } = await supabase
                .from("perfiles")
                .select("*")
                .eq("rol", "paciente")
                .order("created_at", { ascending: false });

            if (data) {
                setPatients(data);
            }
            setLoading(false);
        }
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p =>
        p.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Actions Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-gray-900 font-serif">Directorio de Pacientes</h1>
                    <p className="text-gray-500 font-medium">Gestiona tu base de datos clínica y revisa historiales médicos.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-50 border border-gray-100 text-gray-600 font-bold text-sm hover:bg-slate-100 transition-colors">
                        <Filter className="size-4" />
                        Filtrar
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-fuchsia-600 text-white font-black text-sm shadow-lg shadow-fuchsia-100 hover:bg-fuchsia-700 hover:scale-105 active:scale-95 transition-all">
                        <UserPlus className="size-4" />
                        NUEVO PACIENTE
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MiniStat
                    label="Pacientes Totales"
                    value={patients.length.toString()}
                    icon={Users}
                    color="fuchsia"
                />
                <MiniStat
                    label="Nuevos este mes"
                    value="12"
                    icon={UserPlus}
                    color="indigo"
                />
                <MiniStat
                    label="Activos en Tratamiento"
                    value="34"
                    icon={Activity}
                    color="emerald"
                />
            </div>

            {/* Search & Organization Section */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-grow max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-300 group-focus-within:text-fuchsia-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o correo..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-fuchsia-500/5 transition-all placeholder:text-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <p className="text-xs font-black text-gray-300 uppercase tracking-widest hidden md:block">Vista:</p>
                        <div className="flex p-1 bg-slate-50 rounded-xl border border-gray-100">
                            <button
                                onClick={() => setView("list")}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === "list" ? "bg-white text-fuchsia-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Lista
                            </button>
                            <button
                                onClick={() => setView("grid")}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === "grid" ? "bg-white text-fuchsia-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Cuadrícula
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-fuchsia-100 border-t-fuchsia-600 rounded-full animate-spin"></div>
                            <p className="text-gray-400 font-bold text-sm">Cargando base de datos...</p>
                        </div>
                    ) : filteredPatients.length > 0 ? (
                        view === "list" ? (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-gray-50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Paciente</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contacto</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Última Cita</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <AnimatePresence>
                                        {filteredPatients.map((patient, idx) => (
                                            <motion.tr
                                                key={patient.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                                                            {patient.avatar_url ? (
                                                                <img src={patient.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Users className="size-6 text-fuchsia-200" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 group-hover:text-fuchsia-600 transition-colors uppercase text-sm tracking-tight">{patient.nombre_completo}</p>
                                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-0.5">ID: {patient.id.slice(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-gray-500">
                                                            <Mail className="size-3 text-fuchsia-400" />
                                                            <span className="text-xs font-medium">{patient.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-500">
                                                            <Phone className="size-3 text-emerald-400" />
                                                            <span className="text-xs font-medium">{patient.telefono || 'Sin teléfono'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                        Activo
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Calendar className="size-3" />
                                                        <span className="text-xs font-bold">{patient.created_at ? format(new Date(patient.created_at), "dd MMM, yyyy", { locale: es }) : '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/dashboard/evaluate/${patient.id}`}
                                                            className="p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-fuchsia-600 hover:border-fuchsia-100 transition-all shadow-sm"
                                                            title="Nueva Evaluación"
                                                        >
                                                            <Activity size={18} />
                                                        </Link>
                                                        <Link
                                                            href={`/dashboard/patients/${patient.id}`}
                                                            className="p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                                                            title="Ver Historial"
                                                        >
                                                            <FileText size={18} />
                                                        </Link>
                                                        <button className="p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                                                            <MoreHorizontal size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPatients.map((patient, idx) => (
                                    <motion.div
                                        key={patient.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-slate-50/50 rounded-3xl p-6 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="size-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                                                {patient.avatar_url ? (
                                                    <img src={patient.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="size-8 text-fuchsia-200" />
                                                )}
                                            </div>
                                            <button className="text-gray-300 hover:text-gray-600">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </div>
                                        <div className="mt-6 space-y-1">
                                            <h4 className="font-bold text-gray-900 group-hover:text-fuchsia-600 transition-colors uppercase text-sm tracking-tight">{patient.nombre_completo}</h4>
                                            <p className="text-xs text-gray-500 font-medium truncate">{patient.email}</p>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Peso Medio</span>
                                                <span className="text-sm font-bold text-gray-700">74.5 kg</span>
                                            </div>
                                            <Link
                                                href={`/dashboard/patients/${patient.id}`}
                                                className="size-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-fuchsia-600 group-hover:text-white group-hover:border-fuchsia-600 transition-all shadow-sm"
                                            >
                                                <ChevronRight size={20} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                            <div className="size-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-gray-300 border-4 border-white shadow-lg mb-6">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 font-serif">No se encontraron pacientes</h3>
                            <p className="text-gray-400 text-sm mt-1 max-w-xs">Intenta con otros términos de búsqueda o registra un nuevo paciente profesionalmente.</p>
                            <button className="mt-8 flex items-center gap-2 px-8 py-3 rounded-2xl bg-fuchsia-600 text-white font-bold text-sm shadow-lg shadow-fuchsia-100 hover:bg-fuchsia-700 transition-all">
                                <Plus size={18} />
                                Crear Primer Paciente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MiniStat({ label, value, icon: Icon, color }: any) {
    const colorClasses: any = {
        fuchsia: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 group hover:scale-[1.02] transition-transform">
            <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${colorClasses[color]}`}>
                <Icon className="size-5" />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest truncate">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
