"use client";

import { useEffect, useState } from "react";
import { Search, UserCircle2, ChevronRight, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function EvaluateSelectPage() {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [patients, setPatients] = useState<any[]>([]);

    useEffect(() => {
        async function fetchPatients() {
            setLoading(true);
            const supabase = createClient();
            const { data } = await supabase
                .from("perfiles")
                .select("*")
                .eq("rol", "paciente")
                .order("nombre_completo", { ascending: true });

            if (data) setPatients(data);
            setLoading(false);
        }
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p =>
        p.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 lg:p-8 space-y-12 max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="text-center space-y-4">
                <div className="size-16 rounded-[2rem] bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mx-auto border border-fuchsia-100 mb-6">
                    <Activity size={32} />
                </div>
                <h1 className="text-4xl font-bold font-serif text-gray-900">Seleccionar Paciente</h1>
                <p className="text-gray-500 font-medium max-w-lg mx-auto">
                    Busca al paciente en tu base de datos para iniciar una nueva evaluación antropométrica profesional.
                </p>
            </header>

            <div className="relative group max-w-2xl mx-auto">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-gray-300 group-focus-within:text-fuchsia-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Escribe el nombre del paciente..."
                    className="w-full pl-16 pr-8 py-6 bg-white border border-gray-100 rounded-[2.5rem] text-lg font-bold text-gray-900 shadow-sm focus:ring-8 focus:ring-fuchsia-500/5 transition-all outline-none placeholder:text-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {loading ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-10 h-10 border-4 border-fuchsia-100 border-t-fuchsia-600 rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-400 font-bold text-sm">Consultando directorio...</p>
                        </div>
                    ) : filteredPatients.length > 0 ? (
                        filteredPatients.map((p, idx) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                            >
                                <Link
                                    href={`/dashboard/evaluate/${p.id}`}
                                    className="flex items-center justify-between p-6 bg-white rounded-[2.5rem] border border-gray-100 hover:border-fuchsia-200 hover:shadow-xl hover:shadow-fuchsia-500/5 transition-all group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-gray-300 group-hover:bg-fuchsia-50 group-hover:text-fuchsia-500 transition-colors border border-gray-50">
                                            <UserCircle2 size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 uppercase tracking-tight">{p.nombre_completo}</h3>
                                            <p className="text-xs font-black text-gray-300 uppercase tracking-widest mt-0.5">{p.email}</p>
                                        </div>
                                    </div>
                                    <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-gray-300 group-hover:bg-fuchsia-600 group-hover:text-white transition-all">
                                        <ChevronRight size={24} />
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-gray-200">
                            <h3 className="text-gray-400 font-bold">No se encontraron pacientes activos</h3>
                            <Link href="/dashboard/patients" className="text-fuchsia-600 font-black text-xs uppercase tracking-widest mt-4 inline-block hover:underline">
                                Ir al directorio →
                            </Link>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
