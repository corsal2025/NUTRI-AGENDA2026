import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Order {
    id: string;
    date: Date;
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    total: number;
    items: { name: string; quantity: number; price: number }[];
}

export default function OrdersScreen() {
    const { user } = useAuthContext();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, 'orders'),
                where('clientId', '==', user.id),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate() || new Date(),
            })) as Order[];
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return Colors.warning;
            case 'confirmed': return Colors.info;
            case 'delivered': return Colors.success;
            case 'cancelled': return Colors.error;
            default: return Colors.textMuted;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'confirmed': return 'Confirmado';
            case 'delivered': return 'Entregado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
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
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => {
                        setRefreshing(true);
                        loadOrders();
                    }} />
                }
            >
                <View style={styles.wrapper}>
                    <Text style={styles.title}>Mis pedidos</Text>
                    <Text style={styles.subtitle}>Historial de compras</Text>

                    {orders.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📦</Text>
                            <Text style={styles.emptyTitle}>Sin pedidos</Text>
                            <Text style={styles.emptyText}>
                                Aún no has realizado ninguna compra
                            </Text>
                        </View>
                    ) : (
                        orders.map((order) => (
                            <View key={order.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardDate}>
                                        {format(order.date, "d MMM yyyy", { locale: es })}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                            {getStatusText(order.status)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.cardBody}>
                                    {order.items?.map((item, idx) => (
                                        <Text key={idx} style={styles.itemText}>
                                            {item.quantity}x {item.name}
                                        </Text>
                                    ))}
                                </View>
                                <View style={styles.cardFooter}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>${order.total?.toLocaleString()}</Text>
                                </View>
                            </View>
                        ))
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
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: Spacing.md,
    },
    wrapper: {
        paddingHorizontal: Spacing.md,
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    subtitle: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
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
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    cardDate: {
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.medium,
        color: Colors.text,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.xs,
    },
    statusText: {
        fontSize: FontSizes.xs,
        fontWeight: FontWeights.medium,
    },
    cardBody: {
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    itemText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.sm,
    },
    totalLabel: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
    },
    totalValue: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.bold,
        color: Colors.primary,
    },
});
