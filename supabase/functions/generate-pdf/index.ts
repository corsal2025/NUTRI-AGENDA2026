import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { PDFDocument, StandardFonts, rgb } from 'https://cdn.skypack.dev/pdf-lib'

console.log("Hello from PDF Generator!")

serve(async (req) => {
    const { method } = req

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { reportData } = await req.json()

        if (!reportData) {
            throw new Error('Missing reportDat in body');
        }

        // Create a new PDFDocument
        const pdfDoc = await PDFDocument.create()

        // Embed the Times Roman font
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

        // Add a blank page to the document
        const page = pdfDoc.addPage()

        // Get the width and height of the page
        const { width, height } = page.getSize()

        // Draw a string of text toward the top of the page
        const fontSize = 30
        page.drawText(`Informe Nutricional: ${reportData.patientName || 'Paciente'}`, {
            x: 50,
            y: height - 4 * fontSize,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0.53, 0.71),
        })

        // Add content
        page.drawText(`Fecha: ${new Date().toLocaleDateString()}`, {
            x: 50,
            y: height - 6 * fontSize,
            size: 12,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        if (reportData.weight) {
            page.drawText(`Peso: ${reportData.weight} kg`, {
                x: 50,
                y: height - 8 * fontSize,
                size: 14,
                font: timesRomanFont,
            });
        }

        // Serialize the PDFUrl
        const pdfBytes = await pdfDoc.save()

        // In a real app, we would:
        // 1. Upload pdfBytes to Supabase Storage.
        // 2. Get the public URL.
        // 3. Send email with the link/attachment.

        // For now, return the bytes as base64 or just success message
        // Returning base64 so client can download/preview
        const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

        return new Response(
            JSON.stringify({
                message: "PDF Generated successfully",
                pdfBase64: base64Pdf
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200
            },
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        })
    }
})
