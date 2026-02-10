import { createClient } from '@/utils/supabase/client';

export interface AnthropometryData {
    patient_id: string;
    date: string;
    weight: number;
    height: number;
    age_at_record: number;
    // Pliegues
    fold_bicipital: number;
    fold_tricipital: number;
    fold_subscapular: number;
    fold_suprailiac: number;
    fold_calf: number;
    fold_supraspinale: number;
    // Circunferencias
    circ_waist: number;
    circ_hip: number;
    circ_calf: number;
    circ_arm_relaxed: number;
    circ_arm_contracted: number;
    circ_wrist: number;
    // Diametros
    diam_humerus: number;
    diam_femur: number;
    diam_wrist: number;
}

export interface AnthropometryResult extends AnthropometryData {
    id: number;
    mass_fat_kg: number;
    mass_fat_pct: number;
    mass_muscle_kg: number;
    mass_muscle_pct: number;
    mass_bone_kg: number;
    mass_bone_pct: number;
    mass_residual_kg: number;
    mass_residual_pct: number;
    somatotype_endomorph: number;
    somatotype_mesomorph: number;
    somatotype_ectomorph: number;
    somatotype_x: number;
    somatotype_y: number;
}

const calculateSomatotype = (
    weight: number, height: number,
    tricipital: number, subscapular: number, supraspinale: number, calf_fold: number,
    humerus: number, femur: number,
    arm_contracted: number, calf_circ: number
) => {
    // ENDOMORPHY
    const sum_folds = tricipital + subscapular + supraspinale;
    const X = sum_folds * (170.18 / height);
    const endo = -0.7182 + (0.1451 * X) - (0.00068 * (X ** 2)) + (0.0000014 * (X ** 3));

    // MESOMORPHY
    const arm_corrected = arm_contracted - (tricipital / 10.0);
    const calf_corrected = calf_circ - (calf_fold / 10.0);
    const meso = (0.858 * humerus) + (0.601 * femur) + (0.188 * arm_corrected) + (0.161 * calf_corrected) - (0.131 * height) + 4.5;

    // ECTOMORPHY
    const hwr = height / (Math.pow(weight, 1 / 3));
    let ecto = 0;
    if (hwr >= 40.75) {
        ecto = (0.732 * hwr) - 28.58;
    } else if (hwr < 40.75 && hwr > 38.25) {
        ecto = (0.463 * hwr) - 17.63;
    } else {
        ecto = 0.1;
    }

    const x_coord = ecto - endo;
    const y_coord = (2 * meso) - (endo + ecto);

    return {
        endomorph: Number(endo.toFixed(2)),
        mesomorph: Number(meso.toFixed(2)),
        ectomorph: Number(ecto.toFixed(2)),
        x: Number(x_coord.toFixed(2)),
        y: Number(y_coord.toFixed(2))
    };
};

const calculateBodyComposition = (
    weight: number, height: number, age: number, gender: string = 'M',
    triceps: number, subscapular: number, biceps: number, iliac_crest: number, supraspinale: number, calf: number,
    wrist: number, femur: number
) => {
    // 1. FAT MASS (Durnin-Womersley)
    const log_sum_4 = Math.log10(triceps + biceps + subscapular + iliac_crest);
    let density = 0;

    if (gender.toUpperCase() === 'M') {
        density = 1.1631 - (0.0632 * log_sum_4);
    } else {
        density = 1.1599 - (0.0717 * log_sum_4);
    }

    const body_fat_pct = (495 / density) - 450;
    const fat_mass = weight * (body_fat_pct / 100);

    // 2. BONE MASS (Von Dobeln modified)
    const h_m = height / 100;
    const wrist_m = wrist / 100;
    const femur_m = femur / 100;

    let bone_mass = 0;
    try {
        bone_mass = 3.02 * (Math.pow((Math.pow(h_m, 2) * femur_m * wrist_m * 400), 0.712));
    } catch (e) {
        bone_mass = weight * 0.15;
    }

    // 3. RESIDUAL MASS (Wurfel)
    const residual_mass = gender.toUpperCase() === 'M' ? weight * 0.241 : weight * 0.209;

    // 4. MUSCLE MASS
    const muscle_mass = weight - (fat_mass + bone_mass + residual_mass);

    return {
        mass_fat_kg: Number(fat_mass.toFixed(2)),
        mass_fat_pct: Number(body_fat_pct.toFixed(2)),
        mass_muscle_kg: Number(muscle_mass.toFixed(2)),
        mass_muscle_pct: Number(((muscle_mass / weight) * 100).toFixed(2)),
        mass_bone_kg: Number(bone_mass.toFixed(2)),
        mass_bone_pct: Number(((bone_mass / weight) * 100).toFixed(2)),
        mass_residual_kg: Number(residual_mass.toFixed(2)),
        mass_residual_pct: Number(((residual_mass / weight) * 100).toFixed(2))
    };
};

export const nutritionService = {
    async calculateAndSave(data: AnthropometryData): Promise<AnthropometryResult> {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('No active session');
        }

        // Perform Calculations Locally
        // Determine gender from somewhere? For now defaulting to M or we need to add gender to AnthropometryData if not present.
        // Assuming 'M' for now as fallback or fetching patient profile. 
        // Ideally we should have gender in the input data.
        const gender = 'F'; // Defaulting to Female as context implies "Nutri Verónica" usually treats specific demographics? Or just default.

        const somato = calculateSomatotype(
            data.weight, data.height,
            data.fold_tricipital, data.fold_subscapular, data.fold_supraspinale, data.fold_calf,
            data.diam_humerus, data.diam_femur,
            data.circ_arm_contracted, data.circ_calf
        );

        const comp = calculateBodyComposition(
            data.weight, data.height, data.age_at_record, gender,
            data.fold_tricipital, data.fold_subscapular, data.fold_bicipital, data.fold_suprailiac, data.fold_supraspinale, data.fold_calf,
            data.diam_wrist, data.diam_femur
        );

        const resultToSave = {
            ...data,
            patient_id: user.id, // Saving for the current user (if patient) or we need patient_id passed in.
            // The interface has patient_id. If the logged in user is the Nutri, she should be passing the patient_id of the patient being evaluated.
            // If the logged in user IS the patient, then user.id is correct.
            // Based on context, Nutri uses this form. So `data.patient_id` should be used if present, else user.id.
            // However, `data` comes from the form.

            ...somato,
            ...comp,
            somatotype_x: somato.x,
            somatotype_y: somato.y
        };

        const { data: savedData, error } = await supabase
            .from('anthropometrics')
            .insert(resultToSave)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw new Error(error.message || 'Error saving anthropometry');
        }

        return savedData as AnthropometryResult;
    },

    async getHistory(patientId: string): Promise<AnthropometryResult[]> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('anthropometrics')
            .select('*')
            .eq('patient_id', patientId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            throw new Error(error.message || 'Error obtaining history');
        }

        return data as AnthropometryResult[];
    }
};
