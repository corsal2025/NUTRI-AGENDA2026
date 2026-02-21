"use client";

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HistoryTable } from "@/components/HistoryTable";
import { nutritionService, AnthropometryResult } from "@/services/nutritionService";
import { createClient } from "@/utils/supabase/client";
import { Loader2, RefreshCw, BarChart, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAdmin } from "@/hooks/useAdmin";

function HistoryContent() {
    const [records, setRecords] = useState<AnthropometryResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const patientIdParam = searchParams.get('patientId');
    const { isAdmin, loading: loadingAdmin } = useAdmin();

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError("No se pudo identificar al usuario.");
                return;
            }

            // Determine which ID to use
            let targetId = user.id;

            // If Admin and a patient is selected, use that ID
            if (isAdmin && patientIdParam) {
                targetId = patientIdParam;
            }

            const data = await nutritionService.getHistory(targetId);
            // Sort by date descending
            const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setRecords(sortedData);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al cargar el historial.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loadingAdmin) { // Wait for admin check to finish
            fetchData();
        }
    }, [isAdmin, loadingAdmin, patientIdParam]); // Re-fetch if these change

    return (
        <div className="p-4 lg:p-8 space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-gray-900 font-serif">Historial y Evolución</h1>
                    <p className="text-gray-500 font-medium">Cronología completa de mediciones y progresos biométricos.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-4 text-gray-400 hover:text-fuchsia-600 bg-white border border-gray-100 rounded-2xl transition-all shadow-sm active:scale-95"
                        title="Actualizar datos"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-fuchsia-600 text-white font-black text-sm shadow-lg shadow-fuchsia-100 hover:bg-fuchsia-700 hover:scale-105 active:scale-95 transition-all">
                        <ArrowUpRight className="size-4" />
                        EXPORTAR PDF
                    </button>
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MiniStat
                    label="Último Peso"
                    value={records.length > 0 ? `${records[0].weight.toFixed(1)} kg` : "--"}
                    icon={TrendingUp}
                    color="fuchsia"
                    trend={records.length > 1 ? (records[0].weight < records[1].weight ? 'down' : 'up') : undefined}
                />
                <MiniStat
                    label="Grasa Corporal"
                    value={records.length > 0 ? `${records[0].mass_fat_pct.toFixed(1)}%` : "--"}
                    icon={BarChart}
                    color="indigo"
                />
                <MiniStat
                    label="Masa Muscular"
                    value={records.length > 0 ? `${records[0].mass_muscle_pct.toFixed(1)}%` : "--"}
                    icon={Activity}
                    color="emerald"
                />
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registros en Base de Datos</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <Calendar size={14} />
                        Total: {records.length} evaluaciones
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="size-12 border-4 border-fuchsia-100 border-t-fuchsia-600 rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-bold text-sm">Validando registros clínicos...</p>
                    </div>
                ) : error ? (
                    <div className="py-24 px-10 text-center">
                        <div className="size-20 rounded-[2rem] bg-red-50 flex items-center justify-center text-red-500 border border-red-100 mx-auto mb-6">
                            <RefreshCw size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 font-serif">Error de Conexión</h3>
                        <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">{error}</p>
                        <button
                            onClick={fetchData}
                            className="mt-8 px-10 py-4 bg-red-500 text-white rounded-3xl font-black text-sm shadow-lg shadow-red-100 hover:bg-red-600 transition-all active:scale-95"
                        >
                            REINTENTAR ACCESO
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-500">
                        <HistoryTable records={records} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function HistoryPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin text-fuchsia-600" /></div>}>
            <HistoryContent />
        </Suspense>
    );
}

function MiniStat({ label, value, icon: Icon, color, trend }: any) {
    const colorClasses: any = {
        fuchsia: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:scale-[1.02] transition-transform">
            <div className={`size-14 rounded-3xl flex items-center justify-center shrink-0 border transition-colors ${colorClasses[color]}`}>
                <Icon className="size-6" />
            </div>
            <div className="flex-grow">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{label}</p>
                <div className="flex items-end gap-3">
                    <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
                    {trend && (
                        <div className={`p-1 rounded-lg ${trend === 'up' ? 'text-red-500 bg-red-50' : 'text-emerald-500 bg-emerald-50'}`}>
                            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Activity({ className, size }: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
