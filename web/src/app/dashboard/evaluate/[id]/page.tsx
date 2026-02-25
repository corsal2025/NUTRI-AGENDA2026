"use client";

import { use, useEffect, useState } from "react";
import AnthropometryForm from "@/components/AnthropometryForm";
import {
    ChevronLeft, LineChart as ChartIcon,
    ChevronRight, Activity, TrendingUp,
    TrendingDown, Calendar, User,
    ArrowRight, PlusCircle, History as HistoryIcon,
    RefreshCw, Target
} from "lucide-react";
import Link from "next/link";
import { nutritionService, AnthropometryResult } from "@/services/nutritionService";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

export default function EvaluatePatientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [patient, setPatient] = useState<any>(null);
    const [history, setHistory] = useState<AnthropometryResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    async function fetchData() {
        setLoading(true);
        const supabase = createClient();

        // Fetch patient profile
        const { data: profile } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', id)
            .single();

        if (profile) setPatient(profile);

        // Fetch evolution history
        try {
            const data = await nutritionService.getHistory(id);
            // Sort by date ascending for charts
            const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setHistory(sorted);
        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="size-16 border-4 border-fuchsia-100 border-t-fuchsia-600 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando Inteligencia Clínica...</p>
            </div>
        );
    }

    const lastAssessment = history.length > 0 ? history[history.length - 1] : null;
    const prevAssessment = history.length > 1 ? history[history.length - 2] : null;

    // Formatting for charts
    const chartData = history.map(h => ({
        date: format(new Date(h.date), "dd/MM"),
        weight: h.weight,
        fat: h.mass_fat_pct,
        muscle: h.mass_muscle_pct,
        bone: h.mass_bone_pct,
        residual: h.mass_residual_pct,
        fullDate: format(new Date(h.date), "PPP", { locale: es })
    }));

    return (
        <div className="p-4 lg:p-8 space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link
                        href="/dashboard/evaluate"
                        className="p-4 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-fuchsia-600 transition-all shadow-sm hover:scale-105 active:scale-95"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 font-serif">
                            {patient?.nombre_completo}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                {patient?.email}
                            </span>
                            <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                {history.length} EVALUACIONES
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${showForm
                            ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
                            : 'bg-fuchsia-600 text-white hover:bg-fuchsia-700 shadow-fuchsia-200'
                            }`}
                    >
                        {showForm ? <ChevronLeft size={18} /> : <PlusCircle size={18} />}
                        {showForm ? 'Volver al Dashboard' : 'Nueva Evaluación'}
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {showForm ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <AnthropometryForm patientId={id} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-10"
                    >
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                label="Peso Actual"
                                value={`${lastAssessment?.weight || '--'} kg`}
                                icon={TrendingUp}
                                trend={prevAssessment ? (lastAssessment!.weight < prevAssessment.weight ? 'down' : 'up') : null}
                                diff={prevAssessment ? Math.abs(lastAssessment!.weight - prevAssessment.weight).toFixed(1) : null}
                                color="fuchsia"
                            />
                            <MetricCard
                                label="Grasa Corporal"
                                value={`${lastAssessment?.mass_fat_pct || '--'}%`}
                                icon={Activity}
                                trend={prevAssessment ? (lastAssessment!.mass_fat_pct < prevAssessment.mass_fat_pct ? 'down' : 'up') : null}
                                diff={prevAssessment ? Math.abs(lastAssessment!.mass_fat_pct - prevAssessment.mass_fat_pct).toFixed(1) : null}
                                color="rose"
                            />
                            <MetricCard
                                label="Masa Muscular"
                                value={`${lastAssessment?.mass_muscle_pct || '--'}%`}
                                icon={Target}
                                trend={prevAssessment ? (lastAssessment!.mass_muscle_pct > prevAssessment.mass_muscle_pct ? 'down' : 'up') : null}
                                diff={prevAssessment ? Math.abs(lastAssessment!.mass_muscle_pct - prevAssessment.mass_muscle_pct).toFixed(1) : null}
                                color="emerald"
                            />
                            <MetricCard
                                label="Somatotipo Predom."
                                value={lastAssessment ? getSomatotypeLabel(lastAssessment) : '--'}
                                icon={User}
                                color="indigo"
                            />
                        </div>

                        {/* Detailed Clinical Metrics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Somatotype Details */}
                            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-3">
                                    <User className="text-indigo-600" /> Perfil de Somatotipo
                                </h3>
                                <div className="space-y-4">
                                    <SomatoMetric label="Endomorfismo" value={lastAssessment?.somatotype_endomorph} color="bg-rose-500" />
                                    <SomatoMetric label="Mesomorfismo" value={lastAssessment?.somatotype_mesomorph} color="bg-emerald-500" />
                                    <SomatoMetric label="Ectomorfismo" value={lastAssessment?.somatotype_ectomorph} color="bg-blue-500" />
                                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coordenadas X, Y</span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {lastAssessment ? `${lastAssessment.somatotype_x}, ${lastAssessment.somatotype_y}` : '--'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 5-Component Composition */}
                            <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-3">
                                    <Activity className="text-fuchsia-600" /> Fraccionamiento de 5 Componentes
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <MiniMetric label="Malla Grasa" value={lastAssessment?.mass_fat_kg} unit="kg" pct={lastAssessment?.mass_fat_pct} color="rose" />
                                    <MiniMetric label="Malla Muscular" value={lastAssessment?.mass_muscle_kg} unit="kg" pct={lastAssessment?.mass_muscle_pct} color="emerald" />
                                    <MiniMetric label="Malla Ósea" value={lastAssessment?.mass_bone_kg} unit="kg" pct={lastAssessment?.mass_bone_pct} color="indigo" />
                                    <MiniMetric label="Malla Residual" value={lastAssessment?.mass_residual_kg} unit="kg" pct={lastAssessment?.mass_residual_pct} color="amber" />
                                </div>
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-3">
                                        <TrendingUp className="text-fuchsia-600" /> Evolución de Peso
                                    </h3>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">Histórico KG</span>
                                </div>
                                <div className="h-72 w-full pt-4">
                                    {history.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#d946ef" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    labelStyle={{ fontWeight: 'bold', color: '#64748b' }}
                                                />
                                                <Area type="monotone" dataKey="weight" stroke="#d946ef" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : <EmptyState />}
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-3">
                                        <ChartIcon className="text-emerald-600" /> Composición Corporal %
                                    </h3>
                                    <div className="flex gap-3">
                                        <ChartLegend color="bg-rose-500" label="Grasa" />
                                        <ChartLegend color="bg-emerald-500" label="Músculo" />
                                        <ChartLegend color="bg-indigo-500" label="Óseo" />
                                    </div>
                                </div>
                                <div className="h-72 w-full pt-4">
                                    {history.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                <YAxis hide />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Line type="monotone" dataKey="fat" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                                                <Line type="monotone" dataKey="muscle" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                                <Line type="monotone" dataKey="bone" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                                            <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                                                <Activity size={32} />
                                            </div>
                                            <button
                                                onClick={() => setShowForm(true)}
                                                className="text-[10px] font-black text-fuchsia-600 uppercase tracking-widest hover:underline"
                                            >
                                                Registrar primera medición →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Assessments Table */}
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 font-serif">Registros Históricos Completos</h3>
                                    <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Protocolo Antropométrico Integral</p>
                                </div>
                                <Calendar className="text-gray-200" size={32} />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fecha</th>
                                            <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Peso / IMC</th>
                                            <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Grasa %</th>
                                            <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Músculo %</th>
                                            <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Somatotipo</th>
                                            <th className="px-10 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {[...history].reverse().map((h, idx) => (
                                            <tr key={h.id} className="hover:bg-fuchsia-50/30 transition-all group">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                            <HistoryIcon size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 uppercase">
                                                                {format(new Date(h.date), "dd MMM yyyy", { locale: es })}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                                                                {format(new Date(h.date), "EEEE", { locale: es })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-gray-800">{h.weight} kg</span>
                                                        <span className="text-[10px] font-bold text-fuchsia-500">IMC: {(h.weight / Math.pow(h.height / 100, 2)).toFixed(1)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="text-sm font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">{h.mass_fat_pct}%</span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{h.mass_muscle_pct}%</span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{getSomatotypeLabel(h)}</span>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <button className="p-3 rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-fuchsia-600 hover:text-white hover:scale-110">
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function getSomatotypeLabel(assessment: AnthropometryResult) {
    const { somatotype_endomorph: endo, somatotype_mesomorph: meso, somatotype_ectomorph: ecto } = assessment;
    if (meso > endo && meso > ecto) return "Mesomorfo";
    if (endo > meso && endo > ecto) return "Endomorfo";
    if (ecto > meso && ecto > endo) return "Ectomorfo";
    return "Balanceado";
}

function SomatoMetric({ label, value, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>{label}</span>
                <span className="text-gray-900">{value?.toFixed(1) || '0.0'}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((value / 10) * 100, 100)}%` }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    );
}

function MiniMetric({ label, value, unit, pct, color }: any) {
    const colors: any = {
        rose: "bg-rose-50 text-rose-600",
        emerald: "bg-emerald-50 text-emerald-600",
        indigo: "bg-indigo-50 text-indigo-600",
        amber: "bg-amber-50 text-amber-600"
    };
    return (
        <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 flex flex-col items-center text-center space-y-2">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-lg font-black text-gray-900">{value?.toFixed(1) || '--'} <small className="text-[10px] text-gray-400">{unit}</small></p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${colors[color]}`}>{pct?.toFixed(1) || '--'}%</span>
        </div>
    );
}

function ChartLegend({ color, label }: any) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={`size-2 rounded-full ${color}`} />
            <span className="text-[9px] font-black text-gray-400 uppercase">{label}</span>
        </div>
    );
}

function MetricCard({ label, value, icon: Icon, trend, diff, color }: any) {
    const colors: any = {
        fuchsia: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100"
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:scale-105 transition-all">
            <div className={`size-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border transition-all group-hover:rotate-6 ${colors[color]}`}>
                <Icon className="size-8" />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
                <div className="flex items-center gap-3">
                    <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
                    {trend && (
                        <div className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-lg ${trend === 'up' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                            }`}>
                            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {diff}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-2 opacity-30">
            <ChartIcon size={48} className="text-gray-200" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Datos Insuficientes</p>
        </div>
    );
}
