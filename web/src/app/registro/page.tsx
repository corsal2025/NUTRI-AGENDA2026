'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegistroPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: '',
        genero: '',
        fechaNacimiento: '',
        aceptaTerminos: false
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validaciones
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres')
            return
        }

        if (!formData.aceptaTerminos) {
            setError('Debes aceptar los términos y condiciones')
            return
        }

        setLoading(true)

        try {
            // Crear usuario en Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        nombre: formData.nombre,
                        telefono: formData.telefono,
                        genero: formData.genero,
                        fecha_nacimiento: formData.fechaNacimiento
                    }
                }
            })

            if (authError) throw authError

            if (authData.session) {
                // Si hay sesión, el email verification está desactivado o se auto-confirmó
                router.push('/dashboard')
            } else {
                // Si no hay sesión, requiere verificación de email
                router.push('/login?mensaje=Por favor verifica tu email para activar tu cuenta')
            }
        } catch (err: any) {
            console.error('Registration error:', err)
            let msg = err.message || 'Error al crear la cuenta'

            // Traducción de errores comunes de Supabase
            if (msg.includes('Email signups are disabled')) {
                msg = 'El registro por correo está desactivado en Supabase. Ve a Authentication > Providers > Email y activa "Enable Email provider".'
            } else if (msg.includes('User already registered')) {
                msg = 'Este correo ya está registrado. Intenta iniciar sesión.'
            } else if (msg.includes('Password should be')) {
                msg = 'La contraseña es muy débil.'
            }

            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Panel Izquierdo - Hero Minimalista */}
            <div className="hidden lg:flex lg:w-1/2 bg-white flex-col items-center justify-center p-16 relative overflow-hidden">
                {/* Fondo decorativo sutil */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-32 h-32 border-2 border-gray-300 rounded-full"></div>
                    <div className="absolute bottom-20 right-20 w-40 h-40 border-2 border-gray-300 rounded-full"></div>
                </div>

                <div className="max-w-md space-y-12 text-center z-10">
                    {/* Título Elegante - Estilo "PROPER NUTRITION" */}
                    <div className="space-y-6">
                        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase font-light">
                            By Verónica Amaya
                        </p>
                        <h1 className="text-6xl font-serif tracking-tight text-gray-900">
                            NUTRI
                            <span className="text-fuchsia-600">+</span>
                        </h1>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-light text-gray-700">
                                Tu camino hacia
                            </h2>
                            <h3 className="text-3xl font-serif text-gray-900">
                                Una Mejor Nutrición
                            </h3>
                        </div>
                    </div>

                    {/* Ilustración minimalista con líneas */}
                    <div className="py-12">
                        <svg
                            className="w-full h-48 mx-auto"
                            viewBox="0 0 240 160"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Tenedor */}
                            <g opacity="0.3" stroke="#9CA3AF" strokeWidth="1.5">
                                <line x1="40" y1="40" x2="40" y2="120" />
                                <line x1="35" y1="40" x2="35" y2="60" />
                                <line x1="45" y1="40" x2="45" y2="60" />
                                <line x1="33" y1="40" x2="47" y2="40" />
                            </g>

                            {/* Plato */}
                            <g opacity="0.3" stroke="#9CA3AF" strokeWidth="1.5">
                                <circle cx="120" cy="80" r="35" fill="none" />
                                <circle cx="120" cy="80" r="30" fill="none" />
                            </g>

                            {/* Cuchillo */}
                            <g opacity="0.3" stroke="#9CA3AF" strokeWidth="1.5">
                                <line x1="200" y1="40" x2="200" y2="120" />
                                <path d="M 195 40 L 205 40 L 202 50 L 198 50 Z" fill="#9CA3AF" />
                            </g>
                        </svg>
                    </div>

                    {/* Elementos decorativos de comida */}
                    <div className="flex justify-center items-center gap-6 text-4xl opacity-40">
                        <span>🥗</span>
                        <span>🍎</span>
                        <span>🥑</span>
                    </div>
                </div>
            </div>

            {/* Panel Derecho - Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="max-w-md w-full space-y-8">
                    {/* Header Simple */}
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-serif text-gray-900">Bienvenido</h2>
                        <p className="text-sm text-gray-500 font-light">
                            Crea tu cuenta para comenzar
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nombre Completo */}
                        <div>
                            <label htmlFor="nombre" className="block text-xs uppercase tracking-wide text-gray-600 mb-2 font-medium">
                                Nombre Completo
                            </label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                required
                                value={formData.nombre}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-fuchsia-500 transition-colors text-gray-900"
                                placeholder="María González"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-xs uppercase tracking-wide text-gray-600 mb-2 font-medium">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-fuchsia-500 transition-colors text-gray-900"
                                placeholder="tu@email.com"
                            />
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label htmlFor="telefono" className="block text-xs uppercase tracking-wide text-gray-600 mb-2 font-medium">
                                Teléfono
                            </label>
                            <input
                                id="telefono"
                                name="telefono"
                                type="tel"
                                required
                                value={formData.telefono}
                                onChange={handleChange}
                                pattern="[0-9]{9}"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-fuchsia-500 transition-colors text-gray-900"
                                placeholder="912345678"
                            />
                        </div>

                        {/* Género y Fecha de Nacimiento */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="genero" className="block text-xs uppercase tracking-wide text-gray-600 mb-2 font-medium">
                                    Género
                                </label>
                                <select
                                    id="genero"
                                    name="genero"
                                    required
                                    value={formData.genero}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-fuchsia-500 transition-colors text-gray-900"
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="fechaNacimiento" className="block text-xs uppercase tracking-wide text-gray-600 mb-2 font-medium">
                                    Nacimiento
                                </label>
                                <input
                                    id="fechaNacimiento"
                                    name="fechaNacimiento"
                                    type="date"
                                    required
                                    value={formData.fechaNacimiento}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-fuchsia-500 transition-colors text-gray-900"
                                />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label htmlFor="password" className="block text-xs uppercase tracking-wide text-gray-600 mb-2 font-medium">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-fuchsia-500 transition-colors text-gray-900"
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>

                        {/* Confirmar Contraseña */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs uppercase tracking-wide text-gray-600 mb-2 font-medium">
                                Confirmar Contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-fuchsia-500 transition-colors text-gray-900"
                                placeholder="Repite tu contraseña"
                            />
                        </div>

                        {/* Términos y Condiciones */}
                        <div className="flex items-start pt-2">
                            <input
                                id="aceptaTerminos"
                                name="aceptaTerminos"
                                type="checkbox"
                                checked={formData.aceptaTerminos}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 text-fuchsia-600 border-gray-300 focus:ring-fuchsia-500"
                            />
                            <label htmlFor="aceptaTerminos" className="ml-3 text-xs text-gray-600 leading-relaxed">
                                Acepto los{' '}
                                <Link href="/terminos" className="text-fuchsia-600 hover:underline">
                                    términos y condiciones
                                </Link>
                                {' '}y la{' '}
                                <Link href="/privacidad" className="text-fuchsia-600 hover:underline">
                                    política de privacidad
                                </Link>
                            </label>
                        </div>

                        {/* Botón de Registro */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-medium py-4 px-4 rounded-none transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-wide text-sm uppercase"
                        >
                            {loading ? 'Creando cuenta...' : 'Registrarse'}
                        </button>

                        {/* Link a Login */}
                        <p className="text-center text-sm text-gray-500 pt-4">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/login" className="text-fuchsia-600 hover:underline font-medium">
                                Inicia sesión
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
