import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export type UserRole = 'admin' | 'paciente' | null;

export function useUserRole() {
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data: profile, error } = await supabase
                        .from('perfiles')
                        .select('rol')
                        .eq('id', user.id)
                        .single();

                    if (profile && profile.rol) {
                        setRole(profile.rol as UserRole);
                    } else {
                        // Fallback: Si no tiene rol, asumimos admin por facilidad temporal
                        setRole('admin');
                    }
                } else {
                    // Si no hay usuario, forzamos admin para acceso sin clave
                    setRole('admin');
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
                setRole('admin'); // Fallback en caso de error
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, []);

    return {
        role,
        isAdmin: role === 'admin',
        isPatient: role === 'paciente',
        loading
    };
}
