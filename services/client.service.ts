// Client Management Service
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
import { Client, CreateClientData } from '../types/client.types';

const CLIENTS_COLLECTION = 'clients';

/**
 * Create a new client
 */
export const createClient = async (
  nutritionistId: string,
  userId: string,
  data: CreateClientData
): Promise<Client> => {
  try {
    const clientRef = doc(collection(db, CLIENTS_COLLECTION));
    
    const clientData = {
      userId,
      nutritionistId,
      personalInfo: {
        ...data.personalInfo,
        birthDate: Timestamp.fromDate(data.personalInfo.birthDate),
      },
      medicalHistory: data.medicalHistory,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(clientRef, clientData);

    return {
      id: clientRef.id,
      userId,
      nutritionistId,
      personalInfo: {
        ...data.personalInfo,
        birthDate: data.personalInfo.birthDate,
      },
      medicalHistory: data.medicalHistory,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al crear cliente');
  }
};

/**
 * Get client by ID
 */
export const getClient = async (clientId: string): Promise<Client | null> => {
  try {
    const clientDoc = await getDoc(doc(db, CLIENTS_COLLECTION, clientId));
    
    if (!clientDoc.exists()) {
      return null;
    }

    const data = clientDoc.data();
    
    return {
      id: clientDoc.id,
      userId: data.userId,
      nutritionistId: data.nutritionistId,
      personalInfo: {
        ...data.personalInfo,
        birthDate: data.personalInfo.birthDate.toDate(),
      },
      medicalHistory: data.medicalHistory,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener cliente');
  }
};

/**
 * Get all clients for a nutritionist
 */
export const getClientsByNutritionist = async (nutritionistId: string): Promise<Client[]> => {
  try {
    const q = query(
      collection(db, CLIENTS_COLLECTION),
      where('nutritionistId', '==', nutritionistId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        nutritionistId: data.nutritionistId,
        personalInfo: {
          ...data.personalInfo,
          birthDate: data.personalInfo.birthDate.toDate(),
        },
        medicalHistory: data.medicalHistory,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener clientes');
  }
};

/**
 * Update client
 */
export const updateClient = async (
  clientId: string,
  data: Partial<CreateClientData>
): Promise<void> => {
  try {
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (data.personalInfo) {
      updateData.personalInfo = {
        ...data.personalInfo,
        birthDate: data.personalInfo.birthDate 
          ? Timestamp.fromDate(data.personalInfo.birthDate)
          : undefined,
      };
    }

    if (data.medicalHistory) {
      updateData.medicalHistory = data.medicalHistory;
    }

    await updateDoc(doc(db, CLIENTS_COLLECTION, clientId), updateData);
  } catch (error: any) {
    throw new Error(error.message || 'Error al actualizar cliente');
  }
};

/**
 * Delete client
 */
export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId));
  } catch (error: any) {
    throw new Error(error.message || 'Error al eliminar cliente');
  }
};
