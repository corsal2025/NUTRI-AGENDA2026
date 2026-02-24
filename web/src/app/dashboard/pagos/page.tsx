"use client";

import { Check, Star, Zap, CreditCard, ShieldCheck, Globe, Trophy, Building2 } from "lucide-react";
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
            <header className="text-center space-y-4 mb-16">
                <h1 className="text-5xl font-bold font-serif text-gray-900">Medios de Pago</h1>
                <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                    Gestiona tus pagos de forma segura a través de nuestras plataformas principales.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
                {/* Mercado Libre / Mercado Pago Container */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative rounded-[3rem] p-10 flex flex-col transition-all border bg-white border-[#009EE3]/20 shadow-xl shadow-[#009EE3]/5 hover:shadow-2xl"
                >
                    <div className="mb-8 text-center">
                        <div className="size-20 rounded-[2rem] bg-[#009EE3]/10 flex items-center justify-center mx-auto mb-6 border border-[#009EE3]/20">
                            <CreditCard size={40} className="text-[#009EE3]" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 font-serif mb-2">Mercado Libre</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Pago seguro con Tarjetas de Crédito, Débito y Webpay.
                        </p>
                    </div>
                    <button
                        onClick={() => setSelectedPlan({ name: 'Pago General', price: 'Link Personalizado' })}
                        className="mt-auto w-full py-5 px-6 rounded-3xl font-black text-xs uppercase tracking-[0.1em] transition-all transform hover:scale-[1.02] bg-[#009EE3] text-white shadow-lg shadow-[#009EE3]/20 hover:bg-[#0081B8]"
                    >
                        PAGAR CON MERCADO LIBRE
                    </button>
                </motion.div>

                {/* Transferencia Container */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative rounded-[3rem] p-10 flex flex-col transition-all border bg-white border-slate-200 shadow-xl shadow-slate-100/50 hover:shadow-2xl"
                >
                    <div className="mb-8 text-center">
                        <div className="size-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
                            <Building2 size={40} className="text-slate-700" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 font-serif mb-2">Transferencia</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Depósito directo a nuestra cuenta corriente profesional.
                        </p>
                    </div>
                    <button
                        onClick={() => setSelectedPlan({ name: 'Transferencia Directa', price: 'Datos Bancarios' })}
                        className="mt-auto w-full py-5 px-6 rounded-3xl font-black text-xs uppercase tracking-[0.1em] transition-all transform hover:scale-[1.02] bg-gray-900 text-white shadow-lg shadow-gray-200 hover:bg-black"
                    >
                        VER DATOS BANCARIOS
                    </button>
                </motion.div>
            </div>

            <div className="mt-16 bg-slate-50 rounded-[2.5rem] p-8 border border-gray-100 text-center max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-4 text-emerald-600 mb-2">
                    <ShieldCheck size={24} />
                    <span className="font-bold uppercase tracking-widest text-[10px]">Transacción 100% Segura</span>
                </div>
                <p className="text-gray-500 text-sm italic">
                    "Si necesitas un link de pago por un monto específico, no dudes en solicitarlo por interno."
                </p>
            </div>

            <PaymentModal
                isOpen={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
                planName={selectedPlan?.name || ''}
                planPrice={selectedPlan?.price || ''}
                title="Selecciona Detalle de Pago"
            />
        </div>
    );
}

