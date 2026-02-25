"use client"

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronRight, ChevronLeft, Save,
    Database, Activity, Ruler, Target,
    ArrowRight, CheckCircle2, Info
} from 'lucide-react'
import BodyScan from './BodyScan'
import { nutritionService, AnthropometryData } from '@/services/nutritionService'

export default function AnthropometryForm({ patientId }: { patientId: string }) {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [saved, setSaved] = useState(false)
    const [focusedZone, setFocusedZone] = useState<string | null>(null)

    // Form State - Standardized with nutritionService
    const [formData, setFormData] = useState<any>({
        // 1. DATOS GENERALES
        weight: '',
        height: '',
        age_at_record: '',
        genero: '', // Standardized names for calculations

        // 2. PLIEGUES CUTÁNEOS (mm)
        fold_bicipital: '',
        fold_tricipital: '',
        fold_subscapular: '',
        fold_suprailiac: '',
        fold_supraspinale: '',
        fold_abdominal: '', // Added if mapping allows
        fold_front_thigh: '', // Added if mapping allows
        fold_calf: '',

        // 3. CIRCUNFERENCIAS (cm)
        circ_arm_relaxed: '',
        circ_arm_contracted: '',
        circ_waist: '',
        circ_hip: '',
        circ_thigh: '',
        circ_calf: '',
        circ_wrist: '',

        // 4. DIÁMETROS (cm)
        diam_biacromial: '',
        diam_thorax_trans: '',
        diam_thorax_ap: '',
        diam_humerus: '',
        diam_wrist: '',
        diam_femur: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev: any) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleFocus = useCallback((name: string) => setFocusedZone(name), [])
    const handleBlur = useCallback(() => setFocusedZone(null), [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Prepare data for service
            const payload: AnthropometryData = {
                patient_id: patientId,
                date: new Date().toISOString(),
                weight: parseFloat(formData.weight),
                height: parseFloat(formData.height),
                age_at_record: parseInt(formData.age_at_record),
                // Folds
                fold_bicipital: parseFloat(formData.fold_bicipital) || 0,
                fold_tricipital: parseFloat(formData.fold_tricipital) || 0,
                fold_subscapular: parseFloat(formData.fold_subscapular) || 0,
                fold_suprailiac: parseFloat(formData.fold_suprailiac) || 0,
                fold_calf: parseFloat(formData.fold_calf) || 0,
                fold_supraspinale: parseFloat(formData.fold_supraspinale) || 0,
                // Circs
                circ_waist: parseFloat(formData.circ_waist) || 0,
                circ_hip: parseFloat(formData.circ_hip) || 0,
                circ_calf: parseFloat(formData.circ_calf) || 0,
                circ_arm_relaxed: parseFloat(formData.circ_arm_relaxed) || 0,
                circ_arm_contracted: parseFloat(formData.circ_arm_contracted) || 0,
                circ_wrist: parseFloat(formData.circ_wrist) || 0,
                // Diams
                diam_humerus: parseFloat(formData.diam_humerus) || 0,
                diam_femur: parseFloat(formData.diam_femur) || 0,
                diam_wrist: parseFloat(formData.diam_wrist) || 0,
            }

            // The service handles calculations (IMC, Fat%, Muscle%, Somato) and saves to 'anthropometrics'
            await nutritionService.calculateAndSave(payload, formData.genero)

            setSaved(true)
        } catch (err: any) {
            console.error(err)
            alert(err.message || 'Error al guardar evaluación')
        } finally {
            setLoading(false)
        }
    }

    if (saved) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto bg-white rounded-[3rem] p-16 text-center shadow-2xl shadow-emerald-100/50 border border-emerald-50"
            >
                <div className="size-24 rounded-[2.5rem] bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-8 border border-emerald-100">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 font-serif mb-4">Evaluación Registrada</h2>
                <p className="text-gray-500 font-medium mb-10">Los datos han sido procesados y calculados con éxito. IMC, Somatotipo y Composición Corporal han sido actualizados.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-10 py-5 bg-gray-900 text-white rounded-3xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-200"
                >
                    VOLVER AL DASHBOARD
                </button>
            </motion.div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 px-4">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-gray-900 font-serif tracking-tight">Registro de Mediciones</h2>
                    <p className="text-gray-500 font-medium italic">Protocolo ISAK de Alta Precisión · Modo Overdrive 2025</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-5 py-3 bg-fuchsia-50 rounded-2xl border border-fuchsia-100 text-fuchsia-600 text-[10px] font-black uppercase tracking-widest">
                        <Database size={14} />
                        Cálculo Automático
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-8 space-y-10">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-50 -translate-y-1/2 z-0" />
                            {[
                                { num: 1, label: 'General', icon: Activity },
                                { num: 2, label: 'Pliegues', icon: Target },
                                { num: 3, label: 'Perímetros', icon: Ruler },
                                { num: 4, label: 'Diámetros', icon: Database }
                            ].map((s) => (
                                <div key={s.num} className="relative z-10 flex flex-col items-center">
                                    <motion.button
                                        type="button"
                                        onClick={() => step > s.num && setStep(s.num)}
                                        className={`size-14 rounded-2xl flex items-center justify-center transition-all border-4 border-white shadow-lg ${step === s.num ? 'bg-fuchsia-600 text-white scale-110 shadow-fuchsia-200' :
                                            step > s.num ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        <s.icon size={22} />
                                    </motion.button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-gray-100 shadow-xl relative overflow-hidden">
                        <form onSubmit={handleSubmit} className="space-y-12">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {step === 1 && (
                                        <section className="space-y-10">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold font-serif italic text-lg shadow-lg">1</div>
                                                <h3 className="text-3xl font-bold text-gray-900 font-serif">Mediciones Generales</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <FormInput label="Peso Corporal" name="weight" unit="kg" value={formData.weight} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="0.0" />
                                                <FormInput label="Talla" name="height" unit="cm" value={formData.height} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="0.0" />
                                                <FormInput label="Edad" name="age_at_record" unit="Años" value={formData.age_at_record} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="0" />
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Género Biológico</label>
                                                    <select
                                                        name="genero"
                                                        required
                                                        value={formData.genero}
                                                        onChange={handleChange}
                                                        onFocus={() => handleFocus('genero')}
                                                        onBlur={handleBlur}
                                                        className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-fuchsia-500/5 transition-all outline-none appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="M">Masculino</option>
                                                        <option value="F">Femenino</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {step === 2 && (
                                        <section className="space-y-10">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold font-serif italic text-lg shadow-lg">2</div>
                                                <h3 className="text-3xl font-bold text-gray-900 font-serif">Pliegues Cutáneos</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                {[
                                                    { name: 'fold_bicipital', label: 'Bicipital' },
                                                    { name: 'fold_tricipital', label: 'Tricipital' },
                                                    { name: 'fold_subscapular', label: 'Subescapular' },
                                                    { name: 'fold_suprailiac', label: 'Suprailiaco' },
                                                    { name: 'fold_supraspinale', label: 'Supraspinal' },
                                                    { name: 'fold_abdominal', label: 'Abdominal' },
                                                    { name: 'fold_calf', label: 'Pantorrilla' }
                                                ].map((f) => (
                                                    <FormInput key={f.name} label={f.label} name={f.name} unit="mm" value={formData[f.name]} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="0.0" />
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {step === 3 && (
                                        <section className="space-y-10">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold font-serif italic text-lg shadow-lg">3</div>
                                                <h3 className="text-3xl font-bold text-gray-900 font-serif">Circunferencias</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                {[
                                                    { name: 'circ_arm_relaxed', label: 'Brazo Relajado' },
                                                    { name: 'circ_arm_contracted', label: 'Brazo Contraído' },
                                                    { name: 'circ_waist', label: 'Cintura' },
                                                    { name: 'circ_hip', label: 'Cadera' },
                                                    { name: 'circ_calf', label: 'Pantorrilla' },
                                                    { name: 'circ_wrist', label: 'Muñeca' }
                                                ].map((f) => (
                                                    <FormInput key={f.name} label={f.label} name={f.name} unit="cm" value={formData[f.name]} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="0.0" />
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {step === 4 && (
                                        <section className="space-y-10">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold font-serif italic text-lg shadow-lg">4</div>
                                                <h3 className="text-3xl font-bold text-gray-900 font-serif">Diámetros Óseos</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                {[
                                                    { name: 'diam_humerus', label: 'Húmero' },
                                                    { name: 'diam_wrist', label: 'Muñeca' },
                                                    { name: 'diam_femur', label: 'Fémur' }
                                                ].map((f) => (
                                                    <FormInput key={f.name} label={f.label} name={f.name} unit="cm" value={formData[f.name]} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="0.0" />
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex items-center justify-between pt-10 border-t border-gray-50 mt-12">
                                <button
                                    type="button"
                                    onClick={() => step > 1 && setStep(step - 1)}
                                    className={`flex items-center gap-3 px-8 py-5 text-gray-500 font-black text-xs uppercase tracking-widest rounded-3xl transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-slate-50'}`}
                                >
                                    <ChevronLeft size={18} />
                                    Atrás
                                </button>

                                {step < 4 ? (
                                    <button
                                        type="button"
                                        onClick={() => setStep(step + 1)}
                                        className="flex items-center gap-3 px-12 py-5 bg-gray-900 text-white font-black text-xs uppercase tracking-widest rounded-3xl hover:bg-black transition-all shadow-2xl shadow-gray-200 active:scale-95"
                                    >
                                        Continuar
                                        <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-3 px-12 py-5 bg-fuchsia-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl hover:bg-fuchsia-700 transition-all shadow-2xl shadow-fuchsia-100 active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? 'Procesando...' : '✓ Guardar y Calcular'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="xl:col-span-4 sticky top-6 self-start hidden xl:block">
                    <div className="space-y-6">
                        <BodyScan focusedZone={focusedZone} gender={formData.genero} />

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3 text-fuchsia-600">
                                <Info size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Guía Inteligente</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                El sistema calculará automáticamente el IMC, Composición Corporal (Grasa, Músculo, Residual) y Somatotipo Heath-Carter tras guardar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FormInput({ label, name, value, onChange, onFocus, onBlur, placeholder, unit }: any) {
    return (
        <div className="space-y-3 group">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 group-focus-within:text-fuchsia-500 transition-colors">{label}</label>
            <div className="relative">
                <input
                    type="number"
                    step="0.01"
                    name={name}
                    required
                    value={value}
                    onChange={onChange}
                    onFocus={() => onFocus(name)}
                    onBlur={onBlur}
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-fuchsia-500/5 transition-all outline-none placeholder:text-gray-300"
                    placeholder={placeholder}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest pointer-events-none">{unit}</span>
            </div>
        </div>
    )
}
