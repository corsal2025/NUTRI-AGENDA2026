// Appointment Management Service
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Appointment, CreateAppointmentData, AppointmentStatus } from '../types/appointment.types';

const APPOINTMENTS_COLLECTION = 'appointments';

/**
 * Create a new appointment
 */
export const createAppointment = async (
  nutritionistId: string,
  data: CreateAppointmentData
): Promise<Appointment> => {
  try {
    const appointmentRef = doc(collection(db, APPOINTMENTS_COLLECTION));
    
    const appointmentData = {
      clientId: data.clientId,
      nutritionistId,
      date: Timestamp.fromDate(data.date),
      duration: data.duration,
      status: 'scheduled' as AppointmentStatus,
      notes: data.notes || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(appointmentRef, appointmentData);

    // Get client name
    const clientDoc = await getDoc(doc(db, 'clients', data.clientId));
    const clientName = clientDoc.exists() 
      ? clientDoc.data().personalInfo.name 
      : 'Cliente';

    return {
      id: appointmentRef.id,
      clientId: data.clientId,
      clientName,
      nutritionistId,
      date: data.date,
      duration: data.duration,
      status: 'scheduled',
      notes: data.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al crear cita');
  }
};

/**
 * Get appointment by ID
 */
export const getAppointment = async (appointmentId: string): Promise<Appointment | null> => {
  try {
    const appointmentDoc = await getDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId));
    
    if (!appointmentDoc.exists()) {
      return null;
    }

    const data = appointmentDoc.data();
    
    // Get client name
    const clientDoc = await getDoc(doc(db, 'clients', data.clientId));
    const clientName = clientDoc.exists() 
      ? clientDoc.data().personalInfo.name 
      : 'Cliente';

    return {
      id: appointmentDoc.id,
      clientId: data.clientId,
      clientName,
      nutritionistId: data.nutritionistId,
      date: data.date.toDate(),
      duration: data.duration,
      status: data.status,
      notes: data.notes,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener cita');
  }
};

/**
 * Get appointments by nutritionist
 */
export const getAppointmentsByNutritionist = async (
  nutritionistId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Appointment[]> => {
  try {
    let q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('nutritionistId', '==', nutritionistId),
      orderBy('date', 'asc')
    );

    if (startDate) {
      q = query(q, where('date', '>=', Timestamp.fromDate(startDate)));
    }

    if (endDate) {
      q = query(q, where('date', '<=', Timestamp.fromDate(endDate)));
    }

    const querySnapshot = await getDocs(q);
    
    const appointments = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        
        // Get client name
        const clientDoc = await getDoc(doc(db, 'clients', data.clientId));
        const clientName = clientDoc.exists() 
          ? clientDoc.data().personalInfo.name 
          : 'Cliente';

        return {
          id: docSnapshot.id,
          clientId: data.clientId,
          clientName,
          nutritionistId: data.nutritionistId,
          date: data.date.toDate(),
          duration: data.duration,
          status: data.status,
          notes: data.notes,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
      })
    );

    return appointments;
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener citas');
  }
};

/**
 * Get appointments by client
 */
export const getAppointmentsByClient = async (clientId: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    const appointments = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        
        // Get client name
        const clientDoc = await getDoc(doc(db, 'clients', data.clientId));
        const clientName = clientDoc.exists() 
          ? clientDoc.data().personalInfo.name 
          : 'Cliente';

        return {
          id: docSnapshot.id,
          clientId: data.clientId,
          clientName,
          nutritionistId: data.nutritionistId,
          date: data.date.toDate(),
          duration: data.duration,
          status: data.status,
          notes: data.notes,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
      })
    );

    return appointments;
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener citas');
  }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> => {
  try {
    await updateDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Error al actualizar estado de cita');
  }
};

/**
 * Update appointment
 */
export const updateAppointment = async (
  appointmentId: string,
  data: Partial<CreateAppointmentData>
): Promise<void> => {
  try {
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date);
    }

    if (data.duration) {
      updateData.duration = data.duration;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    await updateDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId), updateData);
  } catch (error: any) {
    throw new Error(error.message || 'Error al actualizar cita');
  }
};

/**
 * Delete appointment
 */
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId));
  } catch (error: any) {
    throw new Error(error.message || 'Error al eliminar cita');
  }
};
