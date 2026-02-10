"use client";

import { useState } from "react";
import {
    Calculator, Save, BarChart2, Loader2,
    Activity, Target, Ruler, Database,
    CheckCircle2, TrendingUp, Info
} from "lucide-react";
import { nutritionService, AnthropometryResult } from "@/services/nutritionService";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export function NutritionForm() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<AnthropometryResult | null>(null);
    const [formData, setFormData] = useState({
        // General
        genero: "mujer",
        edad: "",
        peso: "",
        talla: "",
        // Pliegues
        pliegue_bicipital: "",
        pliegue_tricipital: "",
        pliegue_subescapular: "",
        pliegue_suprailiaco: "",
        pliegue_pantorrilla: "",
        pliegue_supraespinal: "",
        // Circunferencias
        cintura: "",
        cadera: "",
        pantorrilla: "",
        brazo_relajado: "",
        brazo_contraido: "",
        muneca: "",
        // Diametros
        humero: "",
        femur: "",
        diam_muneca: "",
    });

    const calculateBMI = () => {
        if (formData.peso && formData.talla) {
            const h = parseFloat(formData.talla) / 100;
            return (parseFloat(formData.peso) / (h * h)).toFixed(2);
        }
        return "0";
    };

    const calculateICC = () => {
        if (formData.cintura && formData.cadera) {
            return (parseFloat(formData.cintura) / parseFloat(formData.cadera)).toFixed(2);
        }
        return "0";
    };

    const handleCalculate = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("Debes iniciar sesión para realizar cálculos.");
                return;
            }

            const payload = {
                patient_id: user.id,
                date: new Date().toISOString().split('T')[0],
                weight: parseFloat(formData.peso) || 0,
                height: parseFloat(formData.talla) || 0,
                age_at_record: parseInt(formData.edad) || 0,
                fold_bicipital: parseFloat(formData.pliegue_bicipital) || 0,
                fold_tricipital: parseFloat(formData.pliegue_tricipital) || 0,
                fold_subscapular: parseFloat(formData.pliegue_subescapular) || 0,
                fold_suprailiac: parseFloat(formData.pliegue_suprailiaco) || 0,
                fold_calf: parseFloat(formData.pliegue_pantorrilla) || 0,
                fold_supraspinale: parseFloat(formData.pliegue_supraespinal) || 0,
                circ_waist: parseFloat(formData.cintura) || 0,
                circ_hip: parseFloat(formData.cadera) || 0,
                circ_calf: parseFloat(formData.pantorrilla) || 0,
                circ_arm_relaxed: parseFloat(formData.brazo_relajado) || 0,
                circ_arm_contracted: parseFloat(formData.brazo_contraido) || 0,
                circ_wrist: parseFloat(formData.muneca) || 0,
                diam_humerus: parseFloat(formData.humero) || 0,
                diam_femur: parseFloat(formData.femur) || 0,
                diam_wrist: parseFloat(formData.diam_muneca) || 0,
            };

            const response = await nutritionService.calculateAndSave(payload);
            setResults(response);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Error al calcular resultados. Asegúrate de que el servidor backend esté corriendo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-gray-900 font-serif tracking-tight">Evaluación Nutricional Avanzada</h2>
                    <p className="text-gray-500 font-medium italic">Protocolo de Análisis de 5 Componentes · Algoritmos Clínicos</p>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 bg-fuchsia-50 rounded-2xl border border-fuchsia-100 text-fuchsia-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <Calculator size={14} />
                    Motor de Cálculo Activo
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* LEFT COL: Input Fields */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm space-y-12">

                        <Section title="1. Datos Generales" icon={Activity}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Género</label>
                                    <select
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-fuchsia-500/5 transition-all outline-none appearance-none"
                                        value={formData.genero}
                                        onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                                    >
                                        <option value="mujer">Femenino</option>
                                        <option value="hombre">Masculino</option>
                                    </select>
                                </div>
                                <FormInput label="Edad" value={formData.edad} onChange={(v: string) => setFormData({ ...formData, edad: v })} unit="a" placeholder="0" />
                                <FormInput label="Peso" value={formData.peso} onChange={(v: string) => setFormData({ ...formData, peso: v })} unit="kg" placeholder="0.0" />
                                <FormInput label="Talla" value={formData.talla} onChange={(v: string) => setFormData({ ...formData, talla: v })} unit="cm" placeholder="0.0" />
                            </div>
                        </Section>

                        <Section title="2. Pliegues Cutáneos" icon={Target}>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {[
                                    { k: 'bicipital', l: 'Bicipital' },
                                    { k: 'tricipital', l: 'Tricipital' },
                                    { k: 'subescapular', l: 'Subescapular' },
                                    { k: 'suprailiaco', l: 'Suprailiaco' },
                                    { k: 'supraespinal', l: 'Supraespinal' },
                                    { k: 'pantorrilla', l: 'Pantorrilla' }
                                ].map(({ k, l }) => (
                                    <FormInput
                                        key={k}
                                        label={l}
                                        value={formData[`pliegue_${k}` as keyof typeof formData]}
                                        onChange={(v: string) => setFormData({ ...formData, [`pliegue_${k}` as keyof typeof formData]: v })}
                                        unit="mm"
                                        placeholder="0.0"
                                    />
                                ))}
                            </div>
                        </Section>

                        <Section title="3. Perímetros y Diámetros" icon={Ruler}>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <FormInput label="Cintura" value={formData.cintura} onChange={(v: string) => setFormData({ ...formData, cintura: v })} unit="cm" placeholder="0.0" />
                                <FormInput label="Cadera" value={formData.cadera} onChange={(v: string) => setFormData({ ...formData, cadera: v })} unit="cm" placeholder="0.0" />
                                <FormInput label="Panto. Circ." value={formData.pantorrilla} onChange={(v: string) => setFormData({ ...formData, pantorrilla: v })} unit="cm" placeholder="0.0" />
                                <FormInput label="Humero" value={formData.humero} onChange={(v: string) => setFormData({ ...formData, humero: v })} unit="cm" placeholder="0.0" />
                                <FormInput label="Femur" value={formData.femur} onChange={(v: string) => setFormData({ ...formData, femur: v })} unit="cm" placeholder="0.0" />
                                <FormInput label="Muñeca" value={formData.diam_muneca} onChange={(v: string) => setFormData({ ...formData, diam_muneca: v })} unit="cm" placeholder="0.0" />
                            </div>
                        </Section>

                        <button
                            onClick={handleCalculate}
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-gray-200 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin size-5" /> : <Save size={18} />}
                            {loading ? "Calculando Análisis..." : "GUARDAR Y EJECUTAR CÁLCULOS"}
                        </button>
                    </div>
                </div>

                {/* RIGHT COL: Results Analytics */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-xl shadow-fuchsia-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="size-16 rounded-[1.5rem] bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center border border-fuchsia-100 mb-2">
                                <TrendingUp size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 font-serif">Inteligencia Antropométrica</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Status: {results ? 'Validado Clínicamente' : 'Pendiente de Ingreso'}</p>
                            </div>

                            <div className="w-full space-y-4 pt-4">
                                <ResultCard label="IMC Actual" value={`${calculateBMI()} kg/m²`} subtext="Índice Masa Corporal" />
                                <ResultCard label="Masa Muscular" value={`${results?.mass_muscle_kg?.toFixed(1) || 0} kg`} subtext={`${results?.mass_muscle_pct?.toFixed(1) || 0}% de composición`} highlight />
                                <ResultCard label="Masa Grasa" value={`${results?.mass_fat_kg?.toFixed(1) || 0} kg`} subtext={`${results?.mass_fat_pct?.toFixed(1) || 0}% de composición`} warning />
                                <ResultCard label="Índice Cintura/Cadera" value={calculateICC()} subtext="Riesgo Metabólico" />
                            </div>
                        </div>
                    </div>

                    {/* Somatocarta Premium */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center">
                        <div className="flex justify-between items-center w-full mb-6">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Somatopunta</h4>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <Info size={14} />
                            </div>
                        </div>

                        <div className="relative w-56 h-56 bg-slate-50 rounded-3xl border border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 border-t border-gray-200/50 top-1/2" />
                            <div className="absolute inset-0 border-l border-gray-200/50 left-1/2" />

                            <span className="absolute top-2 text-[8px] font-black text-gray-300 uppercase">Meso</span>
                            <span className="absolute bottom-2 left-2 text-[8px] font-black text-gray-300 uppercase">Endo</span>
                            <span className="absolute bottom-2 right-2 text-[8px] font-black text-gray-300 uppercase">Ecto</span>

                            {results && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="size-5 bg-fuchsia-600 rounded-full shadow-lg shadow-fuchsia-200 z-10 border-4 border-white absolute transition-all duration-1000"
                                    style={{
                                        left: `calc(50% + ${results.somatotype_x * 12}px)`,
                                        top: `calc(50% - ${results.somatotype_y * 12}px)`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-3 w-full gap-2 mt-8">
                            <SomatoItem label="Endo" value={results?.somatotype_endomorph?.toFixed(1) || '0.0'} />
                            <SomatoItem label="Meso" value={results?.somatotype_mesomorph?.toFixed(1) || '0.0'} />
                            <SomatoItem label="Ecto" value={results?.somatotype_ectomorph?.toFixed(1) || '0.0'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <div className="space-y-6">
            <h4 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-3">
                <div className="p-2 bg-fuchsia-50 text-fuchsia-600 rounded-xl">
                    <Icon size={18} />
                </div>
                {title}
            </h4>
            {children}
        </div>
    );
}

function FormInput({ label, value, onChange, unit, placeholder }: { label: string, value: string, onChange: (v: string) => void, unit: string, placeholder: string }) {
    return (
        <div className="space-y-2 group">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 group-focus-within:text-fuchsia-600 transition-colors">{label}</label>
            <div className="relative">
                <input
                    type="number"
                    step="0.01"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-fuchsia-500/5 transition-all outline-none placeholder:text-gray-200"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest pointer-events-none">{unit}</span>
            </div>
        </div>
    );
}

function ResultCard({ label, value, subtext, highlight, warning }: { label: string, value: string, subtext: string, highlight?: boolean, warning?: boolean }) {
    return (
        <div className={`p-5 rounded-3xl border transition-all text-left flex justify-between items-center ${highlight ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-200 border-fuchsia-600' :
            warning ? 'bg-rose-50 border-rose-100 text-rose-900' :
                'bg-slate-50 border-gray-100 text-gray-900'
            }`}>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-fuchsia-200' : 'text-gray-400'}`}>{label}</p>
                <p className="text-xl font-black mt-1 leading-none">{value}</p>
            </div>
            <div className="text-right">
                <p className={`text-[9px] font-bold uppercase ${highlight ? 'text-fuchsia-100' : 'text-gray-300'}`}>{subtext}</p>
            </div>
        </div>
    );
}

function SomatoItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-slate-50 p-2 rounded-xl border border-gray-50 flex flex-col items-center">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-black text-gray-900">{value}</span>
        </div>
    );
}
