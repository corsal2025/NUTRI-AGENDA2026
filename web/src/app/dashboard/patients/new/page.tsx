"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    User, Target, Calendar, Phone, Activity,
    Heart, Beer, Cigarette, Droplets, Moon,
    Save, ChevronLeft, ChevronRight, CheckCircle2,
    Stethoscope, Pill, Scissors, Baby
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";

const STEPS = [
    { title: "Datos Personales", icon: User },
    { title: "Hábitos", icon: Activity },
    { title: "Antecedentes Médicos", icon: Stethoscope },
    { title: "Antecedentes Familiares", icon: Heart }
];

export default function NewPatientPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // State management for all sections
    const [formData, setFormData] = useState({
        // Perfil / Datos Personales
        nombre_completo: "",
        email: "",
        rut: "",
        telefono: "",
        edad: "",
        ocupacion: "",
        objetivo: "",

        // Hábitos
        horas_sueno: "",
        consumo_agua: "",
        actividad_fisica: "",
        tabaco: false,
        alcohol: false,

        // Antecedentes Médicos
        patologias: "",
        medicamentos: "",
        cirugias: "",
        alergias: "",

        // Antecedentes Familiares
        fam_diabetes: false,
        fam_hta: false,
        fam_obesidad: false,
        fam_cancer: false,
        fam_otros: ""
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        const supabase = createClient();

        try {
            // 1. Crear Perfil (Auth y Perfiles - Nota: En un flujo real esto requeriría auth.signUp)
            // Por ahora, simulamos la inserción en la tabla perfiles para pacientes existentes o manuales
            const { data: profile, error: pError } = await supabase
                .from('perfiles')
                .insert([{
                    nombre_completo: formData.nombre_completo,
                    email: formData.email,
                    rut: formData.rut,
                    telefono: formData.telefono,
                    rol: 'paciente',
                    especialidad: formData.ocupacion, // Reutilizando campo para ocupación en paciente
                }])
                .select()
                .single();

            if (pError) throw pError;

            // 2. Insertar Paciente Info (Hábitos)
            const { error: iError } = await supabase
                .from('paciente_info')
                .insert([{
                    patient_id: profile.id,
                    edad: parseInt(formData.edad),
                    ocupacion: formData.ocupacion,
                    objetivo: formData.objetivo,
                    horas_sueno: formData.horas_sueno,
                    consumo_agua: formData.consumo_agua,
                    actividad_fisica: formData.actividad_fisica,
                    tabaco: formData.tabaco,
                    alcohol: formData.alcohol
                }]);

            // 3. Antecedentes Médicos
            const { error: mError } = await supabase
                .from('antecedentes_medicos')
                .insert([{
                    patient_id: profile.id,
                    patologias: formData.patologias,
                    medicamentos: formData.medicamentos,
                    cirugias: formData.cirugias,
                    alergias: formData.alergias
                }]);

            // 4. Antecedentes Familiares
            const { error: fError } = await supabase
                .from('antecedentes_familiares')
                .insert([{
                    patient_id: profile.id,
                    diabetes: formData.fam_diabetes,
                    hta: formData.fam_hta,
                    obesidad: formData.fam_obesidad,
                    cancer: formData.fam_cancer,
                    otros: formData.fam_otros
                }]);

            router.push('/dashboard/patients');
        } catch (err) {
            console.error("Error al registrar paciente:", err);
            alert("Error al registrar: Revisar consola");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-fuchsia-600 transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif">Ficha de Ingreso</h1>
                        <p className="text-gray-500 font-medium text-sm">Registro clínico de nuevo paciente</p>
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                    {STEPS.map((step, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={clsx(
                                "size-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-4",
                                currentStep === idx ? "bg-fuchsia-600 text-white border-fuchsia-100 scale-110 shadow-lg shadow-fuchsia-100" :
                                    currentStep > idx ? "bg-emerald-500 text-white border-emerald-50" : "bg-white text-gray-300 border-white"
                            )}>
                                {currentStep > idx ? <CheckCircle2 size={24} /> : <step.icon size={20} />}
                            </div>
                            <span className={clsx(
                                "text-[10px] font-black uppercase tracking-widest hidden md:block",
                                currentStep === idx ? "text-fuchsia-600" : "text-gray-300"
                            )}>{step.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Sections */}
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-100 shadow-sm min-h-[400px]">
                <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <SectionHeader title="Datos Personales" subtitle="Información básica y contacto" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput label="Nombre Completo" value={formData.nombre_completo} onChange={v => handleInputChange('nombre_completo', v)} icon={User} />
                                <FormInput label="Correo Electrónico" value={formData.email} onChange={v => handleInputChange('email', v)} icon={Activity} />
                                <FormInput label="RUT" value={formData.rut} onChange={v => handleInputChange('rut', v)} icon={Target} />
                                <FormInput label="Teléfono" value={formData.telefono} onChange={v => handleInputChange('telefono', v)} icon={Phone} />
                                <FormInput label="Edad" value={formData.edad} onChange={v => handleInputChange('edad', v)} icon={Baby} />
                                <FormInput label="Ocupación" value={formData.ocupacion} onChange={v => handleInputChange('ocupacion', v)} icon={Activity} />
                                <div className="md:col-span-2">
                                    <FormTextArea label="Objetivo de consulta" value={formData.objetivo} onChange={v => handleInputChange('objetivo', v)} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <SectionHeader title="Hábitos y Estilo de Vida" subtitle="Rutinas diarias de salud" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput label="Horas de sueño" value={formData.horas_sueno} onChange={v => handleInputChange('horas_sueno', v)} icon={Moon} />
                                <FormInput label="Consumo de agua (Lts)" value={formData.consumo_agua} onChange={v => handleInputChange('consumo_agua', v)} icon={Droplets} />
                                <div className="md:col-span-2">
                                    <FormInput label="Actividad Física (Frecuencia)" value={formData.actividad_fisica} onChange={v => handleInputChange('actividad_fisica', v)} icon={Activity} />
                                </div>
                                <div className="flex items-center gap-12 pt-4">
                                    <FormSwitch label="Fuma" active={formData.tabaco} onClick={() => handleInputChange('tabaco', !formData.tabaco)} icon={Cigarette} />
                                    <FormSwitch label="Bebe Alcohol" active={formData.alcohol} onClick={() => handleInputChange('alcohol', !formData.alcohol)} icon={Beer} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <SectionHeader title="Antecedentes Médicos" subtitle="Historial clínico personal" />
                            <div className="space-y-6">
                                <FormTextArea label="Patologías Diagnosticadas" value={formData.patologias} onChange={v => handleInputChange('patologias', v)} placeholder="Ej: Hipotiroidismo, Resistencia a la insulina..." />
                                <FormTextArea label="Medicamentos actualess" value={formData.medicamentos} onChange={v => handleInputChange('medicamentos', v)} icon={Pill} />
                                <FormTextArea label="Cirugías previas" value={formData.cirugias} onChange={v => handleInputChange('cirugias', v)} icon={Scissors} />
                                <FormInput label="Alergias" value={formData.alergias} onChange={v => handleInputChange('alergias', v)} icon={Activity} />
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <SectionHeader title="Antecedentes Familiares" subtitle="Factores hereditarios" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <FormSwitch label="Diabetes" active={formData.fam_diabetes} onClick={() => handleInputChange('fam_diabetes', !formData.fam_diabetes)} />
                                <FormSwitch label="HTA" active={formData.fam_hta} onClick={() => handleInputChange('fam_hta', !formData.fam_hta)} />
                                <FormSwitch label="Obesidad" active={formData.fam_obesidad} onClick={() => handleInputChange('fam_obesidad', !formData.fam_obesidad)} />
                                <FormSwitch label="Cáncer" active={formData.fam_cancer} onClick={() => handleInputChange('fam_cancer', !formData.fam_cancer)} />
                            </div>
                            <div className="pt-6">
                                <FormTextArea label="Otros antecedentes familiares" value={formData.fam_otros} onChange={v => handleInputChange('fam_otros', v)} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <button
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-gray-400 font-bold hover:text-gray-900 disabled:opacity-0 transition-all"
                >
                    <ChevronLeft size={20} />
                    Anterior
                </button>

                {currentStep < STEPS.length - 1 ? (
                    <button
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-fuchsia-600 text-white font-black shadow-lg shadow-fuchsia-100 hover:bg-fuchsia-700 transition-all"
                    >
                        Siguiente
                        <ChevronRight size={20} />
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-10 py-4 rounded-[2rem] bg-emerald-500 text-white font-black shadow-xl shadow-emerald-100 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all"
                    >
                        {loading ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save size={20} />
                        )}
                        FINALIZAR REGISTRO
                    </button>
                )}
            </div>
        </div>
    );
}

// Components Locales
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="border-l-4 border-fuchsia-500 pl-6 space-y-1">
            <h2 className="text-2xl font-bold text-gray-900 font-serif">{title}</h2>
            <p className="text-gray-400 font-medium text-sm">{subtitle}</p>
        </div>
    );
}

function FormInput({ label, value, onChange, icon: Icon, type = "text" }: {
    label: string, value: string, onChange: (v: string) => void, icon?: any, type?: string
}) {
    return (
        <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] ml-2">{label}</label>
            <div className="relative group">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 group-focus-within:text-fuchsia-500 transition-colors" />}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={clsx(
                        "w-full py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-fuchsia-500/5 transition-all outline-none",
                        Icon ? "pl-12" : "px-6"
                    )}
                />
            </div>
        </div>
    );
}

function FormTextArea({ label, value, onChange, placeholder, icon: Icon }: {
    label: string, value: string, onChange: (v: string) => void, placeholder?: string, icon?: any
}) {
    return (
        <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] ml-2">{label}</label>
            <textarea
                rows={3}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={clsx(
                    "w-full py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-fuchsia-500/5 transition-all outline-none resize-none",
                    Icon ? "pl-12" : "px-6"
                )}
            />
            {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 pointer-events-none" />}
        </div>
    );
}

function FormSwitch({ label, active, onClick, icon: Icon }: {
    label: string, active: boolean, onClick: () => void, icon?: any
}) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm transition-all border shrink-0",
                active
                    ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-lg shadow-fuchsia-100"
                    : "bg-white text-gray-400 border-gray-100 hover:border-fuchsia-200"
            )}
        >
            {Icon && <Icon size={18} />}
            {label}
        </button>
    );
}
