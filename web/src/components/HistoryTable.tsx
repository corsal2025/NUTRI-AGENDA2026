"use client";

import { AnthropometryResult } from "@/services/nutritionService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronRight, FileText, TrendingDown, TrendingUp, Minus, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface HistoryTableProps {
    records: AnthropometryResult[];
    onViewDetail?: (record: AnthropometryResult) => void;
}

export function HistoryTable({ records, onViewDetail }: HistoryTableProps) {
    if (records.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <div className="size-16 rounded-3xl bg-slate-50 text-gray-300 flex items-center justify-center mx-auto mb-6">
                    <FileText size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-serif">Sin registros históricos</h3>
                <p className="mt-2 text-gray-400 font-medium max-w-xs mx-auto">
                    Aún no se han realizado evaluaciones para este paciente. Inicia una evaluación para ver la progresión.
                </p>
            </div>
        );
    }

    const calculateBMI = (weight: number, height: number) => {
        const h = height / 100;
        return (weight / (h * h)).toFixed(1);
    };

    return (
        <div className="overflow-hidden bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-gray-50">
                            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Consulta</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Análisis Clínico</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">% Grasa</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">% Músculo</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">IMC</th>
                            <th className="px-8 py-6 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {records.map((record, idx) => {
                            const prevRecord = records[idx + 1];
                            const weightDiff = prevRecord ? record.weight - prevRecord.weight : 0;

                            return (
                                <motion.tr
                                    key={record.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-fuchsia-50/20 transition-all group"
                                >
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-slate-50 text-gray-400 flex items-center justify-center group-hover:bg-white group-hover:text-fuchsia-600 transition-colors border border-transparent group-hover:border-fuchsia-100">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 capitalize">
                                                    {format(new Date(record.date), "dd 'de' MMMM, yyyy", { locale: es })}
                                                </div>
                                                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-0.5">
                                                    {format(new Date(record.date), "EEEE", { locale: es })}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-gray-900">{record.weight.toFixed(1)} <small className="text-gray-400 font-bold ml-1">KG</small></span>
                                            {weightDiff !== 0 && (
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${weightDiff < 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                    {weightDiff < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                                                    {Math.abs(weightDiff).toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${record.mass_fat_pct < 20 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <span className="text-sm font-bold text-gray-600">{record.mass_fat_pct.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="text-sm font-bold text-gray-600">{record.mass_muscle_pct.toFixed(1)}%</span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="px-3 py-1 bg-gray-900 text-white rounded-lg text-[10px] font-black">
                                            {calculateBMI(record.weight, record.height)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => onViewDetail?.(record)}
                                            className="px-5 py-2.5 rounded-xl bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-fuchsia-600 hover:text-white transition-all shadow-sm hover:shadow-fuchsia-200"
                                        >
                                            Detalles
                                        </button>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
