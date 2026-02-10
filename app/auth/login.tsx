import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Image, Dimensions, TouchableOpacity, ImageBackground } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { login } from '../../services/auth.service';
import { Colors, Shadows, Spacing, BorderRadius, FontSizes } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const user = await login({ email, password });
            if (user.role === 'nutritionist') {
                router.replace('/(nutritionist)/dashboard');
            } else {
                router.replace('/(client)/dashboard');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/tech_bg.png')}
            style={styles.container}
            resizeMode="cover"
        >
            <View style={styles.overlay} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={true}
                    indicatorStyle="white"
                >
                    <View style={styles.wrapper}>
                        {/* Logo 3D Floating */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.5, rotate: '-10deg' }}
                            animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
                            transition={{ type: 'spring', damping: 10 }}
                            style={styles.logoWrapper}
                        >
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../../assets/icon.png')}
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.brand}>NutriAgenda</Text>
                            <Text style={styles.tagline}>Bio-Tech Nutrition</Text>
                        </MotiView>

                        {/* Tech Glass Card */}
                        <MotiView
                            from={{ opacity: 0, translateY: 100 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 200, type: 'timing', duration: 800 }}
                            style={styles.glassCard}
                        >
                            <Text style={styles.formTitle}>Acceso Biométrico</Text>

                            <View style={styles.inputWrapper}>
                                <TextInput
                                    label="ID Usuario"
                                    value={email}
                                    onChangeText={setEmail}
                                    mode="flat"
                                    style={styles.input}
                                    underlineColor="transparent"
                                    activeUnderlineColor={Colors.primary}
                                    textColor={Colors.white}
                                    theme={{ colors: { placeholder: Colors.textMuted, background: 'rgba(0,0,0,0.3)', text: Colors.white, primary: Colors.primary } }}
                                    left={<TextInput.Icon icon="account" color={Colors.primary} />}
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <TextInput
                                    label="Clave de Acceso"
                                    value={password}
                                    onChangeText={setPassword}
                                    mode="flat"
                                    secureTextEntry={!showPassword}
                                    style={styles.input}
                                    underlineColor="transparent"
                                    activeUnderlineColor={Colors.primary}
                                    textColor={Colors.white}
                                    theme={{ colors: { placeholder: Colors.textMuted, background: 'rgba(0,0,0,0.3)', text: Colors.white, primary: Colors.primary } }}
                                    left={<TextInput.Icon icon="lock" color={Colors.primary} />}
                                    right={
                                        <TextInput.Icon
                                            icon={showPassword ? 'eye-off' : 'eye'}
                                            onPress={() => setShowPassword(!showPassword)}
                                            color={Colors.textMuted}
                                        />
                                    }
                                />
                            </View>

                            <MotiView
                                from={{ scale: 1 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' }}
                            >
                                <Button
                                    mode="contained"
                                    onPress={handleLogin}
                                    loading={loading}
                                    disabled={loading}
                                    style={styles.loginBtn}
                                    contentStyle={styles.btnContent}
                                    labelStyle={styles.btnLabel}
                                >
                                    CONECTAR
                                </Button>
                            </MotiView>

                            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
                                <Text style={styles.forgotPassword}>Recuperar Credenciales</Text>
                            </TouchableOpacity>
                        </MotiView>

                        {/* Register Link */}
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 600 }}
                            style={styles.footer}
                        >
                            <Text style={styles.footerText}>¿Nuevo Miembro?</Text>
                            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                                <Text style={styles.registerLink}>Iniciar Protocolo</Text>
                            </TouchableOpacity>
                        </MotiView>
                    </View>
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
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
    },
    flex: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    wrapper: {
        paddingHorizontal: 24,
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
    },
    logoWrapper: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: Colors.primary,
        ...Shadows.strong,
    },
    logoImage: {
        width: 70,
        height: 70,
    },
    brand: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.white,
        letterSpacing: 1,
        textShadowColor: Colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    tagline: {
        fontSize: 14,
        color: Colors.accent,
        marginTop: 4,
        letterSpacing: 4,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    glassCard: {
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        borderRadius: 24,
        padding: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...Shadows.medium,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 24,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    inputWrapper: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    loginBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        marginTop: 24,
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        ...Shadows.strong,
    },
    btnContent: {
        height: 56,
    },
    btnLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    forgotPassword: {
        textAlign: 'center',
        color: Colors.textMuted,
        fontSize: 12,
        marginTop: 24,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        color: Colors.grey200,
        fontSize: 14,
        marginBottom: 8,
    },
    registerLink: {
        color: Colors.accent,
        fontWeight: 'bold',
        fontSize: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textShadowColor: Colors.accent,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
});
