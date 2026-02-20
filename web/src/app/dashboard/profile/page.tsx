export const dynamic = 'force-dynamic'

"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Camera, Save, MapPin, Briefcase, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>({
        nombre_completo: "",
        email: "",
        telefono: "",
        especialidad: "",
        ubicacion: "",
        fecha_nacimiento: "",
        rol: ""
    });

    useEffect(() => {
        async function getProfile() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from("perfiles")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                if (data) {
                    setProfile({
                        ...data,
                        email: user.email // Email typically comes from auth
                    });
                }
            }
            setLoading(false);
        }
        getProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("No user found");

            const { error } = await supabase
                .from("perfiles")
                .update({
                    nombre_completo: profile.nombre_completo,
                    telefono: profile.telefono,
                    especialidad: profile.especialidad,
                    ubicacion: profile.ubicacion,
                })
                .eq("user_id", user.id);

            if (error) throw error;
            alert("Perfil actualizado correctamente");
        } catch (error: any) {
            console.error(error);
            alert("Error al actualizar: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="space-y-1">
                <h1 className="text-4xl font-bold text-gray-900 font-serif">Perfil Profesional</h1>
                <p className="text-gray-500 font-medium">Gestiona tu identidad digital y credenciales médicas.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Avatar Section */}
                <div className="md:col-span-4 flex flex-col items-center">
                    <div className="relative group">
                        <div className="size-56 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl bg-slate-50 flex items-center justify-center">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="size-24 text-slate-200" />
                            )}
                        </div>
                        <button className="absolute bottom-4 right-4 p-4 bg-fuchsia-600 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                            <Camera className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="mt-8 text-center space-y-1">
                        <h3 className="text-2xl font-bold text-gray-900 font-serif">{profile.nombre_completo || "Nutricionista"}</h3>
                        <p className="text-fuchsia-600 font-black text-[10px] uppercase tracking-[0.2em]">{profile.especialidad || "Especialidad no definida"}</p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="md:col-span-8 space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ProfileInput
                                label="Nombre Completo"
                                value={profile.nombre_completo}
                                onChange={(v: any) => setProfile({ ...profile, nombre_completo: v })}
                                icon={<User className="w-4 h-4" />}
                            />
                            <ProfileInput
                                label="Correo Electrónico"
                                value={profile.email}
                                disabled
                                icon={<Mail className="w-4 h-4" />}
                            />
                            <ProfileInput
                                label="Teléfono"
                                value={profile.telefono}
                                onChange={(v: any) => setProfile({ ...profile, telefono: v })}
                                icon={<Phone className="w-4 h-4" />}
                            />
                            <ProfileInput
                                label="Especialidad / Ocupación"
                                value={profile.especialidad}
                                onChange={(v: any) => setProfile({ ...profile, especialidad: v })}
                                icon={<Briefcase className="w-4 h-4" />}
                            />
                            <ProfileInput
                                label="Ubicación de Consulta"
                                value={profile.ubicacion}
                                onChange={(v: any) => setProfile({ ...profile, ubicacion: v })}
                                icon={<MapPin className="w-4 h-4" />}
                            />
                            <ProfileInput
                                label="Fecha de Registro"
                                value={profile.created_at ? format(new Date(profile.created_at), "PPP", { locale: es }) : "Cargando..."}
                                disabled
                                icon={<Calendar className="w-4 h-4" />}
                            />
                        </div>

                        <div className="pt-10 border-t border-gray-50 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-3 px-10 py-4 bg-fuchsia-600 text-white font-black text-sm rounded-3xl shadow-lg shadow-fuchsia-100 hover:bg-fuchsia-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {saving ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div> : <Save className="w-5 h-5" />}
                                GUARDAR CAMBIOS
                            </button>
                        </div>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-start gap-4">
                        <div className="size-10 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <p className="text-emerald-800 font-bold text-sm">Información Profesional</p>
                            <p className="text-emerald-700/70 text-xs mt-0.5 leading-relaxed">
                                Esta información será visible en tus reportes generados y en la cabecera de tus planes de alimentación.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileInput({ label, value, onChange, disabled, icon }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${disabled ? 'bg-slate-50 border-gray-100 opacity-60' : 'bg-white border-gray-200 focus-within:border-fuchsia-500 focus-within:ring-4 focus-within:ring-fuchsia-500/5'}`}>
                <div className="text-gray-400 shrink-0">
                    {icon}
                </div>
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={disabled}
                    className="flex-grow bg-transparent outline-none text-gray-900 text-sm font-bold placeholder:text-gray-300"
                />
            </div>
        </div>
    );
}
