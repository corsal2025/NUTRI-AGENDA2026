import { createClient } from '@/utils/supabase/client';

export interface Plan {
    id: string;
    name: string;
    price: number;
    price_display: string;
    period: string;
    features: string[];
    is_popular: boolean;
    description: string;
    active: boolean;
}

export interface AppConfig {
    bank_details: {
        bank: string;
        account: string;
        type: string;
        rut: string;
        name: string;
        email: string;
    };
    contact_info: {
        whatsapp: string;
        email: string;
    };
    availability: {
        [key: string]: string[]; // monday: ["09:00", ...]
    };
}

export const configService = {
    async getPlans(): Promise<Plan[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('active', true)
            .order('price', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async updatePlan(id: string, updates: Partial<Plan>): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('plans')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    },

    async getConfig(key: keyof AppConfig): Promise<any> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('app_config')
            .select('value')
            .eq('key', key)
            .single();

        if (error) {
            console.warn(`Error fetching config ${key}, using defaults`);
            return null;
        }
        return data?.value;
    },

    async updateConfig(key: keyof AppConfig, value: any): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('app_config')
            .upsert({ key, value })
            .select();

        if (error) throw error;
    }
};
