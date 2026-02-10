// Medication/supplement reminder service
import * as Notifications from 'expo-notifications';
import { addDoc, collection, query, where, getDocs, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Alert } from 'react-native';

export interface MedicationReminder {
    id: string;
    userId: string;
    name: string;
    dosage: string;
    frequency: 'daily' | 'twice_daily' | 'three_times' | 'weekly';
    times: string[]; // ['08:00', '14:00', '20:00']
    startDate: Date;
    endDate?: Date;
    notes?: string;
    isActive: boolean;
    notificationIds: string[];
}

// Create medication reminder
export const createMedicationReminder = async (
    userId: string,
    name: string,
    dosage: string,
    frequency: MedicationReminder['frequency'],
    times: string[],
    startDate: Date,
    endDate?: Date,
    notes?: string
): Promise<string | null> => {
    try {
        // Create in Firestore
        const docRef = await addDoc(collection(db, 'medicationReminders'), {
            userId,
            name,
            dosage,
            frequency,
            times,
            startDate: Timestamp.fromDate(startDate),
            endDate: endDate ? Timestamp.fromDate(endDate) : null,
            notes,
            isActive: true,
            notificationIds: [],
            createdAt: Timestamp.now(),
        });

        // Schedule notifications
        const notificationIds = await scheduleReminderNotifications(
            docRef.id,
            name,
            dosage,
            times,
            startDate,
            endDate
        );

        // Update with notification IDs
        await updateDoc(doc(db, 'medicationReminders', docRef.id), {
            notificationIds,
        });

        return docRef.id;
    } catch (error) {
        console.error('Error creating reminder:', error);
        Alert.alert('Error', 'No se pudo crear el recordatorio');
        return null;
    }
};

// Schedule notifications for a reminder
const scheduleReminderNotifications = async (
    reminderId: string,
    name: string,
    dosage: string,
    times: string[],
    startDate: Date,
    endDate?: Date
): Promise<string[]> => {
    const notificationIds: string[] = [];

    for (const time of times) {
        const [hours, minutes] = time.split(':').map(Number);

        // Schedule daily notification
        const trigger = {
            hour: hours,
            minute: minutes,
            repeats: true,
        };

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '💊 Recordatorio de medicamento',
                    body: `Es hora de tomar ${name} (${dosage})`,
                    data: { type: 'medication_reminder', reminderId },
                    sound: true,
                },
                trigger,
            });
            notificationIds.push(id);
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    }

    return notificationIds;
};

// Get user's medication reminders
export const getMedicationReminders = async (userId: string): Promise<MedicationReminder[]> => {
    try {
        const q = query(
            collection(db, 'medicationReminders'),
            where('userId', '==', userId),
            where('isActive', '==', true)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startDate: doc.data().startDate?.toDate() || new Date(),
            endDate: doc.data().endDate?.toDate(),
        })) as MedicationReminder[];
    } catch (error) {
        console.error('Error getting reminders:', error);
        return [];
    }
};

// Delete medication reminder
export const deleteMedicationReminder = async (reminderId: string): Promise<boolean> => {
    try {
        const docRef = doc(db, 'medicationReminders', reminderId);
        const docSnap = await getDocs(query(collection(db, 'medicationReminders'), where('__name__', '==', reminderId)));

        if (!docSnap.empty) {
            const data = docSnap.docs[0].data();
            // Cancel all notifications
            for (const notifId of data.notificationIds || []) {
                await Notifications.cancelScheduledNotificationAsync(notifId);
            }
        }

        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error('Error deleting reminder:', error);
        return false;
    }
};

// Toggle reminder active state
export const toggleReminder = async (reminderId: string, isActive: boolean): Promise<boolean> => {
    try {
        await updateDoc(doc(db, 'medicationReminders', reminderId), {
            isActive,
        });
        return true;
    } catch (error) {
        console.error('Error toggling reminder:', error);
        return false;
    }
};

// Get frequency label
export const getFrequencyLabel = (frequency: MedicationReminder['frequency']): string => {
    switch (frequency) {
        case 'daily': return '1 vez al día';
        case 'twice_daily': return '2 veces al día';
        case 'three_times': return '3 veces al día';
        case 'weekly': return 'Semanal';
        default: return frequency;
    }
};
