import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Payment {
    id: string;
    date: Date;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    description: string;
    paymentMethod?: string;
    reference?: string;
}

export default function PaymentHistoryScreen() {
    const { user } = useAuthContext();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, 'payments'),
                where('userId', '==', user.id),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate() || new Date(),
            })) as Payment[];
            setPayments(data);
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return Colors.success;
            case 'pending': return Colors.warning;
            case 'rejected': return Colors.error;
            default: return Colors.textMuted;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'Aprobado';
            case 'pending': return 'Pendiente';
            case 'rejected': return 'Rechazado';
            default: return status;
        }
    };

    const getTotalApproved = () => {
        return payments
            .filter(p => p.status === 'approved')
            .reduce((sum, p) => sum + p.amount, 0);
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
                        loadPayments();
                    }} />
                }
            >
                <View style={styles.wrapper}>
                    <Text style={styles.title}>Historial de pagos</Text>

                    {/* Summary */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Total pagado</Text>
                        <Text style={styles.summaryValue}>${getTotalApproved().toLocaleString()}</Text>
                    </View>

                    {payments.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>💳</Text>
                            <Text style={styles.emptyTitle}>Sin pagos</Text>
                            <Text style={styles.emptyText}>No tienes pagos registrados</Text>
                        </View>
                    ) : (
                        payments.map((payment) => (
                            <View key={payment.id} style={styles.paymentCard}>
                                <View style={styles.paymentHeader}>
                                    <Text style={styles.paymentDate}>
                                        {format(payment.date, "d MMM yyyy", { locale: es })}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                                            {getStatusText(payment.status)}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.paymentDesc}>{payment.description}</Text>
                                <View style={styles.paymentFooter}>
                                    {payment.paymentMethod && (
                                        <Text style={styles.paymentMethod}>{payment.paymentMethod}</Text>
                                    )}
                                    <Text style={styles.paymentAmount}>${payment.amount.toLocaleString()}</Text>
                                </View>
                                {payment.reference && (
                                    <Text style={styles.paymentRef}>Ref: {payment.reference}</Text>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    scroll: { flex: 1 },
    scrollContent: { paddingVertical: Spacing.md },
    wrapper: { paddingHorizontal: Spacing.md, maxWidth: 500, alignSelf: 'center', width: '100%' },
    title: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
    summaryCard: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.lg, alignItems: 'center' },
    summaryLabel: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.8)' },
    summaryValue: { fontSize: FontSizes.xxxl, fontWeight: FontWeights.bold, color: Colors.textLight },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
    emptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, color: Colors.text },
    emptyText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
    paymentCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm },
    paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
    paymentDate: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, color: Colors.text },
    statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.xs },
    statusText: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium },
    paymentDesc: { fontSize: FontSizes.md, color: Colors.text, marginBottom: Spacing.xs },
    paymentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    paymentMethod: { fontSize: FontSizes.xs, color: Colors.textMuted },
    paymentAmount: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.primary },
    paymentRef: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: Spacing.xs },
});
