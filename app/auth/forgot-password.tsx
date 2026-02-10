import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true);
        } catch (error: any) {
            let message = 'Error al enviar el correo';
            if (error.code === 'auth/user-not-found') {
                message = 'No existe una cuenta con este correo';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Correo electrónico inválido';
            }
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.icon}>📧</Text>
                    <Text style={styles.title}>Revisa tu correo</Text>
                    <Text style={styles.message}>
                        Hemos enviado un enlace para restablecer tu contraseña a:
                    </Text>
                    <Text style={styles.email}>{email}</Text>
                    <Text style={styles.hint}>
                        Si no ves el correo, revisa tu carpeta de spam
                    </Text>
                    <Button
                        mode="contained"
                        onPress={() => router.replace('/auth/login')}
                        style={styles.button}
                        buttonColor={Colors.primary}
                    >
                        Volver al inicio
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>🔐</Text>
                <Text style={styles.title}>Recuperar contraseña</Text>
                <Text style={styles.subtitle}>
                    Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
                </Text>

                <TextInput
                    mode="outlined"
                    label="Correo electrónico"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    outlineColor={Colors.inputBorder}
                    activeOutlineColor={Colors.primary}
                    textColor={Colors.inputText}
                    left={<TextInput.Icon icon="email" color={Colors.textMuted} />}
                />

                <Button
                    mode="contained"
                    onPress={handleResetPassword}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    buttonColor={Colors.primary}
                >
                    Enviar enlace
                </Button>

                <TouchableOpacity
                    style={styles.backLink}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backText}>← Volver al inicio de sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: Spacing.lg,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    icon: {
        fontSize: 48,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.xs,
        marginBottom: Spacing.lg,
    },
    input: {
        backgroundColor: Colors.surface,
        marginBottom: Spacing.md,
    },
    button: {
        borderRadius: BorderRadius.sm,
    },
    buttonContent: {
        height: 50,
    },
    backLink: {
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    backText: {
        color: Colors.primary,
        fontSize: FontSizes.sm,
    },
    message: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.md,
    },
    email: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.semibold,
        color: Colors.primary,
        textAlign: 'center',
        marginTop: Spacing.xs,
    },
    hint: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: Spacing.lg,
        marginBottom: Spacing.lg,
    },
});
