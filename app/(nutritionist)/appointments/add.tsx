import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, SegmentedButtons } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { createAppointment } from '../../../services/appointment.service';
import { getClientsByNutritionist } from '../../../services/client.service';
import { Client } from '../../../types/client.types';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Picker } from '@react-native-picker/picker';

export default function AddAppointmentScreen() {
    const router = useRouter();
    const { clientId } = useLocalSearchParams<{ clientId?: string }>();
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [loadingClients, setLoadingClients] = useState(true);
    const [error, setError] = useState('');
    const [clients, setClients] = useState<Client[]>([]);

    const [selectedClientId, setSelectedClientId] = useState(clientId || '');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState<number>(60);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        if (!user) return;

        try {
            setLoadingClients(true);
            const clientsData = await getClientsByNutritionist(user.id);
            setClients(clientsData);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoadingClients(false);
        }
    };

    const handleSubmit = async () => {
        setError('');

        // Validation
        if (!selectedClientId || !date || !time) {
            setError('Por favor completa todos los campos obligatorios');
            return;
        }

        // Parse date (DD/MM/YYYY)
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const dateMatch = date.match(dateRegex);
        if (!dateMatch) {
            setError('Fecha inválida. Usa formato DD/MM/YYYY');
            return;
        }

        // Parse time (HH:MM)
        const timeRegex = /^(\d{2}):(\d{2})$/;
        const timeMatch = time.match(timeRegex);
        if (!timeMatch) {
            setError('Hora inválida. Usa formato HH:MM');
            return;
        }

        const [, day, month, year] = dateMatch;
        const [, hours, minutes] = timeMatch;

        const appointmentDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours),
            parseInt(minutes)
        );

        if (isNaN(appointmentDate.getTime())) {
            setError('Fecha u hora inválida');
            return;
        }

        setLoading(true);

        try {
            await createAppointment(user!.id, {
                clientId: selectedClientId,
                date: appointmentDate,
                duration,
                notes,
            });

            router.back();
        } catch (err: any) {
            setError(err.message || 'Error al crear cita');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Nueva Cita</Text>

                    <Text style={styles.fieldLabel}>Cliente *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedClientId}
                            onValueChange={setSelectedClientId}
                            enabled={!loadingClients}
                        >
                            <Picker.Item label="Seleccionar cliente..." value="" />
                            {clients.map(client => (
                                <Picker.Item
                                    key={client.id}
                                    label={client.personalInfo.name}
                                    value={client.id}
                                />
                            ))}
                        </Picker>
                    </View>

                    <TextInput
                        label="Fecha (DD/MM/YYYY) *"
                        value={date}
                        onChangeText={setDate}
                        mode="outlined"
                        placeholder="16/01/2026"
                        keyboardType="numeric"
                        style={styles.input}
                        error={!!error && !date}
                    />

                    <TextInput
                        label="Hora (HH:MM) *"
                        value={time}
                        onChangeText={setTime}
                        mode="outlined"
                        placeholder="14:30"
                        keyboardType="numeric"
                        style={styles.input}
                        error={!!error && !time}
                    />

                    <Text style={styles.fieldLabel}>Duración</Text>
                    <SegmentedButtons
                        value={duration.toString()}
                        onValueChange={(value) => setDuration(parseInt(value))}
                        buttons={[
                            { value: '30', label: '30 min' },
                            { value: '60', label: '1 hora' },
                            { value: '90', label: '1.5 hrs' },
                        ]}
                        style={styles.segmentedButtons}
                    />

                    <TextInput
                        label="Notas (opcional)"
                        value={notes}
                        onChangeText={setNotes}
                        mode="outlined"
                        style={styles.input}
                        multiline
                        numberOfLines={4}
                    />

                    {error ? (
                        <HelperText type="error" visible={!!error}>
                            {error}
                        </HelperText>
                    ) : null}

                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading || loadingClients}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Crear Cita
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={() => router.back()}
                        disabled={loading}
                        style={styles.cancelButton}
                    >
                        Cancelar
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.lg,
    },
    fieldLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        marginTop: Spacing.sm,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.md,
        backgroundColor: Colors.surface,
    },
    input: {
        marginBottom: Spacing.md,
    },
    segmentedButtons: {
        marginBottom: Spacing.md,
    },
    button: {
        marginTop: Spacing.lg,
        borderRadius: BorderRadius.md,
    },
    buttonContent: {
        paddingVertical: Spacing.sm,
    },
    cancelButton: {
        marginTop: Spacing.md,
        borderRadius: BorderRadius.md,
    },
});
