import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import {
    calculateBMI,
    calculateBodyFatFromBMI,
    calculateBMR,
    calculateWHR,
    calculateIdealWeight,
    calculateBodyComposition,
    calculateTDEE,
    getBMIClassification,
    getWHRRisk
} from '../../../types/anthropometrics';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export default function AnthropometricMeasurementScreen() {
    const router = useRouter();
    const { clientId, clientName, clientGender, clientAge } = useLocalSearchParams<{
        clientId: string;
        clientName: string;
        clientGender: 'male' | 'female';
        clientAge: string;
    }>();

    const [loading, setLoading] = useState(false);

    // Basic measurements
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    // Circumferences
    const [waist, setWaist] = useState('');
    const [hip, setHip] = useState('');
    const [chest, setChest] = useState('');
    const [arm, setArm] = useState('');
    const [thigh, setThigh] = useState('');
    const [calf, setCalf] = useState('');
    const [neck, setNeck] = useState('');

    // Skinfolds
    const [triceps, setTriceps] = useState('');
    const [subscapular, setSubscapular] = useState('');
    const [suprailiac, setSuprailiac] = useState('');
    const [abdominal, setAbdominal] = useState('');

    // Activity level
    const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');

    const [notes, setNotes] = useState('');

    const age = parseInt(clientAge) || 30;
    const gender = (clientGender as 'male' | 'female') || 'female';

    const calculateResults = () => {
        const w = parseFloat(weight);
        const h = parseFloat(height);

        if (!w || !h) return null;

        const bmi = calculateBMI(w, h);
        const bmiClass = getBMIClassification(bmi);
        const bodyFat = calculateBodyFatFromBMI(bmi, age, gender);
        const { fatMass, leanMass } = calculateBodyComposition(w, bodyFat);
        const bmr = calculateBMR(w, h, age, gender);
        const tdee = calculateTDEE(bmr, activityLevel);
        const idealWeight = calculateIdealWeight(h, gender);

        let whr = 0;
        let whrRisk = { risk: 'N/A', color: Colors.textMuted };
        if (waist && hip) {
            whr = calculateWHR(parseFloat(waist), parseFloat(hip));
            whrRisk = getWHRRisk(whr, gender);
        }

        return {
            bmi,
            bmiClass,
            bodyFat,
            fatMass,
            leanMass,
            bmr,
            tdee,
            idealWeight,
            whr,
            whrRisk,
        };
    };

    const results = weight && height ? calculateResults() : null;

    const handleSave = async () => {
        if (!weight || !height || !clientId) {
            Alert.alert('Error', 'Por favor ingresa peso y altura');
            return;
        }

        setLoading(true);
        try {
            const measurement = {
                clientId,
                date: Timestamp.now(),
                weight: parseFloat(weight),
                height: parseFloat(height),
                waist: waist ? parseFloat(waist) : null,
                hip: hip ? parseFloat(hip) : null,
                chest: chest ? parseFloat(chest) : null,
                arm: arm ? parseFloat(arm) : null,
                thigh: thigh ? parseFloat(thigh) : null,
                calf: calf ? parseFloat(calf) : null,
                neck: neck ? parseFloat(neck) : null,
                triceps: triceps ? parseFloat(triceps) : null,
                subscapular: subscapular ? parseFloat(subscapular) : null,
                suprailiac: suprailiac ? parseFloat(suprailiac) : null,
                abdominal: abdominal ? parseFloat(abdominal) : null,
                bmi: results?.bmi,
                bodyFat: results?.bodyFat,
                fatMass: results?.fatMass,
                leanMass: results?.leanMass,
                basalMetabolism: results?.bmr,
                waistHipRatio: results?.whr,
                notes,
                createdAt: Timestamp.now(),
            };

            await addDoc(collection(db, 'measurements'), measurement);

            Alert.alert('Guardado', 'Medición antropométrica registrada correctamente', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error saving measurement:', error);
            Alert.alert('Error', 'No se pudo guardar la medición');
        } finally {
            setLoading(false);
        }
    };

    const activityOptions = [
        { key: 'sedentary', label: 'Sedentario' },
        { key: 'light', label: 'Ligera' },
        { key: 'moderate', label: 'Moderada' },
        { key: 'active', label: 'Activa' },
        { key: 'very_active', label: 'Muy activa' },
    ];

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.wrapper}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Medición Antropométrica</Text>
                        <Text style={styles.subtitle}>{clientName}</Text>
                    </View>

                    {/* Basic Measurements */}
                    <Text style={styles.sectionTitle}>📏 Medidas básicas</Text>
                    <View style={styles.row}>
                        <View style={styles.inputHalf}>
                            <TextInput
                                mode="outlined"
                                label="Peso (kg)*"
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="decimal-pad"
                                style={styles.input}
                                outlineColor={Colors.inputBorder}
                                activeOutlineColor={Colors.primary}
                                textColor={Colors.inputText}
                            />
                        </View>
                        <View style={styles.inputHalf}>
                            <TextInput
                                mode="outlined"
                                label="Altura (cm)*"
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="decimal-pad"
                                style={styles.input}
                                outlineColor={Colors.inputBorder}
                                activeOutlineColor={Colors.primary}
                                textColor={Colors.inputText}
                            />
                        </View>
                    </View>

                    {/* Circumferences */}
                    <Text style={styles.sectionTitle}>📐 Perímetros (cm)</Text>
                    <View style={styles.row}>
                        <View style={styles.inputHalf}>
                            <TextInput mode="outlined" label="Cintura" value={waist} onChangeText={setWaist} keyboardType="decimal-pad" style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                        </View>
                        <View style={styles.inputHalf}>
                            <TextInput mode="outlined" label="Cadera" value={hip} onChangeText={setHip} keyboardType="decimal-pad" style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.inputHalf}>
                            <TextInput mode="outlined" label="Pecho" value={chest} onChangeText={setChest} keyboardType="decimal-pad" style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                        </View>
                        <View style={styles.inputHalf}>
                            <TextInput mode="outlined" label="Brazo" value={arm} onChangeText={setArm} keyboardType="decimal-pad" style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.inputHalf}>
                            <TextInput mode="outlined" label="Muslo" value={thigh} onChangeText={setThigh} keyboardType="decimal-pad" style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                        </View>
                        <View style={styles.inputHalf}>
                            <TextInput mode="outlined" label="Pantorrilla" value={calf} onChangeText={setCalf} keyboardType="decimal-pad" style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                        </View>
                    </View>

                    {/* Skinfolds */}
                    <Text style={styles.sectionTitle}>📍 Pliegues cutáneos (mm)</Text>
                    <View style={styles.row}>
                        <View style={styles.inputHalf}>
                            <TextInput mode="outlined" label="Tríceps" value={triceps} onChangeText={setTriceps} keyboardType="decimal-pad" style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                        </View>
                        <View style={styles.inputHalf}>
                            <TextInput mode="outlined" label="Subescapular" value={subscapular} onChangeText={setSubscapular} keyboardType="decimal-pad" style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.inputHalf}>
                            <TextInput mode="outlined" label="Suprailiaco" value={suprailiac} onChangeText={setSuprailiac} keyboardType="decimal-pad" style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                        </View>
                        <View style={styles.inputHalf}>
                            <TextInput mode="outlined" label="Abdominal" value={abdominal} onChangeText={setAbdominal} keyboardType="decimal-pad" style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                        </View>
                    </View>

                    {/* Activity Level */}
                    <Text style={styles.sectionTitle}>🏃 Nivel de actividad</Text>
                    <View style={styles.activityRow}>
                        {activityOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[
                                    styles.activityBtn,
                                    activityLevel === opt.key && styles.activityBtnActive
                                ]}
                                onPress={() => setActivityLevel(opt.key as any)}
                            >
                                <Text style={[
                                    styles.activityBtnText,
                                    activityLevel === opt.key && styles.activityBtnTextActive
                                ]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Notes */}
                    <TextInput
                        mode="outlined"
                        label="Notas"
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={3}
                        style={[styles.input, { marginTop: Spacing.md }]}
                        outlineColor={Colors.inputBorder}
                        activeOutlineColor={Colors.primary}
                        textColor={Colors.inputText}
                    />

                    {/* Results */}
                    {results && (
                        <View style={styles.resultsCard}>
                            <Text style={styles.resultsTitle}>📊 Resultados calculados</Text>
                            <Divider style={styles.divider} />

                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>IMC</Text>
                                <View>
                                    <Text style={[styles.resultValue, { color: results.bmiClass.color }]}>
                                        {results.bmi.toFixed(1)}
                                    </Text>
                                    <Text style={[styles.resultCategory, { color: results.bmiClass.color }]}>
                                        {results.bmiClass.category}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Grasa corporal</Text>
                                <Text style={styles.resultValue}>{results.bodyFat.toFixed(1)}%</Text>
                            </View>

                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Masa grasa</Text>
                                <Text style={styles.resultValue}>{results.fatMass.toFixed(1)} kg</Text>
                            </View>

                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Masa magra</Text>
                                <Text style={styles.resultValue}>{results.leanMass.toFixed(1)} kg</Text>
                            </View>

                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Metabolismo basal</Text>
                                <Text style={styles.resultValue}>{Math.round(results.bmr)} kcal</Text>
                            </View>

                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Gasto calórico diario</Text>
                                <Text style={styles.resultValue}>{Math.round(results.tdee)} kcal</Text>
                            </View>

                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Peso ideal</Text>
                                <Text style={styles.resultValue}>{results.idealWeight.toFixed(1)} kg</Text>
                            </View>

                            {results.whr > 0 && (
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Índice cintura-cadera</Text>
                                    <View>
                                        <Text style={styles.resultValue}>{results.whr.toFixed(2)}</Text>
                                        <Text style={[styles.resultCategory, { color: results.whrRisk.color }]}>
                                            Riesgo: {results.whrRisk.risk}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    <Button
                        mode="contained"
                        onPress={handleSave}
                        loading={loading}
                        disabled={loading || !weight || !height}
                        style={styles.saveBtn}
                        contentStyle={styles.saveBtnContent}
                        buttonColor={Colors.primary}
                    >
                        Guardar medición
                    </Button>

                    <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
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
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: Spacing.md,
        paddingBottom: 50,
    },
    wrapper: {
        paddingHorizontal: Spacing.md,
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.primary,
        fontWeight: FontWeights.medium,
    },
    sectionTitle: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.semibold,
        color: Colors.text,
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    inputHalf: {
        flex: 1,
    },
    input: {
        backgroundColor: Colors.surface,
        marginBottom: Spacing.xs,
    },
    activityRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    activityBtn: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    activityBtnActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    activityBtnText: {
        fontSize: FontSizes.sm,
        color: Colors.text,
    },
    activityBtnTextActive: {
        color: Colors.textLight,
        fontWeight: FontWeights.medium,
    },
    resultsCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginTop: Spacing.lg,
        ...Shadows.md,
    },
    resultsTitle: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.bold,
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    divider: {
        marginVertical: Spacing.sm,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    resultLabel: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
    },
    resultValue: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.bold,
        color: Colors.text,
        textAlign: 'right',
    },
    resultCategory: {
        fontSize: FontSizes.xs,
        textAlign: 'right',
    },
    saveBtn: {
        marginTop: Spacing.lg,
        borderRadius: BorderRadius.sm,
    },
    saveBtnContent: {
        height: 50,
    },
    cancelBtn: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    cancelText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
});
