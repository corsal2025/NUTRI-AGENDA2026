"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
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
    HeartPulse
} from "lucide-react";
import clsx from "clsx";

interface MenuItem {
    icon: React.ElementType;
    label: string;
    href: string;
}

const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Panel Principal", href: "/dashboard" },
    { icon: HeartPulse, label: "Evaluación", href: "/dashboard/evaluate" },
    { icon: History, label: "Historial Clínico", href: "/dashboard/history" },
    { icon: BarChart2, label: "Estadísticas", href: "/dashboard/statistics" },
    { icon: CalendarDays, label: "Agenda", href: "/dashboard/agenda" },
    { icon: CreditCard, label: "Pagos y Planes", href: "/dashboard/pagos" },
    { icon: User, label: "Perfil", href: "/dashboard/profile" },
    { icon: Settings, label: "Configuración", href: "/dashboard/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: config } = await supabase
                .from('app_config')
                .select('value')
                .eq('key', 'contact_info')
                .single();

            const configValue = config?.value as { email?: string } | null;
            const adminEmail = configValue?.email;

            if (adminEmail && user.email === adminEmail) {
                setIsAdmin(true);
            }
        }
    };

    const filteredMenuItems = menuItems.filter(item => {
        if (item.href === '/dashboard/settings') return isAdmin;
        return true;
    });

    return (
        <aside className="w-64 bg-white h-[calc(100vh-2rem)] flex flex-col fixed left-4 top-4 bottom-4 rounded-[3rem] z-50 text-gray-900 shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
            {/* Logo & Profile Section */}
            <div className="pt-8 px-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="size-12 rounded-2xl bg-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-200">
                        <HeartPulse size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight leading-none text-gray-900">NUTRI</h1>
                        <p className="text-[11px] font-black text-fuchsia-600 tracking-[0.25em]">AGENDA</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="relative size-12 rounded-xl overflow-hidden shadow-sm border border-white shrink-0">
                        <Image
                            src="/1.jpeg"
                            alt="Verónica Amaya"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black text-fuchsia-600 uppercase tracking-widest leading-none mb-1">Nutricionista</p>
                        <p className="text-xs font-bold text-gray-900 truncate">Verónica Amaya</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto no-scrollbar">
                {filteredMenuItems.map((item) => {
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
                        <a href="https://instagram.com/nutri.veronica" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white rounded-full shadow-sm text-gray-400 hover:text-fuchsia-600 transition-colors">
                            <Instagram size={14} />
                        </a>
                        <a href="https://facebook.com/nutri.veronica" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white rounded-full shadow-sm text-gray-400 hover:text-fuchsia-600 transition-colors">
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
        </aside>
    );
}
