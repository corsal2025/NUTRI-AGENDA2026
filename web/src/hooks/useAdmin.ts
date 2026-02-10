import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
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
        } catch (error) {
            console.error("Error checking admin status:", error);
        } finally {
            setLoading(false);
        }
    };

    return { isAdmin, loading };
}
