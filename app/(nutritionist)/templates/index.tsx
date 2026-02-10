import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, FAB, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';

interface DietTemplate {
    id: string;
    name: string;
    description: string;
    meals: {
        breakfast: string;
        snack1: string;
        lunch: string;
        snack2: string;
        dinner: string;
    };
    calories: number;
    createdAt: Date;
}

const DEFAULT_TEMPLATES: Omit<DietTemplate, 'id' | 'createdAt'>[] = [
    {
        name: 'Plan Hipocalórico',
        description: 'Para pérdida de peso moderada',
        calories: 1500,
        meals: {
            breakfast: 'Yogurt griego con frutas y granola (200 kcal)',
            snack1: 'Manzana con 10 almendras (150 kcal)',
            lunch: 'Pollo a la plancha con ensalada y quinoa (400 kcal)',
            snack2: 'Batido de proteína con banana (200 kcal)',
            dinner: 'Salmón al horno con vegetales (350 kcal)',
        },
    },
    {
        name: 'Plan Hiperproteico',
        description: 'Para ganancia muscular',
        calories: 2500,
        meals: {
            breakfast: 'Huevos revueltos con pan integral y aguacate (450 kcal)',
            snack1: 'Batido de proteína con avena (300 kcal)',
            lunch: 'Pechuga de pollo con arroz y legumbres (600 kcal)',
            snack2: 'Cottage cheese con frutas (250 kcal)',
            dinner: 'Filete de res con papa y brócoli (600 kcal)',
        },
    },
    {
        name: 'Plan Mediterráneo',
        description: 'Alimentación equilibrada',
        calories: 2000,
        meals: {
            breakfast: 'Tostadas con aceite de oliva, tomate y jamón (350 kcal)',
            snack1: 'Frutos secos variados (200 kcal)',
            lunch: 'Pescado al horno con ensalada mediterránea (500 kcal)',
            snack2: 'Yogurt con miel (150 kcal)',
            dinner: 'Pasta integral con verduras salteadas (500 kcal)',
        },
    },
];

export default function DietTemplatesScreen() {
    const router = useRouter();
    const { user } = useAuthContext();
    const [templates, setTemplates] = useState<DietTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<DietTemplate | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [calories, setCalories] = useState('');
    const [breakfast, setBreakfast] = useState('');
    const [snack1, setSnack1] = useState('');
    const [lunch, setLunch] = useState('');
    const [snack2, setSnack2] = useState('');
    const [dinner, setDinner] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, 'dietTemplates'),
                where('nutritionistId', '==', user.id)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate() || new Date(),
            })) as DietTemplate[];
            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name || !user) {
            Alert.alert('Error', 'Por favor ingresa un nombre');
            return;
        }

        setSaving(true);
        try {
            await addDoc(collection(db, 'dietTemplates'), {
                nutritionistId: user.id,
                name,
                description,
                calories: parseInt(calories) || 0,
                meals: { breakfast, snack1, lunch, snack2, dinner },
                createdAt: Timestamp.now(),
            });

            resetForm();
            loadTemplates();
            Alert.alert('Guardado', 'Plantilla creada correctamente');
        } catch (error) {
            console.error('Error saving template:', error);
            Alert.alert('Error', 'No se pudo guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Eliminar', '¿Estás seguro de eliminar esta plantilla?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar', style: 'destructive', onPress: async () => {
                    try {
                        await deleteDoc(doc(db, 'dietTemplates', id));
                        loadTemplates();
                    } catch (error) {
                        Alert.alert('Error', 'No se pudo eliminar');
                    }
                }
            },
        ]);
    };

    const useDefaultTemplate = (template: Omit<DietTemplate, 'id' | 'createdAt'>) => {
        setName(template.name);
        setDescription(template.description);
        setCalories(template.calories.toString());
        setBreakfast(template.meals.breakfast);
        setSnack1(template.meals.snack1);
        setLunch(template.meals.lunch);
        setSnack2(template.meals.snack2);
        setDinner(template.meals.dinner);
        setShowForm(true);
    };

    const resetForm = () => {
        setShowForm(false);
        setName('');
        setDescription('');
        setCalories('');
        setBreakfast('');
        setSnack1('');
        setLunch('');
        setSnack2('');
        setDinner('');
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
                    <Text style={styles.title}>Plantillas de dieta</Text>

                    {/* Default templates */}
                    <Text style={styles.sectionTitle}>📋 Plantillas predefinidas</Text>
                    {DEFAULT_TEMPLATES.map((template, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.templateCard}
                            onPress={() => useDefaultTemplate(template)}
                        >
                            <Text style={styles.templateName}>{template.name}</Text>
                            <Text style={styles.templateDesc}>{template.description}</Text>
                            <Text style={styles.templateCal}>{template.calories} kcal/día</Text>
                        </TouchableOpacity>
                    ))}

                    {/* User templates */}
                    {templates.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>🗂️ Mis plantillas</Text>
                            {templates.map((template) => (
                                <View key={template.id} style={styles.templateCard}>
                                    <View style={styles.templateHeader}>
                                        <Text style={styles.templateName}>{template.name}</Text>
                                        <TouchableOpacity onPress={() => handleDelete(template.id)}>
                                            <Text style={styles.deleteBtn}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.templateDesc}>{template.description}</Text>
                                    <Text style={styles.templateCal}>{template.calories} kcal/día</Text>
                                </View>
                            ))}
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Form Modal */}
            {showForm && (
                <View style={styles.modalOverlay}>
                    <ScrollView style={styles.modalScroll}>
                        <View style={styles.modal}>
                            <Text style={styles.modalTitle}>Nueva plantilla</Text>

                            <TextInput mode="outlined" label="Nombre*" value={name} onChangeText={setName} style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                            <TextInput mode="outlined" label="Descripción" value={description} onChangeText={setDescription} style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                            <TextInput mode="outlined" label="Calorías totales" value={calories} onChangeText={setCalories} keyboardType="numeric" style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />

                            <Text style={styles.mealsTitle}>🍽️ Comidas</Text>
                            <TextInput mode="outlined" label="🌅 Desayuno" value={breakfast} onChangeText={setBreakfast} multiline style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                            <TextInput mode="outlined" label="🍎 Snack mañana" value={snack1} onChangeText={setSnack1} multiline style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                            <TextInput mode="outlined" label="☀️ Almuerzo" value={lunch} onChangeText={setLunch} multiline style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                            <TextInput mode="outlined" label="🥜 Snack tarde" value={snack2} onChangeText={setSnack2} multiline style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                            <TextInput mode="outlined" label="🌙 Cena" value={dinner} onChangeText={setDinner} multiline style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />

                            <View style={styles.modalActions}>
                                <Button mode="text" onPress={resetForm}>Cancelar</Button>
                                <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} buttonColor={Colors.primary}>
                                    Guardar
                                </Button>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            )}

            <FAB icon="plus" style={styles.fab} onPress={() => setShowForm(true)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    scroll: { flex: 1 },
    scrollContent: { paddingVertical: Spacing.md, paddingBottom: 100 },
    wrapper: { paddingHorizontal: Spacing.md, maxWidth: 500, alignSelf: 'center', width: '100%' },
    title: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
    sectionTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: Spacing.sm },
    templateCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm },
    templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    templateName: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text },
    templateDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
    templateCal: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.medium, marginTop: 4 },
    deleteBtn: { fontSize: 18 },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalScroll: { flex: 1 },
    modal: { backgroundColor: Colors.surface, margin: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.lg },
    modalTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
    input: { backgroundColor: Colors.surface, marginBottom: Spacing.sm },
    mealsTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginTop: Spacing.md, marginBottom: Spacing.sm },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginTop: Spacing.md },
    fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.lg, backgroundColor: Colors.primary },
});
