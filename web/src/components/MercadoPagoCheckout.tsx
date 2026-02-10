'use client'

import { useState } from 'react'
import { loadMercadoPago } from '@mercadopago/sdk-js'

export default function MercadoPagoCheckout({
    amount,
    description,
    onSuccess
}: {
    amount: number
    description: string
    onSuccess: (paymentId: string) => void
}) {
    const [loading, setLoading] = useState(false)

    const handlePayment = async () => {
        setLoading(true)

        try {
            // Initialize Mercado Pago SDK
            await loadMercadoPago()
            const mp = new window.MercadoPago('YOUR_PUBLIC_KEY', {
                locale: 'es-CL'
            })

            // Create preference (this should be done in backend)
            const response = await fetch('/api/mercadopago/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, description })
            })

            const { preferenceId } = await response.json()

            // Redirect to Mercado Pago checkout
            mp.checkout({
                preference: {
                    id: preferenceId
                },
                autoOpen: true
            })

        } catch (error) {
            console.error('Error al procesar pago:', error)
            alert('Error al procesar el pago')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Realizar Pago</h3>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monto a pagar:</span>
                    <span className="text-2xl font-bold text-primary">
                        ${amount.toLocaleString('es-CL')} CLP
                    </span>
                </div>

                <div className="text-sm text-gray-600">
                    {description}
                </div>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-[#009EE3] hover:bg-[#0084C2] text-white font-bold py-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        'Procesando...'
                    ) : (
                        <>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 9.75l-6.188 6.188c-.281.281-.656.422-1.031.422s-.75-.141-1.031-.422L6.438 13.5c-.563-.563-.563-1.5 0-2.063s1.5-.563 2.063 0l1.781 1.781 5.156-5.156c.563-.563 1.5-.563 2.063 0s.563 1.5.062 2.063z" />
                            </svg>
                            Pagar con Mercado Pago
                        </>
                    )}
                </button>

                <div className="text-xs text-gray-500 text-center">
                    O también puedes realizar una transferencia bancaria
                </div>
            </div>
        </div>
    )
}
