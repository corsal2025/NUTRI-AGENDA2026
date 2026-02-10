import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { createClient } from '../../../services/client.service';
import { register } from '../../../services/auth.service';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { CreateClientData } from '../../../types/client.types';

export default function AddClientScreen() {
    const router = useRouter();
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Personal Info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
    const [address, setAddress] = useState('');

    // Medical History
    const [allergies, setAllergies] = useState('');
    const [medications, setMedications] = useState('');
    const [conditions, setConditions] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async () => {
        setError('');

        // Validation
        if (!name || !email || !phone || !birthDate) {
            setError('Por favor completa los campos obligatorios');
            return;
        }

        // Validate date format (DD/MM/YYYY)
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = birthDate.match(dateRegex);
        if (!match) {
            setError('Fecha de nacimiento inválida. Usa formato DD/MM/YYYY');
            return;
        }

        const [, day, month, year] = match;
        const birthDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        if (isNaN(birthDateObj.getTime())) {
            setError('Fecha de nacimiento inválida');
            return;
        }

        setLoading(true);

        try {
            // First, create user account for the client
            const tempPassword = Math.random().toString(36).slice(-8);
            const newUser = await register({
                name,
                email,
                phone,
                password: tempPassword,
                role: 'client',
            });

            // Then create client profile
            const clientData: CreateClientData = {
                personalInfo: {
                    name,
                    email,
                    phone,
                    birthDate: birthDateObj,
                    gender,
                    address: address || undefined,
                },
                medicalHistory: {
                    allergies: allergies ? allergies.split(',').map(a => a.trim()) : [],
                    medications: medications ? medications.split(',').map(m => m.trim()) : [],
                    conditions: conditions ? conditions.split(',').map(c => c.trim()) : [],
                    notes,
                },
            };

            await createClient(user!.id, newUser.id, clientData);

            // Success - navigate back
            router.back();
        } catch (err: any) {
            setError(err.message || 'Error al crear cliente');
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
                    {/* Personal Information Section */}
                    <Text style={styles.sectionTitle}>Información Personal</Text>

                    <TextInput
                        label="Nombre completo *"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        style={styles.input}
                        error={!!error && !name}
                    />

                    <TextInput
                        label="Email *"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                        error={!!error && !email}
                    />

                    <TextInput
                        label="Teléfono *"
                        value={phone}
                        onChangeText={setPhone}
                        mode="outlined"
                        keyboardType="phone-pad"
                        style={styles.input}
                        error={!!error && !phone}
                    />

                    <TextInput
                        label="Fecha de Nacimiento (DD/MM/YYYY) *"
                        value={birthDate}
                        onChangeText={setBirthDate}
                        mode="outlined"
                        placeholder="01/01/1990"
                        keyboardType="numeric"
                        style={styles.input}
                        error={!!error && !birthDate}
                    />

                    <Text style={styles.fieldLabel}>Género</Text>
                    <SegmentedButtons
                        value={gender}
                        onValueChange={(value) => setGender(value as any)}
                        buttons={[
                            { value: 'female', label: 'Femenino' },
                            { value: 'male', label: 'Masculino' },
                            { value: 'other', label: 'Otro' },
                        ]}
                        style={styles.segmentedButtons}
                    />

                    <TextInput
                        label="Dirección (opcional)"
                        value={address}
                        onChangeText={setAddress}
                        mode="outlined"
                        style={styles.input}
                        multiline
                        numberOfLines={2}
                    />

                    {/* Medical History Section */}
                    <Text style={styles.sectionTitle}>Historial Médico</Text>

                    <TextInput
                        label="Alergias (separadas por coma)"
                        value={allergies}
                        onChangeText={setAllergies}
                        mode="outlined"
                        style={styles.input}
                        placeholder="Ej: Nueces, Lactosa"
                        multiline
                    />

                    <TextInput
                        label="Medicamentos (separados por coma)"
                        value={medications}
                        onChangeText={setMedications}
                        mode="outlined"
                        style={styles.input}
                        placeholder="Ej: Aspirina, Vitamina D"
                        multiline
                    />

                    <TextInput
                        label="Condiciones médicas (separadas por coma)"
                        value={conditions}
                        onChangeText={setConditions}
                        mode="outlined"
                        style={styles.input}
                        placeholder="Ej: Diabetes, Hipertensión"
                        multiline
                    />

                    <TextInput
                        label="Notas adicionales"
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
                        disabled={loading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Crear Cliente
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
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: Spacing.lg,
        marginBottom: Spacing.md,
    },
    input: {
        marginBottom: Spacing.md,
    },
    fieldLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        marginTop: Spacing.sm,
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
