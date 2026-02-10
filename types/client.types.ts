// TypeScript types for Client data

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  address?: string;
}

export interface MedicalHistory {
  allergies: string[];
  medications: string[];
  conditions: string[];
  notes: string;
}

export interface Client {
  id: string;
  userId: string; // Reference to User
  nutritionistId: string;
  personalInfo: PersonalInfo;
  medicalHistory: MedicalHistory;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientData {
  personalInfo: PersonalInfo;
  medicalHistory: MedicalHistory;
}
