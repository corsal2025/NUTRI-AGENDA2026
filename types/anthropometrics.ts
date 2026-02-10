// Anthropometric measurement types and calculations for nutritionists

export interface AnthropometricMeasurement {
    id: string;
    clientId: string;
    date: Date;

    // Basic measurements
    weight: number;           // kg
    height: number;           // cm

    // Body circumferences (cm)
    chest?: number;
    waist?: number;
    hip?: number;
    arm?: number;              // Brazo relajado
    armFlexed?: number;        // Brazo contraído
    forearm?: number;
    thigh?: number;
    calf?: number;
    neck?: number;

    // Skinfolds (mm) - Pliegues cutáneos
    triceps?: number;
    subscapular?: number;      // Subescapular
    suprailiac?: number;       // Suprailiaco
    abdominal?: number;
    thighFold?: number;        // Muslo
    calfFold?: number;         // Pantorrilla

    // Calculated values
    bmi?: number;              // IMC
    bodyFat?: number;          // % Grasa corporal
    fatMass?: number;          // Masa grasa (kg)
    leanMass?: number;         // Masa magra (kg)
    basalMetabolism?: number;  // Metabolismo basal (kcal)
    waistHipRatio?: number;    // Índice cintura-cadera

    notes?: string;
}

// Calculate BMI (IMC)
export const calculateBMI = (weight: number, heightCm: number): number => {
    const heightM = heightCm / 100;
    return weight / (heightM * heightM);
};

// BMI Classification
export const getBMIClassification = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return { category: 'Bajo peso', color: '#3B82F6' };
    if (bmi < 25) return { category: 'Normal', color: '#10B981' };
    if (bmi < 30) return { category: 'Sobrepeso', color: '#F59E0B' };
    if (bmi < 35) return { category: 'Obesidad I', color: '#EF4444' };
    if (bmi < 40) return { category: 'Obesidad II', color: '#DC2626' };
    return { category: 'Obesidad III', color: '#991B1B' };
};

// Calculate body fat percentage using Jackson-Pollock 3-fold formula
export const calculateBodyFatJP3 = (
    gender: 'male' | 'female',
    age: number,
    triceps: number,
    suprailiac: number,
    thighFold: number
): number => {
    const sumFolds = triceps + suprailiac + thighFold;

    let bodyDensity: number;
    if (gender === 'male') {
        bodyDensity = 1.10938 - (0.0008267 * sumFolds) + (0.0000016 * sumFolds * sumFolds) - (0.0002574 * age);
    } else {
        bodyDensity = 1.0994921 - (0.0009929 * sumFolds) + (0.0000023 * sumFolds * sumFolds) - (0.0001392 * age);
    }

    // Siri equation
    return (495 / bodyDensity) - 450;
};

// Calculate body fat using Deurenberg formula (from BMI)
export const calculateBodyFatFromBMI = (
    bmi: number,
    age: number,
    gender: 'male' | 'female'
): number => {
    const genderFactor = gender === 'male' ? 1 : 0;
    return (1.20 * bmi) + (0.23 * age) - (10.8 * genderFactor) - 5.4;
};

// Calculate Basal Metabolic Rate (Harris-Benedict revised)
export const calculateBMR = (
    weight: number,
    heightCm: number,
    age: number,
    gender: 'male' | 'female'
): number => {
    if (gender === 'male') {
        return 88.362 + (13.397 * weight) + (4.799 * heightCm) - (5.677 * age);
    }
    return 447.593 + (9.247 * weight) + (3.098 * heightCm) - (4.330 * age);
};

// Calculate Waist-Hip Ratio
export const calculateWHR = (waist: number, hip: number): number => {
    return waist / hip;
};

// WHR Risk classification
export const getWHRRisk = (whr: number, gender: 'male' | 'female'): { risk: string; color: string } => {
    if (gender === 'male') {
        if (whr < 0.90) return { risk: 'Bajo', color: '#10B981' };
        if (whr < 1.00) return { risk: 'Moderado', color: '#F59E0B' };
        return { risk: 'Alto', color: '#EF4444' };
    } else {
        if (whr < 0.80) return { risk: 'Bajo', color: '#10B981' };
        if (whr < 0.85) return { risk: 'Moderado', color: '#F59E0B' };
        return { risk: 'Alto', color: '#EF4444' };
    }
};

// Calculate ideal weight (Lorentz formula)
export const calculateIdealWeight = (heightCm: number, gender: 'male' | 'female'): number => {
    if (gender === 'male') {
        return heightCm - 100 - ((heightCm - 150) / 4);
    }
    return heightCm - 100 - ((heightCm - 150) / 2.5);
};

// Calculate fat mass and lean mass
export const calculateBodyComposition = (
    weight: number,
    bodyFatPercentage: number
): { fatMass: number; leanMass: number } => {
    const fatMass = weight * (bodyFatPercentage / 100);
    const leanMass = weight - fatMass;
    return { fatMass, leanMass };
};

// Calculate Daily Caloric Needs
export const calculateTDEE = (
    bmr: number,
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number => {
    const multipliers = {
        sedentary: 1.2,      // Little or no exercise
        light: 1.375,        // Light exercise 1-3 days/week
        moderate: 1.55,      // Moderate exercise 3-5 days/week
        active: 1.725,       // Hard exercise 6-7 days/week
        very_active: 1.9,    // Very hard exercise, physical job
    };
    return bmr * multipliers[activityLevel];
};
