import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createMeasurement } from '../../../../services/measurement.service';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';

export default function AddMeasurementScreen() {
    const router = useRouter();
    const { id: clientId } = useLocalSearchParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [waist, setWaist] = useState('');
    const [hip, setHip] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [muscleMass, setMuscleMass] = useState('');
    const [notes, setNotes] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            setError('Se necesita permiso para acceder a las fotos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newPhotos = result.assets.map(asset => asset.uri);
            setPhotos([...photos, ...newPhotos]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setError('');

        // Validation
        if (!weight || !height || !waist || !hip) {
            setError('Por favor completa los campos obligatorios');
            return;
        }

        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height);
        const waistNum = parseFloat(waist);
        const hipNum = parseFloat(hip);

        if (isNaN(weightNum) || isNaN(heightNum) || isNaN(waistNum) || isNaN(hipNum)) {
            setError('Por favor ingresa valores numéricos válidos');
            return;
        }

        setLoading(true);

        try {
            await createMeasurement({
                clientId: clientId!,
                weight: weightNum,
                height: heightNum,
                waist: waistNum,
                hip: hipNum,
                bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
                muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
                notes,
                photos,
            });

            router.back();
        } catch (err: any) {
            setError(err.message || 'Error al crear medición');
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
                    <Text style={styles.sectionTitle}>Nueva Medición</Text>

                    <TextInput
                        label="Peso (kg) *"
                        value={weight}
                        onChangeText={setWeight}
                        mode="outlined"
                        keyboardType="decimal-pad"
                        style={styles.input}
                        error={!!error && !weight}
                    />

                    <TextInput
                        label="Altura (cm) *"
                        value={height}
                        onChangeText={setHeight}
                        mode="outlined"
                        keyboardType="decimal-pad"
                        style={styles.input}
                        error={!!error && !height}
                    />

                    <TextInput
                        label="Circunferencia de cintura (cm) *"
                        value={waist}
                        onChangeText={setWaist}
                        mode="outlined"
                        keyboardType="decimal-pad"
                        style={styles.input}
                        error={!!error && !waist}
                    />

                    <TextInput
                        label="Circunferencia de cadera (cm) *"
                        value={hip}
                        onChangeText={setHip}
                        mode="outlined"
                        keyboardType="decimal-pad"
                        style={styles.input}
                        error={!!error && !hip}
                    />

                    <TextInput
                        label="Porcentaje de grasa corporal (%)"
                        value={bodyFat}
                        onChangeText={setBodyFat}
                        mode="outlined"
                        keyboardType="decimal-pad"
                        style={styles.input}
                    />

                    <TextInput
                        label="Masa muscular (kg)"
                        value={muscleMass}
                        onChangeText={setMuscleMass}
                        mode="outlined"
                        keyboardType="decimal-pad"
                        style={styles.input}
                    />

                    <TextInput
                        label="Notas"
                        value={notes}
                        onChangeText={setNotes}
                        mode="outlined"
                        style={styles.input}
                        multiline
                        numberOfLines={4}
                    />

                    <Button
                        mode="outlined"
                        icon="camera"
                        onPress={pickImage}
                        style={styles.photoButton}
                    >
                        Agregar Fotos de Progreso
                    </Button>

                    {photos.length > 0 && (
                        <View style={styles.photosContainer}>
                            <Text style={styles.photosLabel}>Fotos seleccionadas: {photos.length}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {photos.map((photo, index) => (
                                    <View key={index} style={styles.photoWrapper}>
                                        <Image source={{ uri: photo }} style={styles.photo} />
                                        <Button
                                            mode="text"
                                            onPress={() => removePhoto(index)}
                                            compact
                                        >
                                            Eliminar
                                        </Button>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

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
                        Guardar Medición
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
    input: {
        marginBottom: Spacing.md,
    },
    photoButton: {
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    photosContainer: {
        marginBottom: Spacing.lg,
    },
    photosLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    photoWrapper: {
        marginRight: Spacing.md,
        alignItems: 'center',
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xs,
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
