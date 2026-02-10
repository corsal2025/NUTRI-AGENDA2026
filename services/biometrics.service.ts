import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { BiometricReport } from '../types/biometrics';

const COLLECTION_NAME = 'biometrics';

export const saveBiometricReport = async (report: Omit<BiometricReport, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...report,
            createdAt: Timestamp.now()
        });
        console.log("Report saved with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const getReportsByPatient = async (patientId: string) => {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("patientId", "==", patientId),
        orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BiometricReport));
};
