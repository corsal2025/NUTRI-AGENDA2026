"use client";

import { X, CreditCard, Building2, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    planName: string;
    planPrice: string | number;
    appointmentId?: string;
    title?: string;
}

export function PaymentModal({ isOpen, onClose, planName, planPrice, appointmentId, title = "Confirmar Pago" }: PaymentModalProps) {
    const [method, setMethod] = useState<'mp' | 'transfer' | null>(null);
    const [copied, setCopied] = useState(false);

    const bankDetails = {
        bank: "Banco Estado",
        account: "22.656.262-6",
        type: "Cuenta Rut / Vista",
        rut: "22.656.262-6",
        name: "Verónica Amaya",
        email: "veronica.amaya@nutricionista.cl"
    };

    const handleCopy = () => {
        const text = `Banco: ${bankDetails.bank}\nCuenta: ${bankDetails.account}\nTipo: ${bankDetails.type}\nRUT: ${bankDetails.rut}\nNombre: ${bankDetails.name}\nEmail: ${bankDetails.email}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleMercadoPago = () => {
        // Redirigir a WhatsApp solicitando link de pago directo
        const message = `Hola Nutri Verónica, quiero pagar el plan *${planName}* (${planPrice}) con *Mercado Pago*. ¿Me podrías enviar el link de pago?`;
        window.open(`https://wa.me/56962265626?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleTransferNotify = () => {
        const message = `Hola Nutri Verónica, acabo de realizar la transferencia por el plan *${planName}*. Adjunto el comprobante.`;
        window.open(`https://wa.me/56962265626?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-gray-100">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 font-serif">{title}</h3>
                            <p className="text-sm text-gray-500">Item: <span className="text-fuchsia-600 font-bold">{planName}</span></p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-200">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto">
                        {appointmentId && !method && (
                            <div className="mb-8 p-6 bg-fuchsia-50 rounded-3xl border border-fuchsia-100 flex items-start gap-4">
                                <div className="p-2 bg-fuchsia-100 rounded-xl text-fuchsia-600">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-fuchsia-900">¡Cita agendada!</h4>
                                    <p className="text-sm text-fuchsia-700 leading-relaxed">
                                        Tu hora ha sido reservada, pero para confirmarla y validarla definitivamente, debes contratar uno de nuestros <strong>Planes Nutricionales</strong>.
                                    </p>
                                </div>
                            </div>
                        )}

                        {!method ? (
                            <div className="space-y-4">
                                <p className="text-center text-gray-600 mb-6 font-medium">
                                    {appointmentId ? "¿Con qué plan deseas asegurar tu cita?" : "Selecciona tu método de pago preferido"}
                                </p>

                                <button
                                    onClick={() => setMethod('mp')}
                                    className="w-full bg-[#009EE3]/10 hover:bg-[#009EE3]/20 border border-[#009EE3]/20 p-6 rounded-3xl flex items-center gap-6 transition-all group"
                                >
                                    <div className="size-14 bg-[#009EE3] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#009EE3]/30 group-hover:scale-110 transition-transform">
                                        <CreditCard size={28} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-lg font-bold text-[#009EE3]">Mercado Libre</h4>
                                        <p className="text-sm text-gray-500 leading-tight mt-1">Tarjetas de Crédito, Débito y Webpay. Pago seguro inmediato.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMethod('transfer')}
                                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-6 rounded-3xl flex items-center gap-6 transition-all group"
                                >
                                    <div className="size-14 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
                                        <Building2 size={28} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-lg font-bold text-gray-900">Transferencia Bancaria</h4>
                                        <p className="text-sm text-gray-500 leading-tight mt-1">Transferencia directa a cuenta corriente empresa.</p>
                                    </div>
                                </button>
                            </div>
                        ) : method === 'mp' ? (
                            <div className="space-y-6 text-center">
                                <div className="size-20 mx-auto bg-[#009EE3]/10 rounded-full flex items-center justify-center text-[#009EE3] mb-4">
                                    <CreditCard size={40} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-900 font-serif mb-2">Pago con Mercado Libre</h4>
                                    <p className="text-gray-500 mb-8">
                                        Generaremos un link de pago seguro a través de Mercado Libre / Mercado Pago para tu plan.
                                    </p>
                                </div>
                                <button
                                    onClick={handleMercadoPago}
                                    className="w-full py-4 bg-[#009EE3] text-white rounded-2xl font-bold hover:bg-[#0081B8] transition-colors shadow-xl shadow-[#009EE3]/20 flex items-center justify-center gap-2"
                                >
                                    <CreditCard size={20} />
                                    Solicitar Link de Pago
                                </button>
                                <button
                                    onClick={() => setMethod(null)}
                                    className="text-gray-400 hover:text-gray-900 text-sm font-medium underline decoration-gray-300 underline-offset-4"
                                >
                                    Volver atrás
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 relative">
                                    <button
                                        onClick={handleCopy}
                                        className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-fuchsia-600 transition-colors border border-gray-100 active:scale-95"
                                        title="Copiar datos"
                                    >
                                        {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                                    </button>

                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Banco</p>
                                        <p className="text-gray-900 font-medium">{bankDetails.bank}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo de Cuenta</p>
                                        <p className="text-gray-900 font-medium">{bankDetails.type}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Número de Cuenta</p>
                                        <p className="text-gray-900 font-mono text-lg">{bankDetails.account}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">RUT</p>
                                        <p className="text-gray-900 font-mono">{bankDetails.rut}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</p>
                                        <p className="text-gray-900 font-medium">{bankDetails.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</p>
                                        <p className="text-gray-900 font-medium">{bankDetails.email}</p>
                                    </div>
                                </div>

                                <div className="text-center space-y-4">
                                    <p className="text-gray-500 text-sm">
                                        Una vez realizada la transferencia, envíanos el comprobante para activar tu plan inmediatamente.
                                    </p>
                                    <button
                                        onClick={handleTransferNotify}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={20} />
                                        Notificar Transferencia
                                    </button>
                                    <button
                                        onClick={() => setMethod(null)}
                                        className="text-gray-400 hover:text-gray-900 text-sm font-medium underline decoration-gray-300 underline-offset-4"
                                    >
                                        Volver atrás
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
