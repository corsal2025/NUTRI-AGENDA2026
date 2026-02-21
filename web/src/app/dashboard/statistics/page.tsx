"use client";

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, BarChart, Bar
} from "recharts";
import { TrendingUp, TrendingDown, Target, Activity, Calendar, Download, Info, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { nutritionService, AnthropometryResult } from "@/services/nutritionService";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function StatisticsContent() {
    const [data, setData] = useState<AnthropometryResult[]>([]);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const patientIdParam = searchParams.get('patientId');
    const { isAdmin, loading: loadingAdmin } = useAdmin();

    useEffect(() => {
        async function loadData() {
            if (loadingAdmin) return;

            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    let targetId = user.id;
                    if (isAdmin && patientIdParam) {
                        targetId = patientIdParam;
                    }

                    const history = await nutritionService.getHistory(targetId);
                    // Sort by date
                    const sortedData = history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    setData(sortedData);
                }
            } catch (error) {
                console.error("Error loading stats:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [isAdmin, loadingAdmin, patientIdParam]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
                <div className="size-14 border-4 border-fuchsia-100 border-t-fuchsia-600 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Generando Analíticas...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-white rounded-[3rem] border border-gray-100 shadow-sm max-w-2xl mx-auto my-10">
                <div className="size-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
                    <Activity size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 font-serif">Sin Datos Clínicos</h2>
                <p className="text-gray-500 mt-3 max-w-sm font-medium">Realiza tu primera evaluación nutricional para generar proyecciones y gráficos de evolución.</p>
                <button className="mt-10 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all">
                    AGENDAR EVALUACIÓN
                </button>
            </div>
        );
    }

    const latest = data[data.length - 1];
    const previous = data.length > 1 ? data[data.length - 2] : null;

    const calculateDiff = (curr: number, prev: number | null) => {
        if (!prev) return null;
        const diff = curr - prev;
        return {
            val: Math.abs(diff).toFixed(1),
            isDown: diff < 0
        };
    };

    const weightDiff = calculateDiff(latest.weight, previous?.weight || null);
    const fatDiff = calculateDiff(latest.mass_fat_pct, previous?.mass_fat_pct || null);

    return (
        <div className="p-4 md:p-8 space-y-12 max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-gray-900 font-serif">Inteligencia Clínica</h1>
                    <p className="text-gray-500 font-medium">Análisis avanzado de composición corporal y tendencias metabólicas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 text-gray-400">
                        <Calendar size={14} className="text-fuchsia-600" />
                        Corte: {format(new Date(latest.date), "dd MMM yyyy", { locale: es })}
                    </div>
                    <button className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-fuchsia-600 transition-all">
                        <Download size={20} />
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Peso Registro"
                    value={`${latest.weight} kg`}
                    icon={Activity}
                    color="fuchsia"
                    trend={weightDiff}
                />
                <StatCard
                    label="Grasa Corporal"
                    value={`${latest.mass_fat_pct.toFixed(1)}%`}
                    icon={Target}
                    color="rose"
                    trend={fatDiff}
                />
                <StatCard
                    label="Masa Muscular"
                    value={`${latest.mass_muscle_kg.toFixed(1)} kg`}
                    icon={TrendingUp}
                    color="emerald"
                />
                <StatCard
                    label="IMC Clínico"
                    value={(latest.weight / Math.pow(latest.height / 100, 2)).toFixed(1)}
                    icon={Info}
                    color="indigo"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weight Chart */}
                <ChartContainer title="Proyección de Peso Corporal">
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#c026d3" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#c026d3" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(val) => format(new Date(val), "dd/MM")}
                                stroke="#94a3b8"
                                fontSize={10}
                                fontWeight="bold"
                                tickMargin={10}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={10}
                                fontWeight="bold"
                                domain={['dataMin - 2', 'dataMax + 2']}
                                tickMargin={10}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', padding: '16px' }}
                                labelFormatter={(val) => format(new Date(val), "dd MMMM", { locale: es })}
                            />
                            <Area
                                type="monotone"
                                dataKey="weight"
                                name="Peso (kg)"
                                stroke="#c026d3"
                                fillOpacity={1}
                                fill="url(#colorWeight)"
                                strokeWidth={4}
                                dot={{ r: 6, fill: '#fff', stroke: '#c026d3', strokeWidth: 3 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Body Composition Chart */}
                <ChartContainer title="Estratificación de Tejidos">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={data} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(val) => format(new Date(val), "dd/MM")}
                                stroke="#94a3b8"
                                fontSize={10}
                                fontWeight="bold"
                                tickMargin={10}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={10}
                                fontWeight="bold"
                                tickMargin={10}
                            />
                            <Tooltip contentStyle={{ borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }} />
                            <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }} />
                            <Bar dataKey="mass_fat_pct" name="% Grasa" fill="#fb7185" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="mass_muscle_pct" name="% Músculo" fill="#10b981" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="mass_bone_pct" name="% Óseo" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Somatotype Tracker */}
                <ChartContainer title="Coordenadas de Somatotipo">
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(val) => format(new Date(val), "dd/MM")}
                                stroke="#94a3b8"
                                fontSize={10}
                                fontWeight="bold"
                                tickMargin={10}
                            />
                            <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickMargin={10} />
                            <Tooltip contentStyle={{ borderRadius: '24px', border: '1px solid #f1f5f9' }} />
                            <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            <Line type="stepAfter" dataKey="somatotype_x" name="Eje X" stroke="#f472b6" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="stepAfter" dataKey="somatotype_y" name="Eje Y" stroke="#818cf8" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Detailed Analysis Highlight */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold font-serif text-gray-900">Resumen de Composición</h3>
                        <p className="text-gray-400 font-medium text-sm">Distribución de masa en la última sesión</p>
                    </div>

                    <div className="w-full grid grid-cols-1 gap-4">
                        <MetricRow label="Masa Grasa Total" value={latest.mass_fat_kg.toFixed(2)} unit="kg" color="rose" />
                        <MetricRow label="Masa Muscular" value={latest.mass_muscle_kg.toFixed(2)} unit="kg" color="emerald" />
                        <MetricRow label="Masa Ósea" value={latest.mass_bone_kg.toFixed(2)} unit="kg" color="slate" />
                        <MetricRow label="Masa Residual" value={latest.mass_residual_kg.toFixed(2)} unit="kg" color="indigo" />
                    </div>

                    <div className="pt-6 border-t border-gray-50 w-full">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
                            Proyecciones basadas en protocolos ISAK de 5 componentes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StatisticsPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center p-10 min-h-screen items-center">
                <Loader2 className="size-10 animate-spin text-fuchsia-600" />
            </div>
        }>
            <StatisticsContent />
        </Suspense>
    );
}

function StatCard({ label, value, icon: Icon, color, trend }: any) {
    const colorClasses: any = {
        fuchsia: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100"
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-6 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl border transition-colors ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black ${trend.isDown ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend.isDown ? <TrendingDown size={12} strokeWidth={3} /> : <TrendingUp size={12} strokeWidth={3} />}
                        {trend.val}
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{label}</p>
                <h4 className="text-3xl font-bold text-gray-900 font-serif leading-none">{value}</h4>
            </div>
        </div>
    );
}

function MetricRow({ label, value, unit, color }: any) {
    const bgMap: any = {
        rose: "bg-rose-500",
        emerald: "bg-emerald-500",
        slate: "bg-slate-500",
        indigo: "bg-indigo-500"
    };

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50 group hover:bg-white hover:border-fuchsia-100 transition-all">
            <div className="flex items-center gap-3">
                <div className={`size-2 rounded-full ${bgMap[color]}`} />
                <span className="text-sm font-bold text-gray-500">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-gray-900 leading-none">{value}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase">{unit}</span>
            </div>
        </div>
    );
}

function ChartContainer({ title, children }: any) {
    return (
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
            <h3 className="text-xl font-bold mb-10 text-gray-900 font-serif border-l-4 border-fuchsia-600 pl-4">{title}</h3>
            {children}
        </div>
    );
}
