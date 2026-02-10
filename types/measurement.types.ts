// TypeScript types for Measurements

export interface Measurement {
  id: string;
  clientId: string;
  date: Date;
  weight: number; // kg
  height: number; // cm
  bmi: number; // calculated
  waist: number; // cm
  hip: number; // cm
  bodyFat?: number; // percentage
  muscleMass?: number; // kg
  notes: string;
  photos: string[]; // Firebase Storage URLs
  createdAt: Date;
}

export interface CreateMeasurementData {
  clientId: string;
  weight: number;
  height: number;
  waist: number;
  hip: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  photos?: string[];
}

export interface MeasurementStats {
  weightChange: number;
  bmiChange: number;
  bodyFatChange?: number;
  period: 'week' | 'month' | 'all';
}
