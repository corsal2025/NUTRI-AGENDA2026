"use client";

import { Check, Star, Zap, CreditCard, ShieldCheck, Globe, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { PaymentModal } from "@/components/PaymentModal";

const plans = [
    {
        name: "Básico",
        price: "CLP $0",
        description: "Ideal para pacientes que inician su cambio de hábitos.",
        features: ["Seguimiento de peso", "Historial de mediciones", "Reportes básicos PDF", "Soporte vía Email"],
        color: "slate",
        icon: Globe,
        popular: false
    },
    {
        name: "Premium",
        price: "CLP $24.990",
        subtitle: "/mes",
        description: "El estándar de oro para resultados clínicos garantizados.",
        features: ["Análisis ISAK completo", "Somatocarta dinámica", "Planes de dieta personalizados", "Soporte 24/7 Premium", "Acceso a App Móvil"],
        color: "fuchsia",
        icon: Star,
        popular: true
    },
    {
        name: "Elite",
        price: "CLP $45.990",
        subtitle: "/mes",
        description: "Alto rendimiento y optimización metabólica avanzada.",
        features: ["Todo lo de Premium", "Análisis de somatotipo pro", "Seguimiento de suplementación", "Bio-scan de evolución semanal"],
        color: "indigo",
        icon: Trophy,
        popular: false
    }
];

export default function PagosPage() {
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);

    return (
        <div className="p-4 lg:p-8 space-y-12 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header ... */}
            <header className="text-center space-y-4 mb-16">
                <h1 className="text-5xl font-bold font-serif text-gray-900">Inversión en Salud</h1>
                <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                    Accede a herramientas avanzadas de nutrición clínica y deportiva con nuestros planes de suscripción profesional.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative rounded-[3rem] p-10 flex flex-col transition-all border ${plan.popular
                            ? 'bg-white border-fuchsia-100 shadow-2xl shadow-fuchsia-100/50 scale-105 z-10'
                            : 'bg-white border-gray-100 shadow-sm hover:shadow-xl'
                            }`}
                    >
                        {/* ... content ... */}
                        {plan.popular && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-fuchsia-600 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-fuchsia-200 flex items-center gap-2">
                                <Star className="size-3 fill-white" /> Recomendado
                            </div>
                        )}

                        <div className="mb-10 text-center">
                            <div className={`size-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border ${plan.color === 'fuchsia' ? 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100' :
                                plan.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                    'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                <plan.icon size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 font-serif mb-2 uppercase tracking-tight">{plan.name}</h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                                {plan.subtitle && <span className="text-gray-400 font-bold text-xs">{plan.subtitle}</span>}
                            </div>
                        </div>

                        <ul className="space-y-5 mb-12 flex-grow">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-4">
                                    <div className={`mt-1 size-5 rounded-full flex items-center justify-center shrink-0 ${plan.color === 'fuchsia' ? 'bg-fuchsia-100 text-fuchsia-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        <Check className="size-3" strokeWidth={3} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 leading-tight">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => setSelectedPlan({ name: plan.name, price: plan.price })}
                            className={`w-full py-5 px-6 rounded-3xl font-black text-xs uppercase tracking-[0.1em] transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg ${plan.color === 'fuchsia'
                                ? 'bg-fuchsia-600 text-white shadow-fuchsia-100 hover:bg-fuchsia-700'
                                : 'bg-gray-900 text-white shadow-gray-100 hover:bg-black'
                                }`}>
                            SELECCIONAR PLAN
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10">
                {/* ... existing footer content ... */}
                <div className="flex items-start gap-6">
                    <div className="size-16 rounded-[2rem] bg-white shadow-sm flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-50">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 font-serif">Procesamiento Seguro</h4>
                        <p className="text-gray-500 text-sm mt-1 max-w-sm">
                            Tus transacciones están protegidas por encriptación bancaria de grado médico. Aceptamos Visa, MasterCard y Webpay.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6 saturate-0 opacity-40 hover:saturate-100 hover:opacity-100 transition-all">
                    <div className="h-8 w-12 bg-gray-300 rounded-md" />
                    <div className="h-8 w-12 bg-gray-400 rounded-md" />
                    <div className="h-8 w-12 bg-gray-300 rounded-md" />
                    <CreditCard className="size-8 text-gray-400" />
                </div>
            </div>

            <PaymentModal
                isOpen={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
                planName={selectedPlan?.name || ''}
                planPrice={selectedPlan?.price || ''}
                title="Contratar Plan Nutricional"
            />
        </div>
    );
}

