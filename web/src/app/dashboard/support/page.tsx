"use client";

import { HelpCircle, MessageCircle, Mail, Globe, Search, ChevronRight, Calculator, CreditCard, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const faqs = [
    {
        q: "¿Cómo se calculan mis resultados?",
        a: "Utilizamos protocolos ISAK I y ecuaciones validadas científicamente (Durnin/Womersley, Siri, etc.) para asegurar la precisión de tu composición corporal.",
        icon: <Calculator className="w-5 h-5 text-fuchsia-600" />
    },
    {
        q: "¿Puedo ver mi historial desde el móvil?",
        a: "Sí, la plataforma es totalmente responsiva y puedes acceder a tus resultados y gráficas de evolución desde cualquier dispositivo.",
        icon: <Globe className="w-5 h-5 text-indigo-600" />
    },
    {
        q: "¿Es seguro el proceso de pago?",
        a: "Utilizamos Mercado Pago para procesar todas las transacciones, garantizando el más alto estándar de seguridad y cifrado de datos.",
        icon: <CreditCard className="w-5 h-5 text-emerald-600" />
    }
];

export default function SupportPage() {
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
            <header className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-50 text-fuchsia-600 text-xs font-black uppercase tracking-widest border border-fuchsia-100"
                >
                    <HelpCircle className="w-4 h-4" />
                    Centro de Ayuda
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif">¿En qué podemos ayudarte?</h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">Nuestro equipo de soporte está listo para asistirte en todo lo que necesites para tu transformación.</p>
            </header>

            {/* Support Channels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ContactCard
                    icon={<MessageCircle className="w-8 h-8 text-fuchsia-500" />}
                    title="Chat en Vivo"
                    desc="Habla con nosotros ahora mismo."
                    link="https://wa.me/yournumber"
                    btnText="Iniciar Chat"
                />
                <ContactCard
                    icon={<Mail className="w-8 h-8 text-indigo-500" />}
                    title="Soporte Email"
                    desc="Responderemos en menos de 24h."
                    link="mailto:soporte@nutriagenda.com"
                    btnText="Enviar Correo"
                />
                <ContactCard
                    icon={<ShieldCheck className="text-emerald-500" />}
                    title="Base de Conocimiento"
                    desc="Tutoriales y guías de uso."
                    link="#"
                    btnText="Ver Guías"
                />
            </div>

            {/* FAQs */}
            <section className="mt-16 space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 font-serif">Preguntas Frecuentes</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {faqs.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="p-8 glass rounded-[2.5rem] space-y-4"
                        >
                            <div className="p-3 bg-white w-fit rounded-2xl shadow-sm border border-gray-50">
                                {faq.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{faq.q}</h3>
                            <p className="text-gray-500 leading-relaxed">{faq.a}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Newsletter/Contact Form Highlight */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />

                <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl font-bold font-serif">¿No encontraste lo que buscabas?</h2>
                    <p className="text-slate-400 max-w-lg mx-auto">Déjanos tu mensaje y te contactaremos a la brevedad posible.</p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-4">
                        <input type="text" placeholder="Tu email..." className="px-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 outline-none focus:border-fuchsia-500 transition-colors w-full md:w-80" />
                        <button className="px-8 py-4 bg-fuchsia-600 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-fuchsia-900/40">
                            Enviar Mensaje
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContactCard({ icon, title, desc, link, btnText }: any) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="p-8 glass rounded-[3rem] text-center flex flex-col items-center justify-between"
        >
            <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-white shadow-sm border border-gray-50 border-b-4 border-b-gray-100 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                    <p className="text-gray-500 mt-2">{desc}</p>
                </div>
            </div>
            <a
                href={link}
                className="mt-8 px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition-colors w-full flex items-center justify-center gap-2 group"
            >
                {btnText}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
        </motion.div>
    );
}
