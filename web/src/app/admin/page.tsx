import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Activity, Calendar, CreditCard, TrendingUp, Users } from "lucide-react";

export default async function AdminDashboard() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // Check if user is admin
    const { data: profile } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
    if (profile?.rol !== 'admin') {
        redirect('/dashboard');
    }

    // 1. Fetch Total Patients
    const { count: totalPatients } = await supabase
        .from('perfiles')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'paciente');

    // 2. Fetch Today's Appointments
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const { count: todayAppointments } = await supabase
        .from('citas')
        .select('*', { count: 'exact', head: true })
        .eq('fecha_cita', today);

    // 3. Calculate Monthly Revenue (CLP)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];

    const { data: revenueRecords } = await supabase
        .from('citas')
        .select('monto_total')
        .gte('fecha_cita', firstDayStr)
        .eq('estado_pago', 'pagado');

    const monthlyRevenue = revenueRecords?.reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0) || 0;

    // 4. Fetch Active Programs (Mocked for now as we don't have a specific table, but using measurements count as proxy)
    const { count: totalEvaluations } = await supabase
        .from('evaluaciones_nutricionales')
        .select('*', { count: 'exact', head: true });

    const stats = {
        totalPatients: totalPatients || 0,
        todayAppointments: todayAppointments || 0,
        monthlyRevenueCLP: monthlyRevenue,
        activePrograms: totalEvaluations || 0
    };

    // Fetch patient evolution (last 6 months)
    const months = [];
    for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const name = d.toLocaleString('es-ES', { month: 'short' });

        // Count total patients up to that month
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        const endOfMonthStr = endOfMonth.toISOString().split('T')[0];

        const { count } = await supabase
            .from('perfiles')
            .select('*', { count: 'exact', head: true })
            .eq('rol', 'paciente')
            .lte('created_at', endOfMonthStr);

        months.push({ month: name.charAt(0).toUpperCase() + name.slice(1, 3), patients: count || 0 });
    }

    const evolutionData = months;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
                <p className="text-gray-600 mt-1">Verónica Amaya - Nutrición y Deporte</p>
            </div>

            {/* Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="Pacientes Registrados"
                    value={stats.totalPatients.toString()}
                    color="from-blue-500 to-blue-600"
                />
                <StatCard
                    icon={Calendar}
                    label="Citas Hoy"
                    value={stats.todayAppointments.toString()}
                    color="from-green-500 to-green-600"
                />
                <StatCard
                    icon={CreditCard}
                    label="Ingresos Mes (CLP)"
                    value={`$${stats.monthlyRevenueCLP.toLocaleString('es-CL')}`}
                    color="from-fuchsia-600 to-pink-600"
                />
                <StatCard
                    icon={Activity}
                    label="Evaluaciones Totales"
                    value={stats.activePrograms.toString()}
                    color="from-purple-500 to-purple-600"
                />
            </section>

            {/* Patient Evolution Chart */}
            <section className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="text-primary" size={24} />
                        Evolución de Pacientes
                    </h2>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>Últimos 6 meses</option>
                        <option>Este año</option>
                        <option>Todo el tiempo</option>
                    </select>
                </div>

                {/* Simple Bar Chart */}
                <div className="flex items-end justify-around h-64 gap-4">
                    {evolutionData.map((item, idx) => {
                        const maxPatients = Math.max(...evolutionData.map(d => d.patients));
                        const heightPercent = (item.patients / maxPatients) * 100;

                        return (
                            <div key={idx} className="flex flex-col items-center flex-1">
                                <div className="text-sm font-bold text-gray-700 mb-2">
                                    {item.patients}
                                </div>
                                <div
                                    className="w-full bg-gradient-to-t from-primary to-pink-400 rounded-t-lg transition-all hover:opacity-80"
                                    style={{ height: `${heightPercent}%` }}
                                ></div>
                                <div className="text-xs text-gray-600 mt-2 font-medium">
                                    {item.month}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ActionCard
                    title="Nueva Cita"
                    description="Agendar cita con paciente"
                    href="/admin/citas/nueva"
                    bgColor="bg-blue-50 hover:bg-blue-100"
                    textColor="text-blue-600"
                />
                <ActionCard
                    title="Registro de Pago"
                    description="Registrar pago manual"
                    href="/admin/pagos/nuevo"
                    bgColor="bg-green-50 hover:bg-green-100"
                    textColor="text-green-600"
                />
                <ActionCard
                    title="Ver Pacientes"
                    description="Lista completa de pacientes"
                    href="/admin/pacientes"
                    bgColor="bg-purple-50 hover:bg-purple-100"
                    textColor="text-purple-600"
                />
            </section>
        </div>
    );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }: {
    icon: any;
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white transform transition hover:scale-105`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/80 text-sm font-medium mb-1">{label}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                    <Icon size={28} />
                </div>
            </div>
        </div>
    );
}

// Action Card Component
function ActionCard({ title, description, href, bgColor, textColor }: {
    title: string;
    description: string;
    href: string;
    bgColor: string;
    textColor: string;
}) {
    return (
        <a
            href={href}
            className={`${bgColor} rounded-xl p-6 transition-all shadow-sm hover:shadow-md`}
        >
            <h3 className={`${textColor} font-bold text-lg mb-1`}>{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
        </a>
    );
}
