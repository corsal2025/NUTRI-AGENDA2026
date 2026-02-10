import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';

interface FoodEntry {
    id: string;
    meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    description: string;
    calories?: number;
    photoUri?: string;
    time: Date;
}

const MEAL_TYPES = [
    { key: 'breakfast', label: 'Desayuno', emoji: '🌅', time: '7:00 - 10:00' },
    { key: 'lunch', label: 'Almuerzo', emoji: '☀️', time: '12:00 - 15:00' },
    { key: 'dinner', label: 'Cena', emoji: '🌙', time: '19:00 - 22:00' },
    { key: 'snack', label: 'Snack', emoji: '🍎', time: 'Cualquier hora' },
];

export default function FoodDiaryScreen() {
    const { user } = useAuthContext();
    const [entries, setEntries] = useState<FoodEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<string>('');
    const [description, setDescription] = useState('');
    const [calories, setCalories] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [selectedDate] = useState(new Date());

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        if (!user) return;
        try {
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            const q = query(
                collection(db, 'foodEntries'),
                where('userId', '==', user.id),
                where('time', '>=', Timestamp.fromDate(startOfDay)),
                where('time', '<=', Timestamp.fromDate(endOfDay)),
                orderBy('time', 'asc')
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                time: doc.data().time?.toDate() || new Date(),
            })) as FoodEntry[];
            setEntries(data);
        } catch (error) {
            console.error('Error loading entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!selectedMeal || !description || !user) {
            Alert.alert('Error', 'Por favor completa la comida y descripción');
            return;
        }

        setSaving(true);
        try {
            await addDoc(collection(db, 'foodEntries'), {
                userId: user.id,
                meal: selectedMeal,
                description,
                calories: calories ? parseInt(calories) : null,
                photoUri,
                time: Timestamp.now(),
                createdAt: Timestamp.now(),
            });

            setShowForm(false);
            setSelectedMeal('');
            setDescription('');
            setCalories('');
            setPhotoUri(null);
            loadEntries();
        } catch (error) {
            console.error('Error saving entry:', error);
            Alert.alert('Error', 'No se pudo guardar');
        } finally {
            setSaving(false);
        }
    };

    const getTotalCalories = () => {
        return entries.reduce((sum, e) => sum + (e.calories || 0), 0);
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
                    <View style={styles.header}>
                        <Text style={styles.title}>Diario alimenticio</Text>
                        <Text style={styles.date}>
                            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                        </Text>
                    </View>

                    {/* Summary */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{entries.length}</Text>
                            <Text style={styles.summaryLabel}>Comidas</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{getTotalCalories()}</Text>
                            <Text style={styles.summaryLabel}>Calorías</Text>
                        </View>
                    </View>

                    {/* Entries by meal */}
                    {MEAL_TYPES.map((meal) => {
                        const mealEntries = entries.filter(e => e.meal === meal.key);
                        return (
                            <View key={meal.key} style={styles.mealSection}>
                                <View style={styles.mealHeader}>
                                    <Text style={styles.mealEmoji}>{meal.emoji}</Text>
                                    <View>
                                        <Text style={styles.mealTitle}>{meal.label}</Text>
                                        <Text style={styles.mealTime}>{meal.time}</Text>
                                    </View>
                                </View>

                                {mealEntries.length === 0 ? (
                                    <Text style={styles.noEntry}>Sin registro</Text>
                                ) : (
                                    mealEntries.map((entry) => (
                                        <View key={entry.id} style={styles.entryCard}>
                                            {entry.photoUri && (
                                                <Image source={{ uri: entry.photoUri }} style={styles.entryPhoto} />
                                            )}
                                            <Text style={styles.entryDesc}>{entry.description}</Text>
                                            {entry.calories && (
                                                <Text style={styles.entryCal}>{entry.calories} kcal</Text>
                                            )}
                                            <Text style={styles.entryTime}>
                                                {format(entry.time, 'HH:mm')}
                                            </Text>
                                        </View>
                                    ))
                                )}
                            </View>
                        );
                    })}

                    {/* Add button */}
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => setShowForm(true)}
                    >
                        <Text style={styles.addBtnText}>+ Agregar comida</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Add Form Modal */}
            {showForm && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Nueva entrada</Text>

                        {/* Meal type selection */}
                        <View style={styles.mealButtons}>
                            {MEAL_TYPES.map((meal) => (
                                <TouchableOpacity
                                    key={meal.key}
                                    style={[
                                        styles.mealBtn,
                                        selectedMeal === meal.key && styles.mealBtnActive
                                    ]}
                                    onPress={() => setSelectedMeal(meal.key)}
                                >
                                    <Text style={styles.mealBtnEmoji}>{meal.emoji}</Text>
                                    <Text style={[
                                        styles.mealBtnText,
                                        selectedMeal === meal.key && styles.mealBtnTextActive
                                    ]}>
                                        {meal.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            mode="outlined"
                            label="¿Qué comiste?"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            style={styles.modalInput}
                            outlineColor={Colors.inputBorder}
                            activeOutlineColor={Colors.primary}
                            textColor={Colors.inputText}
                        />

                        <TextInput
                            mode="outlined"
                            label="Calorías (opcional)"
                            value={calories}
                            onChangeText={setCalories}
                            keyboardType="numeric"
                            style={styles.modalInput}
                            outlineColor={Colors.inputBorder}
                            activeOutlineColor={Colors.primary}
                            textColor={Colors.inputText}
                        />

                        {/* Photo buttons */}
                        <View style={styles.photoButtons}>
                            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                                <Text style={styles.photoBtnText}>📷 Cámara</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                                <Text style={styles.photoBtnText}>🖼️ Galería</Text>
                            </TouchableOpacity>
                        </View>

                        {photoUri && (
                            <Image source={{ uri: photoUri }} style={styles.previewPhoto} />
                        )}

                        <View style={styles.modalActions}>
                            <Button mode="text" onPress={() => setShowForm(false)}>
                                Cancelar
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleSave}
                                loading={saving}
                                disabled={saving}
                                buttonColor={Colors.primary}
                            >
                                Guardar
                            </Button>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    scroll: { flex: 1 },
    scrollContent: { paddingVertical: Spacing.md },
    wrapper: { paddingHorizontal: Spacing.md, maxWidth: 500, alignSelf: 'center', width: '100%' },
    header: { marginBottom: Spacing.md },
    title: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.text },
    date: { fontSize: FontSizes.sm, color: Colors.textSecondary, textTransform: 'capitalize' },
    summaryCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.sm },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryDivider: { width: 1, backgroundColor: Colors.border },
    summaryValue: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.primary },
    summaryLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
    mealSection: { marginBottom: Spacing.md },
    mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
    mealEmoji: { fontSize: 24, marginRight: Spacing.sm },
    mealTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text },
    mealTime: { fontSize: FontSizes.xs, color: Colors.textMuted },
    noEntry: { fontSize: FontSizes.sm, color: Colors.textMuted, fontStyle: 'italic', marginLeft: 36 },
    entryCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.sm, padding: Spacing.sm, marginLeft: 36, marginTop: Spacing.xs, ...Shadows.sm },
    entryPhoto: { width: '100%', height: 120, borderRadius: BorderRadius.xs, marginBottom: Spacing.xs },
    entryDesc: { fontSize: FontSizes.sm, color: Colors.text },
    entryCal: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: FontWeights.medium },
    entryTime: { fontSize: FontSizes.xs, color: Colors.textMuted },
    addBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.sm, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.md },
    addBtnText: { color: Colors.textLight, fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.md },
    modal: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, maxWidth: 400, alignSelf: 'center', width: '100%' },
    modalTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
    mealButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
    mealBtn: { alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, flex: 1, marginHorizontal: 2 },
    mealBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    mealBtnEmoji: { fontSize: 20 },
    mealBtnText: { fontSize: FontSizes.xs, color: Colors.text, marginTop: 2 },
    mealBtnTextActive: { color: Colors.textLight },
    modalInput: { backgroundColor: Colors.surface, marginBottom: Spacing.sm },
    photoButtons: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
    photoBtn: { flex: 1, padding: Spacing.sm, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
    photoBtnText: { fontSize: FontSizes.sm, color: Colors.text },
    previewPhoto: { width: '100%', height: 150, borderRadius: BorderRadius.sm, marginBottom: Spacing.md },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
});
