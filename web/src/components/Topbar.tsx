"use client";

import { Search, Plus, Menu, X, LayoutDashboard, HeartPulse, History, BarChart2, CalendarDays, CreditCard, User, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { NotificationPopover } from "./NotificationPopover";
import { useAdmin } from "@/hooks/useAdmin";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { configService } from "@/services/configService";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export function Topbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { isAdmin } = useAdmin();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string>('/logo-oficial.png');

    useEffect(() => {
        async function loadLogo() {
            try {
                const url = await configService.getConfig('logo_url' as any);
                if (url) setLogoUrl(url);
            } catch (error) {
                console.error("Error loading logo in Topbar:", error);
            }
        }
        loadLogo();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    const menuItems = [
        { icon: LayoutDashboard, label: "Panel Principal", href: "/dashboard" },
        { icon: HeartPulse, label: "Evaluación", href: "/dashboard/evaluate" },
        { icon: History, label: "Historial Clínico", href: "/dashboard/history" },
        { icon: BarChart2, label: "Estadísticas", href: "/dashboard/statistics" },
        { icon: CalendarDays, label: "Agenda", href: "/dashboard/agenda" },
        { icon: CreditCard, label: "Pagos y Planes", href: "/dashboard/pagos" },
        { icon: User, label: "Perfil", href: "/dashboard/profile" },
        { icon: Settings, label: "Configuración", href: "/dashboard/settings" },
    ];

    const filteredMenuItems = menuItems.filter(item => {
        if (item.href === '/dashboard/settings') return isAdmin;
        return true;
    });

    useEffect(() => {
        const searchPatients = async () => {
            if (debouncedSearchTerm.length < 3) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            const supabase = createClient();

            // Search in 'perfiles' table
            const { data, error } = await supabase
                .from('perfiles')
                .select('id, user_id, nombre_completo, email')
                .ilike('nombre_completo', `%${debouncedSearchTerm}%`)
                .limit(5);

            if (!error && data) {
                setSearchResults(data);
            }
            setIsSearching(false);
        };

        if (isAdmin) {
            searchPatients();
        }
    }, [debouncedSearchTerm, isAdmin]);

    const handleSelectPatient = (userId: string) => {
        // Redirect to History page with selected userId
        router.push(`/dashboard/history?patientId=${userId}`);
        setShowResults(false);
        setSearchTerm("");
    };

    return (
        <>
            <header className="flex justify-between items-center mb-6 lg:mb-10">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Title - Clean & Serif */}
                    <h2 className="text-2xl lg:text-3xl font-serif text-gray-900 tracking-tight">
                        Resumen de Salud
                    </h2>
                </div>

                <div className="flex items-center gap-6">
                    {/* Search - Only for Admin */}
                    {isAdmin ? (
                        <div className="relative group z-50">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-fuchsia-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setShowResults(true)}
                                className="block w-64 pl-10 pr-3 py-2 border-b border-gray-200 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-fuchsia-500 focus:w-80 transition-all duration-300 sm:text-sm"
                            />

                            {/* Search Results Dropdown */}
                            {showResults && searchTerm.length > 2 && (
                                <div className="absolute top-full left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 mt-2 max-h-60 overflow-y-auto">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-xs text-gray-400">Buscando...</div>
                                    ) : searchResults.length > 0 ? (
                                        <ul>
                                            {searchResults.map((patient) => (
                                                <li
                                                    key={patient.id}
                                                    onClick={() => handleSelectPatient(patient.user_id)}
                                                    className="px-4 py-3 hover:bg-fuchsia-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="size-8 rounded-full overflow-hidden shadow-sm border border-white relative shrink-0">
                                                        <Image
                                                            src="/veronica.png"
                                                            alt="Verónica Amaya"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{patient.nombre_completo}</p>
                                                        <p className="text-[10px] text-gray-500 truncate">{patient.email || "Sin email"}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-xs text-gray-400">No se encontraron pacientes.</div>
                                    )}
                                </div>
                            )}

                            {/* Overlay to close results */}
                            {showResults && (
                                <div className="fixed inset-0 z-[-1]" onClick={() => setShowResults(false)}></div>
                            )}
                        </div>
                    ) : (
                        <div className="w-64"></div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
                        <NotificationPopover />

                        <button
                            onClick={() => router.push('/dashboard/evaluate')}
                            className="p-2 bg-fuchsia-600 text-white rounded-full hover:bg-fuchsia-700 transition-colors shadow-lg shadow-fuchsia-200"
                        >
                            <Plus size={20} />
                        </button>

                        {/* Profile */}
                        <div className="flex items-center gap-3 pl-2 cursor-pointer group" onClick={() => router.push('/dashboard/profile')}>
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-fuchsia-100 group-hover:border-fuchsia-300 transition-all shadow-sm">
                                <Image
                                    src="/veronica.png"
                                    alt="Verónica Amaya"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-bold text-gray-800 group-hover:text-fuchsia-700 transition-colors">Verónica Amaya</p>
                                <p className="text-[9px] font-black text-fuchsia-500 uppercase tracking-widest">NUTRICIONISTA UPLA | ISAK I</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-[1001] lg:hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="size-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white">
                                    <img
                                        src="/logo-oficial.png"
                                        alt="Logo"
                                        className="size-full object-contain p-1"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Nutri-Agenda';
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                                {filteredMenuItems.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={clsx(
                                                "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all",
                                                isActive
                                                    ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-100"
                                                    : "text-gray-500 hover:bg-slate-50 hover:text-gray-900"
                                            )}
                                        >
                                            <item.icon size={20} className={isActive ? "text-white" : "text-gray-400"} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-slate-100">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                >
                                    <LogOut size={20} />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
