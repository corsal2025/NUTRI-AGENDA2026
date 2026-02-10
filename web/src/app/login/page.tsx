import LoginForm from './LoginForm'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; mensaje?: string }>
}) {
    const params = await searchParams;

    const errorMessage = params.error === 'login_failed'
        ? 'Error al entrar. ¿Ya confirmaste tu correo?'
        : params.error === 'signup_failed'
            ? 'Error al registrarse. Intenta con otro correo.'
            : null;

    const successMessage = params.mensaje;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Card principal */}
                <div className="bg-white rounded-3xl shadow-2xl p-10 space-y-6">
                    {/* Logo y título */}
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl font-serif tracking-tight text-gray-900">
                            NUTRI
                            <span className="text-fuchsia-600">+</span>
                        </h1>
                        <p className="text-sm text-gray-500 font-light tracking-wide">
                            Bienvenido a Nutri-Agenda
                        </p>
                    </div>

                    {/* Mensaje de éxito */}
                    {successMessage && (
                        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 px-4 py-3 text-sm">
                            {successMessage}
                        </div>
                    )}

                    {/* Error */}
                    {errorMessage && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 text-sm">
                            {errorMessage}
                        </div>
                    )}

                    {/* Formulario */}
                    <LoginForm />
                </div>

                {/* Pie de página */}
                <p className="text-center text-xs text-gray-400 mt-8 tracking-wide">
                    BY VERÓNICA AMAYA
                </p>
            </div>
        </div>
    )
}
