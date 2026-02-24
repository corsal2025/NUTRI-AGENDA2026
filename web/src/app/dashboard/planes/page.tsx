"use client";

import { Check, Star, Zap, CreditCard, ShieldCheck, Globe, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { configService, Plan } from "@/services/configService";

export default function PlanesPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlans() {
            const plansData = await configService.getPlans();
            if (plansData) setPlans(plansData);
            setLoading(false);
        }
        fetchPlans();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 space-y-12 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="text-center space-y-4 mb-16">
                <h1 className="text-5xl font-bold font-serif text-gray-900">Planes de Atención</h1>
                <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                    Estructura de servicios profesionales diseñados para tu salud y rendimiento.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative rounded-[3rem] p-10 flex flex-col transition-all border bg-white border-gray-100 shadow-sm hover:shadow-xl"
                    >
                        <div className="mb-10 text-center">
                            <div className="size-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100">
                                <Star size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 font-serif mb-2 uppercase tracking-tight">{plan.name}</h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-black text-gray-900">{plan.price_display}</span>
                            </div>
                            <p className="mt-4 text-sm text-gray-500 font-medium italic">
                                "{plan.description}"
                            </p>
                        </div>

                        <div className="mt-auto pt-8 border-t border-slate-50">
                            <button className="w-full py-5 px-6 rounded-3xl font-black text-xs uppercase tracking-[0.1em] transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg bg-gray-900 text-white shadow-gray-100 hover:bg-black">
                                MÁS INFORMACIÓN
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
