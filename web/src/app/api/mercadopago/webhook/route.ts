import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
    try {
        const body = await req.text()
        const signature = req.headers.get('x-signature')
        const requestId = req.headers.get('x-request-id')

        // Verify signature (Mercado Pago security)
        const parts = signature?.split(',')
        const ts = parts?.find(p => p.startsWith('ts='))?.split('=')[1]
        const hash = parts?.find(p => p.startsWith('v1='))?.split('=')[1]

        const manifest = `id:${requestId};request-id:${requestId};ts:${ts};`
        const hmac = crypto
            .createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET!)
            .update(manifest)
            .digest('hex')

        if (hmac !== hash) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        // Parse webhook data
        const data = JSON.parse(body)

        if (data.type === 'payment') {
            const paymentId = data.data.id

            // Get payment details from Mercado Pago
            const paymentResponse = await fetch(
                `https://api.mercadopago.com/v1/payments/${paymentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
                    }
                }
            )

            const payment = await paymentResponse.json()

            // Extract metadata
            const { userId, appointmentId } = JSON.parse(payment.external_reference || '{}')

            // Update database
            const supabase = await createClient()

            if (payment.status === 'approved') {
                // Mark appointment as paid
                await supabase
                    .from('appointments')
                    .update({
                        status: 'confirmed',
                        paid: true,
                        payment_id: paymentId
                    })
                    .eq('id', appointmentId)

                // Record payment
                await supabase
                    .from('payments')
                    .insert({
                        user_id: userId,
                        appointment_id: appointmentId,
                        amount: payment.transaction_amount,
                        currency: 'CLP',
                        status: 'approved',
                        payment_method: payment.payment_method_id,
                        payment_id: paymentId,
                        external_reference: payment.external_reference
                    })
            }
        }

        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
