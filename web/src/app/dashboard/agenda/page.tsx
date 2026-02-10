import { CalendarWidget } from "@/components/CalendarWidget";

export default function AgendaPage() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Agenda Nutricional</h2>
                    <p className="text-gray-500 mt-2">Gestiona tus citas y disponibilidad.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Widget takes up significant space */}
                <div className="lg:col-span-2">
                    <CalendarWidget />
                </div>

                {/* Side panel for upcoming/info (placeholder for now) */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Próxima Cita</h3>
                        <p className="text-gray-500 text-sm">Selecciona una fecha en el calendario para ver detalles.</p>
                    </div>

                    <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <h4 className="font-bold text-indigo-800 mb-1">Recordatorio</h4>
                        <p className="text-xs text-indigo-600">Recuerda confirmar tu asistencia 24 horas antes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
