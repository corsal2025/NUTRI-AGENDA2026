'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error('Login error:', error)
        redirect('/login?error=login_failed')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const origin = (await headers()).get('origin')

    const { data: authData, error } = await supabase.auth.signUp({
        ...data,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (authData.session) {
        console.log('Signup: Session created immediately (Email verification disabled)')
    } else if (authData.user) {
        console.log('Signup: User created, waiting for email verification')
        // Optional: Redirect to a specific "check email" page if you wanted to be strict
    }

    if (error) {
        console.error('Signup error:', error)
        redirect('/login?error=signup_failed')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
