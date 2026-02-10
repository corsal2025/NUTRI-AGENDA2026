import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, Button, Switch, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Colors, Shadows, BorderRadius, FontSizes } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function NewReportScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State matching the 'Fitdays' Receipt
    const [form, setForm] = useState({
        // Header
        height: '184',
        age: '41',
        gender: 'Mujer',

        // Body Composition
        weight: '106.6',
        bodyFatKg: '29.3',
        skeletalMuscleKg: '5.2', // Low? Image says 5.2 but seems low for total, check later.
        proteinKg: '15.5',
        waterKg: '56.7',
        muscleMassKg: '72.2',
        boneMassKg: '5.2', // Assuming 'Masa Esqueletica' in first section or similar

        // Obesity Analysis
        bmi: '31.5',
        bodyFatPercent: '27.5',

        // Control
        bodyScore: '90',
        targetWeight: '93.7',
        weightControl: '-12.9',
        fatControl: '-12.9',
        muscleControl: '0.0',

        // Other Indicators
        visceralFat: '11',
        bmr: '2039', // Tasa metabolica basal
        fatFreeWeight: '77.4',
        subcutaneousFat: '19.6',
        smi: '10.3', // Skeletal Muscle Index?
        bodyAge: '39',
        whr: '0.93', // Waist Hip Ratio
    });

    const updateForm = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        // TODO: Firebase Save Logic
        setTimeout(() => {
            setLoading(false);
            router.back();
        }, 1500);
    };

    const SectionHeader = ({ title, icon }) => (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
                <Text style={{ fontSize: 16 }}>{icon}</Text>
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    const MetricInput = ({ label, value, field, unit, color = Colors.primary }) => (
        <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: color }]}>{label}</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    value={value}
                    onChangeText={(t) => updateForm(field, t)}
                    style={styles.input}
                    keyboardType="numeric"
                    textColor={Colors.white}
                    underlineColor="transparent"
                    activeUnderlineColor={color}
                    theme={{ colors: { background: 'transparent', primary: color } }}
                />
                <Text style={styles.inputUnit}>{unit}</Text>
            </View>
        </View>
    );

    return (
        <ImageBackground
            source={require('../../assets/tech_bg.png')}
            style={styles.container}
            resizeMode="cover"
        >
            <View style={styles.overlay} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>
                    <MotiView
                        from={{ opacity: 0, translateY: -20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={styles.header}
                    >
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Text style={styles.backText}>← CANCELAR</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>NUEVA EVALUACIÓN</Text>
                        <Text style={styles.subtitle}>Protocolo Fitdays™ / InBody</Text>
                    </MotiView>

                    {/* Main Card */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 200 }}
                        style={styles.card}
                    >
                        {/* Score Circle */}
                        <View style={styles.scoreContainer}>
                            <LinearGradient
                                colors={[Colors.accent, 'transparent']}
                                style={styles.scoreGradient}
                            >
                                <Text style={styles.scoreValue}>{form.bodyScore}</Text>
                                <Text style={styles.scoreLabel}>PUNTUACIÓN</Text>
                            </LinearGradient>
                        </View>

                        {/* Section 1: Basic Info */}
                        <SectionHeader title="DATOS BIOMÉTRICOS" icon="👤" />
                        <View style={styles.row}>
                            <MetricInput label="Altura (cm)" value={form.height} field="height" unit="cm" />
                            <MetricInput label="Edad" value={form.age} field="age" unit="años" />
                        </View>

                        <Divider style={styles.divider} />

                        {/* Section 2: Composition */}
                        <SectionHeader title="COMPOSICIÓN CORPORAL" icon="🧬" />
                        <View style={styles.grid}>
                            <MetricInput label="Peso Total" value={form.weight} field="weight" unit="kg" color={Colors.white} />
                            <MetricInput label="Grasa Corp." value={form.bodyFatKg} field="bodyFatKg" unit="kg" color={Colors.warning} />
                            <MetricInput label="Masa Muscular" value={form.muscleMassKg} field="muscleMassKg" unit="kg" color={Colors.accent} />
                            <MetricInput label="Agua Total" value={form.waterKg} field="waterKg" unit="kg" color={Colors.info} />
                            <MetricInput label="Proteína" value={form.proteinKg} field="proteinKg" unit="kg" />
                            <MetricInput label="Masa Ósea" value={form.boneMassKg} field="boneMassKg" unit="kg" />
                        </View>

                        <Divider style={styles.divider} />

                        {/* Section 3: Obesity & Analysis */}
                        <SectionHeader title="ANÁLISIS DE OBESIDAD" icon="⚖️" />
                        <View style={styles.row}>
                            <MetricInput label="IMC (BMI)" value={form.bmi} field="bmi" unit="kg/m²" color={Colors.warning} />
                            <MetricInput label="% Grasa Corp." value={form.bodyFatPercent} field="bodyFatPercent" unit="%" color={Colors.warning} />
                        </View>
                        <View style={styles.row}>
                            <MetricInput label="Grasa Visceral" value={form.visceralFat} field="visceralFat" unit="Nivel" color={Colors.error} />
                            <MetricInput label="R. Cintura-Cadera" value={form.whr} field="whr" unit="ratio" />
                        </View>

                        <Divider style={styles.divider} />

                        {/* Section 4: Control & Goals */}
                        <SectionHeader title="CONTROL DE PESO" icon="🎯" />
                        <View style={styles.grid}>
                            <MetricInput label="Peso Objetivo" value={form.targetWeight} field="targetWeight" unit="kg" color={Colors.success} />
                            <MetricInput label="Control Peso" value={form.weightControl} field="weightControl" unit="kg" />
                            <MetricInput label="Control Grasa" value={form.fatControl} field="fatControl" unit="kg" color={Colors.success} />
                            <MetricInput label="Control Músc." value={form.muscleControl} field="muscleControl" unit="kg" />
                        </View>

                        <Divider style={styles.divider} />

                        {/* Section 5: Metabolic */}
                        <SectionHeader title="METABOLISMO" icon="🔥" />
                        <View style={styles.row}>
                            <MetricInput label="Tasa Basal (BMR)" value={form.bmr} field="bmr" unit="kcal" color={Colors.primary} />
                            <MetricInput label="Edad Metabólica" value={form.bodyAge} field="bodyAge" unit="años" />
                        </View>
                    </MotiView>

                    {/* Save Button */}
                    <MotiView
                        from={{ translateY: 50, opacity: 0 }}
                        animate={{ translateY: 0, opacity: 1 }}
                        transition={{ delay: 400 }}
                    >
                        <Button
                            mode="contained"
                            onPress={handleSave}
                            loading={loading}
                            style={styles.saveBtn}
                            contentStyle={{ height: 56 }}
                            labelStyle={styles.saveBtnLabel}
                        >
                            GUARDAR INFORME
                        </Button>
                    </MotiView>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(5, 10, 20, 0.85)', // Very dark overlay for hologram contrast
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 5,
    },
    backText: {
        color: Colors.textMuted,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.white,
        letterSpacing: 2,
        textShadowColor: Colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    subtitle: {
        color: Colors.accent,
        fontSize: 12,
        letterSpacing: 3,
        marginTop: 5,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 24,
    },
    scoreContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    scoreGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.accent,
    },
    scoreValue: {
        fontSize: 42,
        fontWeight: 'bold',
        color: Colors.white,
        textShadowColor: Colors.accent,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    scoreLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: Colors.accent,
        letterSpacing: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    sectionIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    sectionTitle: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
        justifyContent: 'space-between',
    },
    inputWrapper: {
        flex: 1,
        minWidth: '45%',
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputUnit: {
        color: Colors.textMuted,
        fontSize: 12,
        marginRight: 12,
    },
    divider: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 16,
    },
    saveBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        ...Shadows.strong,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    saveBtnLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
        letterSpacing: 2,
    },
});
