// TypeScript types for Appointments

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  nutritionistId: string;
  date: Date;
  duration: number; // in minutes
  status: AppointmentStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentData {
  clientId: string;
  date: Date;
  duration: number;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
