import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Measurement {
    id: string;
    date: Date;
    weight: number;
    height?: number;
    bmi?: number;
    bodyFat?: number;
    muscleMass?: number;
}

export default function ProgressScreen() {
    const { user } = useAuthContext();
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadMeasurements();
    }, []);

    const loadMeasurements = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, 'measurements'),
                where('clientId', '==', user.id),
                orderBy('date', 'desc'),
                limit(10)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate() || new Date(),
            })) as Measurement[];
            setMeasurements(data);
        } catch (error) {
            console.error('Error loading measurements:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const latestMeasurement = measurements[0];

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => {
                        setRefreshing(true);
                        loadMeasurements();
                    }} />
                }
            >
                <View style={styles.wrapper}>
                    <Text style={styles.title}>Mi progreso</Text>
                    <Text style={styles.subtitle}>Seguimiento de tus medidas</Text>

                    {/* Current Stats */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statIcon}>⚖️</Text>
                            <Text style={styles.statValue}>
                                {latestMeasurement?.weight || '--'}
                            </Text>
                            <Text style={styles.statLabel}>kg</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statIcon}>📊</Text>
                            <Text style={styles.statValue}>
                                {latestMeasurement?.bmi?.toFixed(1) || '--'}
                            </Text>
                            <Text style={styles.statLabel}>IMC</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statIcon}>💪</Text>
                            <Text style={styles.statValue}>
                                {latestMeasurement?.bodyFat ? `${latestMeasurement.bodyFat}%` : '--'}
                            </Text>
                            <Text style={styles.statLabel}>Grasa</Text>
                        </View>
                    </View>

                    {/* History */}
                    <Text style={styles.sectionTitle}>Historial</Text>

                    {measurements.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📈</Text>
                            <Text style={styles.emptyTitle}>Sin registros</Text>
                            <Text style={styles.emptyText}>
                                Tu nutricionista registrará tus medidas en cada consulta
                            </Text>
                        </View>
                    ) : (
                        measurements.map((m) => (
                            <View key={m.id} style={styles.historyCard}>
                                <View style={styles.historyHeader}>
                                    <Text style={styles.historyDate}>
                                        {format(m.date, "d 'de' MMMM yyyy", { locale: es })}
                                    </Text>
                                </View>
                                <View style={styles.historyStats}>
                                    <View style={styles.historyStat}>
                                        <Text style={styles.historyValue}>{m.weight} kg</Text>
                                        <Text style={styles.historyLabel}>Peso</Text>
                                    </View>
                                    {m.bmi && (
                                        <View style={styles.historyStat}>
                                            <Text style={styles.historyValue}>{m.bmi.toFixed(1)}</Text>
                                            <Text style={styles.historyLabel}>IMC</Text>
                                        </View>
                                    )}
                                    {m.bodyFat && (
                                        <View style={styles.historyStat}>
                                            <Text style={styles.historyValue}>{m.bodyFat}%</Text>
                                            <Text style={styles.historyLabel}>Grasa</Text>
                                        </View>
                                    )}
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
    statsGrid: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        ...Shadows.sm,
    },
    statIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    statValue: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    statLabel: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
    },
    sectionTitle: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.semibold,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    emptyIcon: {
        fontSize: 40,
        marginBottom: Spacing.sm,
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
    historyCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    historyHeader: {
        marginBottom: Spacing.sm,
    },
    historyDate: {
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.medium,
        color: Colors.text,
    },
    historyStats: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    historyStat: {
        alignItems: 'center',
    },
    historyValue: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.bold,
        color: Colors.primary,
    },
    historyLabel: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
    },
});
