// Notification service for push notifications
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    return finalStatus === 'granted';
};

// Get push token and save to user profile
export const registerForPushNotifications = async (userId: string): Promise<string | null> => {
    try {
        const granted = await requestNotificationPermissions();
        if (!granted) return null;

        const token = await Notifications.getExpoPushTokenAsync();

        // Save token to user's profile in Firestore
        await setDoc(doc(db, 'users', userId), {
            pushToken: token.data,
            notificationsEnabled: true,
        }, { merge: true });

        return token.data;
    } catch (error) {
        console.error('Error registering for push notifications:', error);
        return null;
    }
};

// Schedule local notification
export const scheduleLocalNotification = async (
    title: string,
    body: string,
    triggerDate: Date,
    data?: Record<string, any>
): Promise<string> => {
    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: true,
        },
        trigger: triggerDate,
    });
    return id;
};

// Schedule appointment reminder (24 hours before)
export const scheduleAppointmentReminder = async (
    appointmentDate: Date,
    clientName: string,
    appointmentId: string
): Promise<string | null> => {
    const reminderDate = new Date(appointmentDate);
    reminderDate.setHours(reminderDate.getHours() - 24);

    // Only schedule if reminder is in the future
    if (reminderDate > new Date()) {
        return scheduleLocalNotification(
            '📅 Recordatorio de cita',
            `Tienes una cita mañana a las ${appointmentDate.getHours()}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`,
            reminderDate,
            { type: 'appointment_reminder', appointmentId }
        );
    }
    return null;
};

// Schedule 1 hour before reminder
export const scheduleAppointmentReminder1h = async (
    appointmentDate: Date,
    appointmentId: string
): Promise<string | null> => {
    const reminderDate = new Date(appointmentDate);
    reminderDate.setHours(reminderDate.getHours() - 1);

    if (reminderDate > new Date()) {
        return scheduleLocalNotification(
            '⏰ Cita en 1 hora',
            `Tu cita nutricional comienza en 1 hora`,
            reminderDate,
            { type: 'appointment_reminder_1h', appointmentId }
        );
    }
    return null;
};

// Send instant notification (for testing/immediate alerts)
export const sendInstantNotification = async (
    title: string,
    body: string,
    data?: Record<string, any>
): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: true,
        },
        trigger: null, // Immediate
    });
};

// Cancel scheduled notification
export const cancelNotification = async (notificationId: string): Promise<void> => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};

// Get all scheduled notifications
export const getScheduledNotifications = async () => {
    return await Notifications.getAllScheduledNotificationsAsync();
};

// Handle notification response (when user taps notification)
export const addNotificationResponseListener = (
    handler: (response: Notifications.NotificationResponse) => void
) => {
    return Notifications.addNotificationResponseReceivedListener(handler);
};

// Handle notification received while app is open
export const addNotificationReceivedListener = (
    handler: (notification: Notifications.Notification) => void
) => {
    return Notifications.addNotificationReceivedListener(handler);
};
