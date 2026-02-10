import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, FAB, ActivityIndicator, Switch } from 'react-native-paper';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import {
    getMedicationReminders,
    createMedicationReminder,
    deleteMedicationReminder,
    toggleReminder,
    MedicationReminder,
    getFrequencyLabel
} from '../../../services/medication.service';

const FREQUENCY_OPTIONS = [
    { value: 'daily', label: '1 vez/día' },
    { value: 'twice_daily', label: '2 veces/día' },
    { value: 'three_times', label: '3 veces/día' },
    { value: 'weekly', label: 'Semanal' },
];

const TIME_OPTIONS = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

export default function MedicationsScreen() {
    const { user } = useAuthContext();
    const [reminders, setReminders] = useState<MedicationReminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState<MedicationReminder['frequency']>('daily');
    const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00']);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        if (!user) return;
        try {
            const data = await getMedicationReminders(user.id);
            setReminders(data);
        } catch (error) {
            console.error('Error loading reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name || !dosage || !user) {
            Alert.alert('Error', 'Por favor completa nombre y dosis');
            return;
        }

        setSaving(true);
        try {
            await createMedicationReminder(
                user.id,
                name,
                dosage,
                frequency,
                selectedTimes,
                new Date(),
                undefined,
                notes
            );

            resetForm();
            loadReminders();
            Alert.alert('✅ Recordatorio creado', 'Recibirás notificaciones según la frecuencia seleccionada');
        } catch (error) {
            console.error('Error saving reminder:', error);
            Alert.alert('Error', 'No se pudo crear el recordatorio');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Eliminar', '¿Eliminar este recordatorio?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar', style: 'destructive', onPress: async () => {
                    const success = await deleteMedicationReminder(id);
                    if (success) loadReminders();
                }
            },
        ]);
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        await toggleReminder(id, isActive);
        loadReminders();
    };

    const toggleTime = (time: string) => {
        setSelectedTimes(prev =>
            prev.includes(time)
                ? prev.filter(t => t !== time)
                : [...prev, time]
        );
    };

    const resetForm = () => {
        setShowForm(false);
        setName('');
        setDosage('');
        setFrequency('daily');
        setSelectedTimes(['08:00']);
        setNotes('');
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
                    <Text style={styles.title}>💊 Medicamentos</Text>
                    <Text style={styles.subtitle}>Recordatorios de suplementos y medicamentos</Text>

                    {reminders.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>💊</Text>
                            <Text style={styles.emptyTitle}>Sin recordatorios</Text>
                            <Text style={styles.emptyText}>Agrega medicamentos o suplementos para recibir recordatorios</Text>
                        </View>
                    ) : (
                        reminders.map((reminder) => (
                            <View key={reminder.id} style={styles.reminderCard}>
                                <View style={styles.reminderHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.reminderName}>{reminder.name}</Text>
                                        <Text style={styles.reminderDosage}>{reminder.dosage}</Text>
                                    </View>
                                    <Switch
                                        value={reminder.isActive}
                                        onValueChange={(value) => handleToggle(reminder.id, value)}
                                        color={Colors.primary}
                                    />
                                </View>
                                <Text style={styles.reminderFreq}>{getFrequencyLabel(reminder.frequency)}</Text>
                                <View style={styles.timesRow}>
                                    {reminder.times.map((time, idx) => (
                                        <View key={idx} style={styles.timeBadge}>
                                            <Text style={styles.timeBadgeText}>{time}</Text>
                                        </View>
                                    ))}
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDelete(reminder.id)}
                                    style={styles.deleteBtn}
                                >
                                    <Text style={styles.deleteText}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Add Form Modal */}
            {showForm && (
                <View style={styles.modalOverlay}>
                    <ScrollView style={styles.modalScroll}>
                        <View style={styles.modal}>
                            <Text style={styles.modalTitle}>Nuevo recordatorio</Text>

                            <TextInput mode="outlined" label="Nombre del medicamento*" value={name} onChangeText={setName} style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                            <TextInput mode="outlined" label="Dosis* (ej: 1 pastilla, 5ml)" value={dosage} onChangeText={setDosage} style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />

                            <Text style={styles.inputLabel}>Frecuencia</Text>
                            <View style={styles.frequencyRow}>
                                {FREQUENCY_OPTIONS.map(opt => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[styles.freqBtn, frequency === opt.value && styles.freqBtnActive]}
                                        onPress={() => setFrequency(opt.value as any)}
                                    >
                                        <Text style={[styles.freqBtnText, frequency === opt.value && styles.freqBtnTextActive]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>Horarios</Text>
                            <View style={styles.timesGrid}>
                                {TIME_OPTIONS.map(time => (
                                    <TouchableOpacity
                                        key={time}
                                        style={[styles.timeBtn, selectedTimes.includes(time) && styles.timeBtnActive]}
                                        onPress={() => toggleTime(time)}
                                    >
                                        <Text style={[styles.timeBtnText, selectedTimes.includes(time) && styles.timeBtnTextActive]}>
                                            {time}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput mode="outlined" label="Notas (opcional)" value={notes} onChangeText={setNotes} multiline style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />

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
    title: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.text },
    subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
    emptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, color: Colors.text },
    emptyText: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center' },
    reminderCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm },
    reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    reminderName: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text },
    reminderDosage: { fontSize: FontSizes.sm, color: Colors.primary },
    reminderFreq: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: Spacing.xs },
    timesRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm },
    timeBadge: { backgroundColor: Colors.primarySoft, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.xs },
    timeBadgeText: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: FontWeights.medium },
    deleteBtn: { marginTop: Spacing.sm },
    deleteText: { fontSize: FontSizes.sm, color: Colors.error },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalScroll: { flex: 1 },
    modal: { backgroundColor: Colors.surface, margin: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.lg },
    modalTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
    input: { backgroundColor: Colors.surface, marginBottom: Spacing.sm },
    inputLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.sm },
    frequencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
    freqBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border },
    freqBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    freqBtnText: { fontSize: FontSizes.sm, color: Colors.text },
    freqBtnTextActive: { color: Colors.textLight },
    timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
    timeBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border },
    timeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    timeBtnText: { fontSize: FontSizes.sm, color: Colors.text },
    timeBtnTextActive: { color: Colors.textLight },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginTop: Spacing.md },
    fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.lg, backgroundColor: Colors.primary },
});
