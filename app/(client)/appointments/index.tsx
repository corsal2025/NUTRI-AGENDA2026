import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
    id: string;
    date: Date;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
}

export default function ClientAppointmentsScreen() {
    const router = useRouter();
    const { user } = useAuthContext();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, 'appointments'),
                where('clientId', '==', user.id),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);
            const appts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate(),
            })) as Appointment[];
            setAppointments(appts);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return Colors.info;
            case 'completed': return Colors.success;
            case 'cancelled': return Colors.error;
            default: return Colors.textMuted;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'scheduled': return 'Programada';
            case 'completed': return 'Completada';
            case 'cancelled': return 'Cancelada';
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
                        loadAppointments();
                    }} />
                }
            >
                <View style={styles.wrapper}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Mis citas</Text>
                        <TouchableOpacity
                            style={styles.newBtn}
                            onPress={() => router.push('/(client)/book-appointment')}
                        >
                            <Text style={styles.newBtnText}>+ Nueva</Text>
                        </TouchableOpacity>
                    </View>

                    {appointments.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📅</Text>
                            <Text style={styles.emptyTitle}>No tienes citas</Text>
                            <Text style={styles.emptyText}>Agenda tu primera cita con el nutricionista</Text>
                            <TouchableOpacity
                                style={styles.emptyBtn}
                                onPress={() => router.push('/(client)/book-appointment')}
                            >
                                <Text style={styles.emptyBtnText}>Agendar cita</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        appointments.map((apt) => (
                            <View key={apt.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardDate}>
                                        {format(apt.date, "EEEE d 'de' MMMM", { locale: es })}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(apt.status) + '20' }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(apt.status) }]}>
                                            {getStatusText(apt.status)}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.cardTime}>
                                    🕐 {format(apt.date, 'HH:mm')} hrs
                                </Text>
                                {apt.notes && (
                                    <Text style={styles.cardNotes} numberOfLines={2}>
                                        📝 {apt.notes}
                                    </Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    newBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    newBtnText: {
        color: Colors.textLight,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.semibold,
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
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    emptyBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
        marginTop: Spacing.lg,
    },
    emptyBtnText: {
        color: Colors.textLight,
        fontSize: FontSizes.md,
        fontWeight: FontWeights.semibold,
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
        marginBottom: Spacing.xs,
    },
    cardDate: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.medium,
        color: Colors.text,
        textTransform: 'capitalize',
        flex: 1,
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
    cardTime: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        fontWeight: FontWeights.medium,
    },
    cardNotes: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
});
