// Chat service for internal messaging between nutritionist and client
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderRole: 'nutritionist' | 'client';
    text: string;
    timestamp: Date;
    read: boolean;
}

export interface Conversation {
    id: string;
    nutritionistId: string;
    nutritionistName: string;
    clientId: string;
    clientName: string;
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount: number;
}

// Get or create conversation between nutritionist and client
export const getOrCreateConversation = async (
    nutritionistId: string,
    nutritionistName: string,
    clientId: string,
    clientName: string
): Promise<string> => {
    // Check if conversation exists
    const q = query(
        collection(db, 'conversations'),
        where('nutritionistId', '==', nutritionistId),
        where('clientId', '==', clientId)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        return snapshot.docs[0].id;
    }

    // Create new conversation
    const docRef = await addDoc(collection(db, 'conversations'), {
        nutritionistId,
        nutritionistName,
        clientId,
        clientName,
        unreadCount: 0,
        createdAt: serverTimestamp(),
    });

    return docRef.id;
};

// Send message
export const sendMessage = async (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderRole: 'nutritionist' | 'client',
    text: string
): Promise<void> => {
    await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId,
        senderName,
        senderRole,
        text,
        timestamp: serverTimestamp(),
        read: false,
    });

    // Update conversation last message
    await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
    });
};

// Subscribe to messages in a conversation
export const subscribeToMessages = (
    conversationId: string,
    callback: (messages: ChatMessage[]) => void
): (() => void) => {
    const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as ChatMessage[];
        callback(messages);
    });
};

// Get conversations for user
export const getConversations = async (
    userId: string,
    role: 'nutritionist' | 'client'
): Promise<Conversation[]> => {
    const field = role === 'nutritionist' ? 'nutritionistId' : 'clientId';
    const q = query(
        collection(db, 'conversations'),
        where(field, '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate(),
    })) as Conversation[];
};

// Mark messages as read
export const markMessagesAsRead = async (
    conversationId: string,
    userId: string
): Promise<void> => {
    const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', userId),
        where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updates);
};
