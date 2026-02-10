'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronRight, ChevronLeft, Save,
    Database, Activity, Ruler, Target,
    ArrowRight, CheckCircle2, Info
} from 'lucide-react'
import BodyScan from './BodyScan'

export default function AnthropometryForm({ patientId }: { patientId: string }) {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [saved, setSaved] = useState(false)
    const [focusedZone, setFocusedZone] = useState<string | null>(null)
    const supabase = createClient()

    // Form State - Strict Order
    const [formData, setFormData] = useState({
        // 1. DATOS GENERALES
        peso_kg: '',
        altura_cm: '',
        edad: '',
        genero: '',

        // 2. PLIEGUES CUTÁNEOS (mm)
        bicipital: '',
        tricipital: '',
        subescapular: '',
        suprailiaco: '',
        supraespinal: '',
        abdominal: '',
        muslo_frontal: '',
        pantorrilla: '',

        // 3. CIRCUNFERENCIAS (cm)
        brazo_relajado: '',
        brazo_contraido: '',
        cintura: '',
        cadera: '',
        muslo_gluteo: '',
        pantorrilla_circ: '',

        // 4. DIÁMETROS (cm)
        biacromial: '',
        torax_transverso: '',
        torax_antero_posterior: '',
        humero: '',
        muneca: '',
        femur: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
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
            const { error } = await supabase
                .from('evaluaciones_nutricionales')
                .insert([{
                    id_paciente: patientId,
                    ...formData,
                    fecha_evaluacion: new Date().toISOString()
                }])

            if (error) throw error
            setSaved(true)

        } catch (err: any) {
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
                <p className="text-gray-500 font-medium mb-10">Los datos han sido validados y almacenados en el historial clínico del paciente.</p>
                <button
                    onClick={() => window.location.href = '/dashboard/history'}
                    className="px-10 py-5 bg-gray-900 text-white rounded-3xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-200"
                >
                    VER HISTORIAL COMPLETO
                </button>
            </motion.div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 px-4">
            {/* Header Area */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-gray-900 font-serif tracking-tight">Evaluación Antropométrica</h2>
                    <p className="text-gray-500 font-medium italic">Protocolo ISAK de Alta Precisión · Modo Overdrive 2025</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-5 py-3 bg-fuchsia-50 rounded-2xl border border-fuchsia-100 text-fuchsia-600 text-[10px] font-black uppercase tracking-widest">
                        <Database size={14} />
                        Supabase Sync
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left Column: Form Content */}
                <div className="xl:col-span-8 space-y-10">
                    {/* Premium Stepper */}
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

                    {/* Main Form Card */}
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
                                    {/* Content based on step */}
                                    {step === 1 && (
                                        <section className="space-y-10">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold font-serif italic text-lg shadow-lg">1</div>
                                                <h3 className="text-3xl font-bold text-gray-900 font-serif">Mediciones Generales</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <FormInput label="Peso Corporal" name="peso_kg" unit="kg" value={formData.peso_kg} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="0.0" />
                                                <FormInput label="Talla" name="altura_cm" unit="cm" value={formData.altura_cm} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="0.0" />
                                                <FormInput label="Edad" name="edad" unit="Años" value={formData.edad} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="0" />
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
                                                    { name: 'bicipital', label: 'Bicipital' },
                                                    { name: 'tricipital', label: 'Tricipital' },
                                                    { name: 'subescapular', label: 'Subescapular' },
                                                    { name: 'suprailiaco', label: 'Suprailiaco' },
                                                    { name: 'supraespinal', label: 'Supraespinal' },
                                                    { name: 'abdominal', label: 'Abdominal' },
                                                    { name: 'muslo_frontal', label: 'Muslo Frontal' },
                                                    { name: 'pantorrilla', label: 'Pantorrilla' }
                                                ].map((f) => (
                                                    <FormInput key={f.name} label={f.label} name={f.name} unit="mm" value={formData[f.name as keyof typeof formData]} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="0.0" />
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
                                                    { name: 'brazo_relajado', label: 'Brazo Relajado' },
                                                    { name: 'brazo_contraido', label: 'Brazo Contraído' },
                                                    { name: 'cintura', label: 'Cintura' },
                                                    { name: 'cadera', label: 'Cadera' },
                                                    { name: 'muslo_gluteo', label: 'Muslo Superior' },
                                                    { name: 'pantorrilla_circ', label: 'Pantorrilla' }
                                                ].map((f) => (
                                                    <FormInput key={f.name} label={f.label} name={f.name} unit="cm" value={formData[f.name as keyof typeof formData]} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="0.0" />
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
                                                    { name: 'biacromial', label: 'Biacromial' },
                                                    { name: 'torax_transverso', label: 'Tórax Trans.' },
                                                    { name: 'torax_antero_posterior', label: 'Tórax AP' },
                                                    { name: 'humero', label: 'Húmero' },
                                                    { name: 'muneca', label: 'Muñeca' },
                                                    { name: 'femur', label: 'Fémur' }
                                                ].map((f) => (
                                                    <FormInput key={f.name} label={f.label} name={f.name} unit="cm" value={formData[f.name as keyof typeof formData]} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder="0.0" />
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Actions */}
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
                                        {loading ? 'Procesando...' : '✓ Guardar Evaluación'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Visual Feedback Scanner */}
                <div className="xl:col-span-4 sticky top-6 self-start hidden xl:block">
                    <div className="space-y-6">
                        <BodyScan focusedZone={focusedZone} gender={formData.genero} />

                        {/* Help Box */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3 text-fuchsia-600">
                                <Info size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Guía Inteligente</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                El escáner holográfico resalta las zonas de medición ISAK correspondientes al campo seleccionado. Asegúrese de que el paciente esté en posición estándar.
                            </p>
                            <div className="pt-2">
                                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-2">
                                    <span>Precisión del Scanner</span>
                                    <span>98.5%</span>
                                </div>
                                <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '98.5%' }}
                                        className="h-full bg-emerald-400"
                                    />
                                </div>
                            </div>
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
