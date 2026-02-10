'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { login } from './actions';

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form className="space-y-5 pt-4" action={login}>
            {/* Email */}
            <div>
                <label className="block text-xs uppercase tracking-wide text-gray-600 mb-2 font-medium" htmlFor="email">
                    Correo Electrónico
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="doctor@ejemplo.com"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-fuchsia-500 transition-colors text-gray-900 placeholder-gray-400"
                />
            </div>

            {/* Contraseña */}
            <div>
                <label className="block text-xs uppercase tracking-wide text-gray-600 mb-2 font-medium" htmlFor="password">
                    Contraseña
                </label>
                <div className="relative">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-fuchsia-500 transition-colors text-gray-900 placeholder-gray-400 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-fuchsia-600 transition-colors p-1"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            {/* Botón Iniciar Sesión */}
            <button
                type="submit"
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-medium py-4 px-4 rounded-none transition-all tracking-wide text-sm uppercase mt-6"
            >
                Iniciar Sesión
            </button>

            {/* Link a Registro */}
            <p className="text-center text-sm text-gray-500 pt-4">
                ¿No tienes cuenta?{' '}
                <Link href="/registro" className="text-fuchsia-600 hover:underline font-medium">
                    Crear Cuenta
                </Link>
            </p>
        </form>
    );
}
