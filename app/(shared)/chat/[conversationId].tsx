import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
    subscribeToMessages,
    sendMessage,
    ChatMessage,
    markMessagesAsRead
} from '../../../services/chat.service';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { format } from 'date-fns';

export default function ChatScreen() {
    const { conversationId, otherName } = useLocalSearchParams<{ conversationId: string; otherName: string }>();
    const router = useRouter();
    const { user } = useAuthContext();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!conversationId) return;

        const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
            setMessages(msgs);
            setLoading(false);
            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        // Mark messages as read
        if (user) {
            markMessagesAsRead(conversationId, user.id);
        }

        return () => unsubscribe();
    }, [conversationId]);

    const handleSend = async () => {
        if (!newMessage.trim() || !user || !conversationId) return;

        setSending(true);
        try {
            await sendMessage(
                conversationId,
                user.id,
                user.name || 'Usuario',
                user.role === 'nutritionist' ? 'nutritionist' : 'client',
                newMessage.trim()
            );
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isOwnMessage = item.senderId === user?.id;

        return (
            <View style={[
                styles.messageBubble,
                isOwnMessage ? styles.ownMessage : styles.otherMessage
            ]}>
                <Text style={[
                    styles.messageText,
                    isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                ]}>
                    {item.text}
                </Text>
                <Text style={[
                    styles.messageTime,
                    isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
                ]}>
                    {format(item.timestamp, 'HH:mm')}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backBtn}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{otherName || 'Chat'}</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>💬</Text>
                        <Text style={styles.emptyText}>No hay mensajes aún</Text>
                        <Text style={styles.emptySubtext}>Envía el primer mensaje</Text>
                    </View>
                }
            />

            {/* Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    mode="outlined"
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                    style={styles.input}
                    outlineColor={Colors.border}
                    activeOutlineColor={Colors.primary}
                    textColor={Colors.inputText}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[styles.sendBtn, (!newMessage.trim() || sending) && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!newMessage.trim() || sending}
                >
                    <Text style={styles.sendBtnText}>➤</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    backBtn: {
        fontSize: FontSizes.md,
        color: Colors.primary,
        fontWeight: FontWeights.medium,
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.semibold,
        color: Colors.text,
    },
    messagesList: {
        padding: Spacing.md,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    emptyText: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.semibold,
        color: Colors.text,
    },
    emptySubtext: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
    },
    ownMessage: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.surface,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: FontSizes.md,
        lineHeight: 20,
    },
    ownMessageText: {
        color: Colors.textLight,
    },
    otherMessageText: {
        color: Colors.text,
    },
    messageTime: {
        fontSize: FontSizes.xs,
        marginTop: 4,
    },
    ownMessageTime: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'right',
    },
    otherMessageTime: {
        color: Colors.textMuted,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: Spacing.sm,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        gap: Spacing.sm,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.surface,
        maxHeight: 100,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: Colors.border,
    },
    sendBtnText: {
        fontSize: 20,
        color: Colors.textLight,
    },
});
