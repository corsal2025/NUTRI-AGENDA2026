"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { configService } from '@/services/configService';
import { useUserRole } from '@/hooks/useUserRole';
import {
    LayoutDashboard,
    History,
    BarChart2,
    Settings,
    User,
    ShieldCheck,
    LogOut,
    CreditCard,
    ClipboardCheck,
    Instagram,
    Facebook,
    CalendarDays,
    HeartPulse,
    TrendingUp
} from "lucide-react";
import clsx from "clsx";

interface MenuItem {
    icon: React.ElementType;
    label: string;
    href: string;
    adminOnly?: boolean;
    patientOnly?: boolean;
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { role, isAdmin, isPatient, loading } = useUserRole();

    const menuItems: MenuItem[] = [
        { icon: User, label: isAdmin ? "Perfil" : "Mi Ficha Clínica", href: "/dashboard/profile" },
        {
            icon: ShieldCheck,
            label: "Planes de Atención",
            href: "/dashboard/planes",
            adminOnly: true
        },
        {
            icon: CreditCard,
            label: "Pagos y Finanzas",
            href: "/dashboard/pagos",
            adminOnly: true
        },
        {
            icon: TrendingUp,
            label: "Mi Evolución",
            href: "/dashboard",
            patientOnly: true
        },
        { icon: CalendarDays, label: "Agenda", href: "/dashboard/agenda" },
        {
            icon: HeartPulse,
            label: "Evaluación",
            href: "/dashboard/evaluate",
            adminOnly: true
        },
        {
            icon: History,
            label: "Historial Clínico",
            href: "/dashboard/history",
            adminOnly: true
        },
        {
            icon: BarChart2,
            label: "Estadísticas",
            href: "/dashboard/statistics",
            adminOnly: true
        }
    ];

    // Filtrar items según rol
    const filteredItems = menuItems.filter(item => {
        if (item.adminOnly && !isAdmin) return false;
        if (item.patientOnly && !isPatient) return false;
        return true;
    });

    const [logoUrl, setLogoUrl] = useState<string>('/logo-oficial.png');

    useEffect(() => {
        async function loadLogo() {
            try {
                const url = await configService.getConfig('logo_url' as any);
                if (url) setLogoUrl(url);
            } catch (error) {
                console.error("Error loading logo from database:", error);
            }
        }
        loadLogo();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    // El filtrado ya se hizo arriba con filteredItems

    return (
        <aside className="w-64 bg-white h-[calc(100vh-2rem)] flex flex-col fixed left-4 top-4 bottom-4 rounded-[3rem] z-[100] text-gray-900 shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
            {/* Logo & Profile Section */}
            <div className="pt-6 px-6 mb-2">
                <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="size-36 flex items-center justify-center">
                        <img
                            src="/logo-oficial.png"
                            alt="Verónica Amaya - Nutrición y Deporte"
                            className="size-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Nutri-Agenda';
                            }}
                        />
                    </div>
                </div>

            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto no-scrollbar">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-2.5 transition-all duration-300 group rounded-xl text-[13px] font-bold",
                                isActive
                                    ? "text-white bg-fuchsia-600 shadow-lg shadow-fuchsia-100"
                                    : "text-gray-400 hover:text-gray-900 hover:bg-slate-50"
                            )}
                        >
                            <item.icon
                                size={16}
                                className={clsx(
                                    isActive ? "text-white" : "text-gray-300 group-hover:text-fuchsia-500"
                                )}
                            />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Social */}
            <div className="p-3 mt-auto">
                <div className="bg-slate-50 rounded-[2rem] p-3 border border-slate-100">
                    <div className="flex justify-center gap-3 mb-2">
                        <a href="https://www.instagram.com/nutricionista_veronicamaya?igsh=c2l3ZzE5cndxbHFi" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white rounded-full shadow-sm text-gray-400 hover:text-fuchsia-600 transition-colors">
                            <Instagram size={14} />
                        </a>
                        <a href="https://www.facebook.com/share/18EU8Vfe67/" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white rounded-full shadow-sm text-gray-400 hover:text-fuchsia-600 transition-colors">
                            <Facebook size={14} />
                        </a>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-white transition-all text-[10px] font-black uppercase tracking-widest group"
                    >
                        <LogOut size={14} className="group-hover:scale-110 transition-transform" />
                        <span>Salir</span>
                    </button>
                </div>
            </div>
        </aside >
    );
}
