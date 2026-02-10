export interface BiometricReport {
  id: string;
  patientId: string;
  date: string; // "16/01/2026 13:27:32"
  heightCm: number; // 184
  gender: 'Male' | 'Female';
  age: number;

  // Composición Corporal
  composition: {
    weight: { value: number; unit: 'kg'; range: [number, number]; assessment: 'Low' | 'Normal' | 'High' | 'Very High' };
    bodyFat: { value: number; unit: '%'; range: [number, number]; assessment: string };
    muscleMass: { value: number; unit: 'kg'; range: [number, number]; assessment: string };
    protein: { value: number; unit: '%'; range: [number, number]; assessment: string };
    water: { value: number; unit: '%'; range: [number, number]; assessment: string };
    boneMass: { value: number; unit: 'kg'; range: [number, number]; assessment: string };
    // ... others from image
  };

  // Puntuación
  score: number; // 90

  // Control de Peso
  weightControl: {
    targetWeight: number;
    weightControl: number; // -12.9
    fatControl: number;    // -12.9
    muscleControl: number; // +0.0
  };

  // Análisis de Obesidad
  obesity: {
    bmi: number;
    bodyFatPercentage: number;
  };

  // Segmental (Impedancia)
  segmental: {
    armLeft: { fat: number; lean: number };
    armRight: { fat: number; lean: number };
    legLeft: { fat: number; lean: number };
    legRight: { fat: number; lean: number };
    trunk: { fat: number; lean: number };
  };
}
