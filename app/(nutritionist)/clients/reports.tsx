import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface Measurement {
    id: string;
    date: Date;
    weight: number;
    bmi?: number;
    bodyFat?: number;
    waist?: number;
    hip?: number;
}

export default function ClientReportsScreen() {
    const { clientId, clientName } = useLocalSearchParams<{ clientId: string; clientName: string }>();
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('3m');

    useEffect(() => {
        loadMeasurements();
    }, [period]);

    const loadMeasurements = async () => {
        if (!clientId) return;
        try {
            const months = period === '1m' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12;
            const startDate = subMonths(new Date(), months);

            const q = query(
                collection(db, 'measurements'),
                where('clientId', '==', clientId),
                where('date', '>=', startDate),
                orderBy('date', 'asc')
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
        }
    };

    const getProgress = () => {
        if (measurements.length < 2) return null;
        const first = measurements[0];
        const last = measurements[measurements.length - 1];
        return {
            weightChange: last.weight - first.weight,
            bmiChange: (last.bmi || 0) - (first.bmi || 0),
            bodyFatChange: (last.bodyFat || 0) - (first.bodyFat || 0),
            waistChange: (last.waist || 0) - (first.waist || 0),
        };
    };

    const progress = getProgress();
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = Math.min(screenWidth - 40, 460);

    // Simple bar chart rendering
    const renderBarChart = (data: number[], labels: string[], title: string, unit: string) => {
        const max = Math.max(...data) || 1;
        const min = Math.min(...data);
        const range = max - min || 1;

        return (
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>{title}</Text>
                <View style={styles.barsContainer}>
                    {data.map((value, index) => (
                        <View key={index} style={styles.barWrapper}>
                            <Text style={styles.barValue}>{value.toFixed(1)}</Text>
                            <View
                                style={[
                                    styles.bar,
                                    { height: Math.max(((value - min) / range) * 100, 10) }
                                ]}
                            />
                            <Text style={styles.barLabel}>{labels[index]}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.chartUnit}>{unit}</Text>
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
        <View style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.wrapper}>
                    <Text style={styles.title}>Reportes</Text>
                    <Text style={styles.subtitle}>{clientName}</Text>

                    {/* Period selector */}
                    <SegmentedButtons
                        value={period}
                        onValueChange={setPeriod}
                        buttons={[
                            { value: '1m', label: '1 mes' },
                            { value: '3m', label: '3 meses' },
                            { value: '6m', label: '6 meses' },
                            { value: '12m', label: '1 año' },
                        ]}
                        style={styles.periodSelector}
                    />

                    {measurements.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📊</Text>
                            <Text style={styles.emptyTitle}>Sin datos</Text>
                            <Text style={styles.emptyText}>No hay mediciones en este período</Text>
                        </View>
                    ) : (
                        <>
                            {/* Progress Summary */}
                            {progress && (
                                <View style={styles.progressCard}>
                                    <Text style={styles.progressTitle}>📈 Progreso del período</Text>
                                    <View style={styles.progressGrid}>
                                        <View style={styles.progressItem}>
                                            <Text style={[
                                                styles.progressChange,
                                                { color: progress.weightChange < 0 ? Colors.success : Colors.error }
                                            ]}>
                                                {progress.weightChange > 0 ? '+' : ''}{progress.weightChange.toFixed(1)} kg
                                            </Text>
                                            <Text style={styles.progressLabel}>Peso</Text>
                                        </View>
                                        <View style={styles.progressItem}>
                                            <Text style={[
                                                styles.progressChange,
                                                { color: progress.bmiChange < 0 ? Colors.success : Colors.error }
                                            ]}>
                                                {progress.bmiChange > 0 ? '+' : ''}{progress.bmiChange.toFixed(1)}
                                            </Text>
                                            <Text style={styles.progressLabel}>IMC</Text>
                                        </View>
                                        <View style={styles.progressItem}>
                                            <Text style={[
                                                styles.progressChange,
                                                { color: progress.bodyFatChange < 0 ? Colors.success : Colors.error }
                                            ]}>
                                                {progress.bodyFatChange > 0 ? '+' : ''}{progress.bodyFatChange.toFixed(1)}%
                                            </Text>
                                            <Text style={styles.progressLabel}>Grasa</Text>
                                        </View>
                                        <View style={styles.progressItem}>
                                            <Text style={[
                                                styles.progressChange,
                                                { color: progress.waistChange < 0 ? Colors.success : Colors.error }
                                            ]}>
                                                {progress.waistChange > 0 ? '+' : ''}{progress.waistChange.toFixed(1)} cm
                                            </Text>
                                            <Text style={styles.progressLabel}>Cintura</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Weight Chart */}
                            {renderBarChart(
                                measurements.map(m => m.weight),
                                measurements.map(m => format(m.date, 'dd/MM')),
                                '⚖️ Peso',
                                'kg'
                            )}

                            {/* BMI Chart */}
                            {measurements.some(m => m.bmi) && renderBarChart(
                                measurements.map(m => m.bmi || 0).filter(v => v > 0),
                                measurements.filter(m => m.bmi).map(m => format(m.date, 'dd/MM')),
                                '📊 IMC',
                                ''
                            )}

                            {/* Body Fat Chart */}
                            {measurements.some(m => m.bodyFat) && renderBarChart(
                                measurements.map(m => m.bodyFat || 0).filter(v => v > 0),
                                measurements.filter(m => m.bodyFat).map(m => format(m.date, 'dd/MM')),
                                '💪 % Grasa corporal',
                                '%'
                            )}

                            {/* Measurements Table */}
                            <View style={styles.tableCard}>
                                <Text style={styles.tableTitle}>📋 Historial de mediciones</Text>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableCell, styles.tableCellHeader]}>Fecha</Text>
                                    <Text style={[styles.tableCell, styles.tableCellHeader]}>Peso</Text>
                                    <Text style={[styles.tableCell, styles.tableCellHeader]}>IMC</Text>
                                    <Text style={[styles.tableCell, styles.tableCellHeader]}>Grasa</Text>
                                </View>
                                {measurements.slice().reverse().map((m, idx) => (
                                    <View key={m.id} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
                                        <Text style={styles.tableCell}>{format(m.date, 'dd/MM/yy')}</Text>
                                        <Text style={styles.tableCell}>{m.weight} kg</Text>
                                        <Text style={styles.tableCell}>{m.bmi?.toFixed(1) || '-'}</Text>
                                        <Text style={styles.tableCell}>{m.bodyFat ? `${m.bodyFat}%` : '-'}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
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
    scrollContent: { paddingVertical: Spacing.md, paddingBottom: 50 },
    wrapper: { paddingHorizontal: Spacing.md, maxWidth: 600, alignSelf: 'center', width: '100%' },
    title: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.text },
    subtitle: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: FontWeights.medium, marginBottom: Spacing.md },
    periodSelector: { marginBottom: Spacing.lg },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
    emptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, color: Colors.text },
    emptyText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
    progressCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.sm },
    progressTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: Spacing.sm },
    progressGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    progressItem: { alignItems: 'center' },
    progressChange: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
    progressLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },
    chartContainer: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.sm },
    chartTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: Spacing.sm },
    barsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120, marginBottom: Spacing.xs },
    barWrapper: { alignItems: 'center', flex: 1 },
    bar: { width: 24, backgroundColor: Colors.primary, borderRadius: 4, minHeight: 10 },
    barValue: { fontSize: 10, color: Colors.textSecondary, marginBottom: 2 },
    barLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 4 },
    chartUnit: { fontSize: FontSizes.xs, color: Colors.textMuted, textAlign: 'right' },
    tableCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, ...Shadows.sm },
    tableTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: Spacing.sm },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: Spacing.xs },
    tableRow: { flexDirection: 'row', paddingVertical: Spacing.xs },
    tableRowEven: { backgroundColor: Colors.background },
    tableCell: { flex: 1, fontSize: FontSizes.sm, color: Colors.text },
    tableCellHeader: { fontWeight: FontWeights.semibold, color: Colors.textSecondary },
});
