import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { getConversations, Conversation } from '../../../services/chat.service';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ConversationsScreen() {
    const router = useRouter();
    const { user } = useAuthContext();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        if (!user) return;
        try {
            const role = user.role === 'nutritionist' ? 'nutritionist' : 'client';
            const convs = await getConversations(user.id, role);
            setConversations(convs);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const openChat = (conv: Conversation) => {
        const otherName = user?.role === 'nutritionist' ? conv.clientName : conv.nutritionistName;
        router.push({
            pathname: '/(shared)/chat/[conversationId]',
            params: { conversationId: conv.id, otherName }
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mensajes</Text>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.wrapper}>
                    {conversations.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>💬</Text>
                            <Text style={styles.emptyTitle}>Sin conversaciones</Text>
                            <Text style={styles.emptyText}>
                                {user?.role === 'nutritionist'
                                    ? 'Inicia una conversación desde el perfil de un cliente'
                                    : 'Tu nutricionista te contactará por aquí'}
                            </Text>
                        </View>
                    ) : (
                        conversations.map((conv) => {
                            const otherName = user?.role === 'nutritionist' ? conv.clientName : conv.nutritionistName;
                            return (
                                <TouchableOpacity
                                    key={conv.id}
                                    style={styles.conversationItem}
                                    onPress={() => openChat(conv)}
                                >
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {otherName?.charAt(0).toUpperCase() || '?'}
                                        </Text>
                                    </View>
                                    <View style={styles.convInfo}>
                                        <Text style={styles.convName}>{otherName}</Text>
                                        {conv.lastMessage && (
                                            <Text style={styles.lastMessage} numberOfLines={1}>
                                                {conv.lastMessage}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.convMeta}>
                                        {conv.lastMessageTime && (
                                            <Text style={styles.convTime}>
                                                {format(conv.lastMessageTime, 'HH:mm', { locale: es })}
                                            </Text>
                                        )}
                                        {conv.unreadCount > 0 && (
                                            <View style={styles.unreadBadge}>
                                                <Text style={styles.unreadText}>{conv.unreadCount}</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </View>
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
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: Spacing.sm,
    },
    wrapper: {
        paddingHorizontal: Spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.semibold,
        color: Colors.text,
    },
    emptyText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.xs,
        paddingHorizontal: Spacing.lg,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.bold,
        color: Colors.textLight,
    },
    convInfo: {
        flex: 1,
    },
    convName: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.semibold,
        color: Colors.text,
    },
    lastMessage: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    convMeta: {
        alignItems: 'flex-end',
    },
    convTime: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
    },
    unreadBadge: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    unreadText: {
        color: Colors.textLight,
        fontSize: FontSizes.xs,
        fontWeight: FontWeights.bold,
    },
});
