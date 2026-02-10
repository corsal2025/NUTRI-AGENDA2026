import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Mercado Pago SDK
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN!
const MERCADOPAGO_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
    try {
        const { amount, description, userId, appointmentId } = await req.json()

        // Create preference
        const preference = {
            items: [
                {
                    title: description,
                    quantity: 1,
                    currency_id: 'CLP',
                    unit_price: amount
                }
            ],
            back_urls: {
                success: `${process.env.NEXT_PUBLIC_BASE_URL}/pago/exitoso`,
                failure: `${process.env.NEXT_PUBLIC_BASE_URL}/pago/fallido`,
                pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pago/pendiente`
            },
            auto_return: 'approved',
            notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`,
            external_reference: JSON.stringify({ userId, appointmentId }),
            statement_descriptor: 'VERONICA AMAYA NUTRI'
        }

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`
            },
            body: JSON.stringify(preference)
        })

        const data = await response.json()

        return NextResponse.json({
            preferenceId: data.id,
            initPoint: data.init_point
        })

    } catch (error: any) {
        console.error('Mercado Pago Error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
