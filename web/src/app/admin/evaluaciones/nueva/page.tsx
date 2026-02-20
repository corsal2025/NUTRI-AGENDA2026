export const dynamic = 'force-dynamic'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AnthropometryForm from "@/components/AnthropometryForm";

export default async function NuevaEvaluacionPage({
    searchParams
}: {
    searchParams: { paciente?: string }
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // Get patient ID from query params or use current user
    const patientId = searchParams.paciente || user.id;

    // Fetch patient info
    const { data: patient } = await supabase
        .from('perfiles')
        .select('nombre_completo, email')
        .eq('id', patientId)
        .single();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Patient Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Nueva Evaluación Antropométrica
                    </h1>
                    {patient && (
                        <p className="text-gray-600 mt-2">
                            Paciente: <span className="font-semibold">{patient.nombre_completo}</span> · {patient.email}
                        </p>
                    )}
                </div>

                {/* Form */}
                <AnthropometryForm patientId={patientId} />
            </div>
        </div>
    );
}
