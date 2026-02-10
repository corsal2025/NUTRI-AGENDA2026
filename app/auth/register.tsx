import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { register } from '../../services/auth.service';
import { UserRole } from '../../types/auth.types';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, phone, password, role });
      router.replace('/auth/login');
    } catch (err: any) {
      // Smart error handling: auto-redirect if email exists
      if (err.message?.includes('email-already-in-use')) {
        setError('✅ Email ya registrado. Redirigiendo a login...');
        setTimeout(() => {
          router.replace('/auth/login');
        }, 1500);
      } else {
        setError(err.message || 'Error al registrar');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wrapper}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>🥗</Text>
              <Text style={styles.title}>Crear cuenta</Text>
              <Text style={styles.subtitle}>Únete a NutriAgenda</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                label="Nombre completo"
                value={name}
                onChangeText={setName}
                mode="outlined"
                autoCapitalize="words"
                style={styles.input}
                outlineColor={Colors.inputBorder}
                activeOutlineColor={Colors.primary}
                textColor={Colors.inputText}
                left={<TextInput.Icon icon="account" color={Colors.textMuted} />}
              />

              <TextInput
                label="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                outlineColor={Colors.inputBorder}
                activeOutlineColor={Colors.primary}
                textColor={Colors.inputText}
                left={<TextInput.Icon icon="email" color={Colors.textMuted} />}
              />

              <TextInput
                label="Teléfono"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                outlineColor={Colors.inputBorder}
                activeOutlineColor={Colors.primary}
                textColor={Colors.inputText}
                left={<TextInput.Icon icon="phone" color={Colors.textMuted} />}
              />

              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                outlineColor={Colors.inputBorder}
                activeOutlineColor={Colors.primary}
                textColor={Colors.inputText}
                left={<TextInput.Icon icon="lock" color={Colors.textMuted} />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                    color={Colors.textMuted}
                  />
                }
              />

              <TextInput
                label="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                outlineColor={Colors.inputBorder}
                activeOutlineColor={Colors.primary}
                textColor={Colors.inputText}
                left={<TextInput.Icon icon="lock-check" color={Colors.textMuted} />}
              />

              <Text style={styles.roleLabel}>Tipo de cuenta</Text>
              <SegmentedButtons
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
                buttons={[
                  { value: 'client', label: 'Cliente', icon: 'account' },
                  { value: 'nutritionist', label: 'Nutricionista', icon: 'doctor' },
                ]}
                style={styles.segment}
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.btn}
                contentStyle={styles.btnContent}
                labelStyle={styles.btnLabel}
                buttonColor={Colors.primary}
              >
                Registrarse
              </Button>

              <Button
                mode="text"
                onPress={() => router.back()}
                style={styles.link}
                textColor={Colors.primary}
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  wrapper: {
    paddingHorizontal: Spacing.lg,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logo: {
    fontSize: 40,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.inputBackground,
  },
  roleLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  segment: {
    marginBottom: Spacing.md,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  btn: {
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  btnContent: {
    height: 50,
  },
  btnLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  link: {
    marginTop: Spacing.md,
  },
});
