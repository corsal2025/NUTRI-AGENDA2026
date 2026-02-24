"use client";

export const dynamic = 'force-dynamic'

import { motion } from "framer-motion";
import {
    Activity, Heart, Wind, Utensils, Target,
    TrendingUp, Calendar, ChevronRight, Search,
    Bell, Plus, User, BarChart2, Save, LogOut
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useUserRole } from "@/hooks/useUserRole";
import { ProfessionalDashboard } from "@/components/ProfessionalDashboard";
import { PatientDashboard } from "@/components/PatientDashboard";

export default function DashboardPage() {
    const { role, isAdmin, isPatient, loading } = useUserRole();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Perfil
                const { data: p } = await supabase
                    .from('perfiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();
                setProfile(p);

                // Estadísticas (última evaluación del paciente logueado)
                const { data: evals } = await supabase
                    .from('antropometria')
                    .select('*')
                    .eq('patient_id', user.id)
                    .order('date', { ascending: false })
                    .limit(1);

                if (evals && evals.length > 0) {
                    setStats(evals[0]);
                }
            }
            setDataLoading(false);
        }
        loadData();
    }, []);

    useEffect(() => {
        if (!loading && !dataLoading && role === 'admin') {
            router.replace('/dashboard/agenda');
        }
    }, [role, loading, dataLoading, router]);

    if (loading || dataLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-400 animate-pulse">
                    Cargando tu {role === 'admin' ? 'panel profesional' : 'evolución'}...
                </p>
            </div>
        </div>
    );

    if (role === 'admin') {
        return <div className="p-8 text-center text-gray-500">Redirigiendo a la agenda...</div>;
    }

    return <PatientDashboard profile={profile} stats={stats} />;
}
