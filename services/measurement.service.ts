// Measurement Management Service
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Measurement, CreateMeasurementData } from '../types/measurement.types';

const MEASUREMENTS_COLLECTION = 'measurements';

/**
 * Calculate BMI
 */
const calculateBMI = (weight: number, height: number): number => {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

/**
 * Upload measurement photo
 */
const uploadPhoto = async (clientId: string, uri: string, index: number): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const filename = `measurements/${clientId}/${Date.now()}_${index}.jpg`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch (error: any) {
    throw new Error(error.message || 'Error al subir foto');
  }
};

/**
 * Create a new measurement
 */
export const createMeasurement = async (
  data: CreateMeasurementData
): Promise<Measurement> => {
  try {
    const measurementRef = doc(collection(db, MEASUREMENTS_COLLECTION));
    
    // Calculate BMI
    const bmi = calculateBMI(data.weight, data.height);
    
    // Upload photos if provided
    let photoUrls: string[] = [];
    if (data.photos && data.photos.length > 0) {
      photoUrls = await Promise.all(
        data.photos.map((uri, index) => uploadPhoto(data.clientId, uri, index))
      );
    }

    const measurementData = {
      clientId: data.clientId,
      date: Timestamp.now(),
      weight: data.weight,
      height: data.height,
      bmi,
      waist: data.waist,
      hip: data.hip,
      bodyFat: data.bodyFat || null,
      muscleMass: data.muscleMass || null,
      notes: data.notes || '',
      photos: photoUrls,
      createdAt: Timestamp.now(),
    };

    await setDoc(measurementRef, measurementData);

    return {
      id: measurementRef.id,
      clientId: data.clientId,
      date: new Date(),
      weight: data.weight,
      height: data.height,
      bmi,
      waist: data.waist,
      hip: data.hip,
      bodyFat: data.bodyFat,
      muscleMass: data.muscleMass,
      notes: data.notes || '',
      photos: photoUrls,
      createdAt: new Date(),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al crear medición');
  }
};

/**
 * Get measurements by client
 */
export const getMeasurementsByClient = async (
  clientId: string,
  limitCount?: number
): Promise<Measurement[]> => {
  try {
    let q = query(
      collection(db, MEASUREMENTS_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('date', 'desc')
    );

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        clientId: data.clientId,
        date: data.date.toDate(),
        weight: data.weight,
        height: data.height,
        bmi: data.bmi,
        waist: data.waist,
        hip: data.hip,
        bodyFat: data.bodyFat,
        muscleMass: data.muscleMass,
        notes: data.notes,
        photos: data.photos || [],
        createdAt: data.createdAt.toDate(),
      };
    });
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener mediciones');
  }
};

/**
 * Get latest measurement for a client
 */
export const getLatestMeasurement = async (clientId: string): Promise<Measurement | null> => {
  try {
    const measurements = await getMeasurementsByClient(clientId, 1);
    return measurements.length > 0 ? measurements[0] : null;
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener última medición');
  }
};

/**
 * Get measurement by ID
 */
export const getMeasurement = async (measurementId: string): Promise<Measurement | null> => {
  try {
    const measurementDoc = await getDoc(doc(db, MEASUREMENTS_COLLECTION, measurementId));
    
    if (!measurementDoc.exists()) {
      return null;
    }

    const data = measurementDoc.data();
    
    return {
      id: measurementDoc.id,
      clientId: data.clientId,
      date: data.date.toDate(),
      weight: data.weight,
      height: data.height,
      bmi: data.bmi,
      waist: data.waist,
      hip: data.hip,
      bodyFat: data.bodyFat,
      muscleMass: data.muscleMass,
      notes: data.notes,
      photos: data.photos || [],
      createdAt: data.createdAt.toDate(),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener medición');
  }
};
