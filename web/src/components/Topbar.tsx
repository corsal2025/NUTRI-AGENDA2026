"use client";

import { Search, Plus, Menu, X, LayoutDashboard, HeartPulse, History, BarChart2, CalendarDays, CreditCard, User, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { NotificationPopover } from "./NotificationPopover";
import { useAdmin } from "@/hooks/useAdmin";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDebounce } from "use-debounce";
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
                                                    <div className="size-8 rounded-full bg-fuchsia-100 flex items-center justify-center text-fuchsia-600 font-bold text-xs shrink-0">
                                                        {patient.nombre_completo?.charAt(0) || "U"}
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
                        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-fuchsia-200 transition-all">
                                {/* Using unoptimized for external URL placeholder */}
                                <Image
                                    unoptimized
                                    src="https://ui-avatars.com/api/?name=Veronica+Amaya&background=fdf4ff&color=d946ef"
                                    alt="User"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-gray-700 group-hover:text-fuchsia-700 transition-colors">Verónica Amaya</p>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">NUTRICIONISTA ISAK 1</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
