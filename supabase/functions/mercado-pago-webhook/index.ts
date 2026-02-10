// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from Functions!")

serve(async (req) => {
  const { url, method } = req

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Mercado Pago sends a POST request with the payment data
    // We expect query params like ?id=...&topic=payment in some versions, or a body.
    // Standard MP Webhook payload:
    // { "action": "payment.created", "data": { "id": "123" }, "type": "payment" }
    
    const body = await req.json()
    console.log('Webhook received:', body)

    if (body.type === 'payment' || body.topic === 'payment') {
      const paymentId = body.data?.id || body.resource // 'resource' is sometimes the URL, 'id' is standard
      
      if (!paymentId) {
        return new Response(JSON.stringify({ error: 'No payment ID found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // Verify payment status with Mercado Pago API using fetch
      // We need the ACCESS_TOKEN env var
      const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN');
      if (!mpAccessToken) {
         throw new Error('MP_ACCESS_TOKEN not configured');
      }

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
            'Authorization': `Bearer ${mpAccessToken}`
        }
      });
      
      if (!mpResponse.ok) {
        throw new Error(`Failed to fetch payment ${paymentId} from MP`);
      }

      const paymentData = await mpResponse.json();
      console.log('Payment status:', paymentData.status);

      // Find the appointment with this preference_id (external_reference in MP often maps to our ID)
      // Or we can search by preference_id which we stored.
      // Ideally we stored the preference_id in `citas`. 
      // The payment object has `external_reference` if we sent it during preference creation.
      // Let's assume we match by preference_id or external_reference.
      
      // For this MVP, let's assume we use external_reference as the Appointment ID (UUID)
      const appointmentId = paymentData.external_reference;

      if (paymentData.status === 'approved' && appointmentId) {
          // Update Supabase
          const { error } = await supabase
            .from('citas')
            .update({ estado_pago: 'pagado' })
            .eq('id', appointmentId)

          if (error) {
            console.error('Error updating appointment:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            })
          }
          
          // Trigger Email (Example: Insert into a 'mail_queue' table or call another function)
          // For now, simple log
          console.log(`Appointment ${appointmentId} marked as PAID`);
      }
    }

    return new Response(JSON.stringify({ message: "Webhook processed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
