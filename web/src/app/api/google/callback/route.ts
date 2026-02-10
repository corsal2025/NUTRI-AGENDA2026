import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/callback`
)

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // userId

    if (!code || !state) {
        return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
    }

    try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code)

        // Save tokens to user profile
        const supabase = await createClient()
        await supabase
            .from('perfiles')
            .update({
                google_access_token: tokens.access_token,
                google_refresh_token: tokens.refresh_token,
                google_token_expiry: new Date(tokens.expiry_date!).toISOString()
            })
            .eq('id', state)

        // Redirect to success page
        return NextResponse.redirect(new URL('/admin/configuracion?google=success', req.url))

    } catch (error: any) {
        console.error('Google OAuth Error:', error)
        return NextResponse.redirect(new URL('/admin/configuracion?google=error', req.url))
    }
}
