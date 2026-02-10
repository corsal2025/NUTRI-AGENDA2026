import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Card, DataTable, Text, useTheme, Chip, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { BiometricReport } from '../types/biometrics';
import { generateBiometricReportPDF } from '../services/pdf.service';
import { Colors, Spacing, BorderRadius, Shadows, FontWeights, FontSizes } from '@/constants/theme';

export const BiometricReportView = ({ report }: { report: BiometricReport }) => {
    const theme = useTheme();

    const AssessmentChip = ({ value }: { value: string }) => {
        let backgroundColor = Colors.primary;
        let textColor = Colors.white;

        // Using theme-consistent logic
        const lowerValue = value.toLowerCase();
        if (lowerValue === 'alto' || lowerValue === 'very high') {
            backgroundColor = 'rgba(239, 68, 68, 0.2)'; // Error with transparency
            textColor = Colors.error;
        } else if (lowerValue === 'bajo' || lowerValue === 'low') {
            backgroundColor = 'rgba(245, 158, 11, 0.2)'; // Warning with transparency
            textColor = Colors.warning;
        } else if (lowerValue === 'excelente' || lowerValue === 'normal') {
            backgroundColor = 'rgba(163, 230, 53, 0.2)'; // Neon Green transparency
            textColor = Colors.accent;
        }

        return (
            <Chip 
                style={{ backgroundColor, borderRadius: BorderRadius.sm }} 
                textStyle={{ color: textColor, fontSize: 10, fontWeight: '700' }}
            >
                {value}
            </Chip>
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 600 }}
            >
                {/* Header / Score Card - Premium Gradient Look */}
                <LinearGradient
                    colors={[Colors.purple, Colors.midnight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCard}
                >
                    <View>
                        <Text style={[styles.cardTitle, { color: Colors.white }]}>Informe de Composición</Text>
                        <Text style={[styles.cardSubtitle, { color: Colors.grey200 }]}>
                            ID: {report.patientId} | {report.date}
                        </Text>
                    </View>
                    
                    <View style={styles.scoreContainer}>
                        <MotiView
                            from={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 300, type: 'spring' }}
                        >
                            <Text style={styles.scoreText}>{report.score}</Text>
                        </MotiView>
                        <Text style={styles.scoreLabel}>/100 Puntos</Text>
                    </View>

                    <Button
                        mode="contained"
                        icon="share-variant"
                        onPress={() => generateBiometricReportPDF(report)}
                        buttonColor={Colors.accent}
                        textColor={Colors.midnight}
                        style={styles.pdfButton}
                        labelStyle={{ fontWeight: 'bold' }}
                    >
                        Generar PDF
                    </Button>
                </LinearGradient>
            </MotiView>

            {/* Tabla Principal */}
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 200, type: 'timing', duration: 600 }}
            >
                <Card style={styles.card}>
                    <Card.Title 
                        title="Análisis Detallado" 
                        titleStyle={[styles.cardHeaderTitle, { color: Colors.text }]}
                        left={(props) => <View {...props} style={[props.style, { backgroundColor: Colors.primary, width: 4, height: 20, borderRadius: 2 }]} />}
                    />
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title textStyle={{ color: Colors.textSecondary }}>Métrica</DataTable.Title>
                            <DataTable.Title numeric textStyle={{ color: Colors.textSecondary }}>Valor</DataTable.Title>
                            <DataTable.Title numeric textStyle={{ color: Colors.textSecondary }}>Evaluación</DataTable.Title>
                        </DataTable.Header>

                        {Object.entries(report.composition).map(([key, data]) => (
                            <DataTable.Row key={key} style={{ borderBottomColor: Colors.shadowLight }}>
                                <DataTable.Cell textStyle={{ color: Colors.text }}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: Colors.textMuted }}>
                                    {data.value} {data.unit}
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <AssessmentChip value={data.assessment} />
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}
                    </DataTable>
                </Card>
            </MotiView>

            {/* Control de Peso */}
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 400, type: 'timing', duration: 600 }}
            >
                <Card style={[styles.card, { borderLeftColor: Colors.accent, borderLeftWidth: 4 }]}>
                    <Card.Title 
                        title="Control de Objetivos" 
                        titleStyle={[styles.cardHeaderTitle, { color: Colors.text }]}
                    />
                    <Card.Content>
                        <View style={styles.kpRow}>
                            <Text style={{ color: Colors.textSecondary }}>Peso Objetivo</Text>
                            <Text style={[styles.kpiValue, { color: Colors.primary }]}>
                                {report.weightControl.targetWeight} <Text style={{ fontSize: 14 }}>kg</Text>
                            </Text>
                        </View>
                        <Divider style={{ backgroundColor: Colors.shadowLight, marginVertical: Spacing.sm }} />
                        
                        <View style={styles.kpRow}>
                            <Text style={{ color: Colors.textSecondary }}>Control Grasa</Text>
                            <Text style={[styles.kpiValue, { color: Colors.error }]}>
                                {report.weightControl.fatControl} <Text style={{ fontSize: 14 }}>kg</Text>
                            </Text>
                        </View>
                        <Divider style={{ backgroundColor: Colors.shadowLight, marginVertical: Spacing.sm }} />

                        <View style={styles.kpRow}>
                            <Text style={{ color: Colors.textSecondary }}>Control Músculo</Text>
                            <Text style={[styles.kpiValue, { color: Colors.success }]}>
                                {report.weightControl.muscleControl > 0 ? '+' : ''}{report.weightControl.muscleControl} <Text style={{ fontSize: 14 }}>kg</Text>
                            </Text>
                        </View>
                    </Card.Content>
                </Card>
            </MotiView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: Spacing.md, 
        backgroundColor: Colors.background 
    },
    gradientCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
        ...Shadows.medium,
    },
    card: {
        marginBottom: Spacing.lg,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        ...Shadows.soft,
    },
    cardTitle: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.bold,
    },
    cardSubtitle: {
        fontSize: FontSizes.sm,
        marginTop: 4,
    },
    cardHeaderTitle: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.bold,
    },
    scoreContainer: { 
        alignItems: 'center', 
        marginVertical: Spacing.lg,
    },
    scoreText: { 
        fontSize: 64, 
        fontWeight: FontWeights.bold, 
        color: Colors.white,
        textShadowColor: Colors.neonPurple,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    scoreLabel: { 
        fontSize: FontSizes.md, 
        color: 'rgba(255,255,255,0.7)',
        marginTop: -5
    },
    pdfButton: {
        alignSelf: 'center',
        width: '100%',
        borderRadius: BorderRadius.round,
    },
    row: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 5 
    },
    kpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 4
    },
    kpiValue: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold'
    }
});
