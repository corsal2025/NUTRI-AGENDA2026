export const dynamic = 'force-dynamic'

"use client";

import { useEffect, useState } from "react";
import { Save, Clock, CreditCard, CheckCircle } from "lucide-react";
import { configService, Plan, AppConfig } from "@/services/configService";
import { createClient } from "@/utils/supabase/client";

export default function SettingsPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [availability, setAvailability] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            const [plansData, availabilityData, configData] = await Promise.all([
                configService.getPlans(),
                configService.getConfig('availability'),
                configService.getConfig('contact_info')
            ]);

            // Security Check: Only allow if user email matches contact email
            // OR if it's the very first setup (no contact email yet)
            const adminEmail = configData?.email;
            if (adminEmail && user?.email !== adminEmail) {
                // If the user is NOT the admin, redirect them out
                console.warn("Unauthorized access to settings");
                window.location.href = '/dashboard';
                return;
            }

            setPlans(plansData);
            setAvailability(availabilityData || {});
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlanUpdate = (index: number, field: keyof Plan, value: any) => {
        const newPlans = [...plans];
        newPlans[index] = { ...newPlans[index], [field]: value };
        setPlans(newPlans);
    };

    const handleAvailabilityUpdate = (day: string, slotsString: string) => {
        const slots = slotsString.split(',').map(s => s.trim()).filter(s => s);
        setAvailability({ ...availability, [day]: slots });
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            // Update plans
            await Promise.all(plans.map(plan => configService.updatePlan(plan.id, plan)));

            // Update availability
            await configService.updateConfig('availability', availability);

            alert("Configuración guardada exitosamente");
        } catch (error) {
            console.error(error);
            alert("Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-fuchsia-600">Cargando configuración...</div>;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels: { [key: string]: string } = {
        monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves',
        friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo'
    };

    return (
        <div className="p-6 max-w-5xl mx-auto pb-24">
            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-8">Configuración del Sistema</h1>

            <div className="grid gap-8">
                {/* Plans Configuration */}
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-fuchsia-100">
                    <h2 className="text-xl font-bold text-fuchsia-700 mb-4 flex items-center gap-2">
                        <CreditCard size={20} /> Planes y Precios
                    </h2>
                    <div className="space-y-6">
                        {plans.map((plan, index) => (
                            <div key={plan.id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50 flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nombre del Plan</label>
                                    <input
                                        type="text"
                                        value={plan.name}
                                        onChange={(e) => handlePlanUpdate(index, 'name', e.target.value)}
                                        className="w-full p-2 border rounded-xl text-sm font-bold text-gray-700"
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Precio (Display)</label>
                                    <input
                                        type="text"
                                        value={plan.price_display}
                                        onChange={(e) => handlePlanUpdate(index, 'price_display', e.target.value)}
                                        className="w-full p-2 border rounded-xl text-sm text-gray-700"
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Precio (Numérico)</label>
                                    <input
                                        type="number"
                                        value={plan.price}
                                        onChange={(e) => handlePlanUpdate(index, 'price', Number(e.target.value))}
                                        className="w-full p-2 border rounded-xl text-sm text-gray-700"
                                    />
                                </div>
                                <div className="w-full basis-full">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Descripción</label>
                                    <textarea
                                        value={plan.description || ''}
                                        onChange={(e) => handlePlanUpdate(index, 'description', e.target.value)}
                                        className="w-full p-2 border rounded-xl text-sm text-gray-700 resize-none bg-white"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Availability Configuration */}
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-fuchsia-100">
                    <h2 className="text-xl font-bold text-fuchsia-700 mb-4 flex items-center gap-2">
                        <Clock size={20} /> Disponibilidad Horaria Semanal
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">Ingresa las horas disponibles separadas por coma (ej: 09:00, 10:00, 15:30).</p>

                    <div className="grid md:grid-cols-2 gap-4">
                        {days.map(day => (
                            <div key={day} className="p-3 border border-gray-100 rounded-2xl">
                                <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">{dayLabels[day]}</label>
                                <input
                                    type="text"
                                    value={(availability[day] || []).join(', ')}
                                    onChange={(e) => handleAvailabilityUpdate(day, e.target.value)}
                                    placeholder="Ej: 09:00, 10:00, 11:00"
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Save Button */}
            <div className="fixed bottom-6 right-6 md:absolute md:bottom-auto md:right-0 md:top-6">
                <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-fuchsia-200 transition-all hover:scale-105 disabled:opacity-70"
                >
                    {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={20} />}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
    );
}
