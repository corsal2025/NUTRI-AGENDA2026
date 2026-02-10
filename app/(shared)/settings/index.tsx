import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text, Switch, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { signOut } from 'firebase/auth';
import { auth } from '../../../services/firebase';

export default function SettingsScreen() {
    const router = useRouter();
    const { user } = useAuthContext();
    const { isDarkMode, toggleTheme } = useTheme();

    const handleLogout = () => {
        Alert.alert('Cerrar sesión', '¿Estás seguro?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Cerrar sesión', style: 'destructive', onPress: async () => {
                    try {
                        await signOut(auth);
                        router.replace('/auth/login');
                    } catch (error) {
                        Alert.alert('Error', 'No se pudo cerrar sesión');
                    }
                }
            },
        ]);
    };

    const openLink = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.wrapper}>
                {/* Profile section */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || '?'}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.name}</Text>
                        <Text style={styles.profileEmail}>{user?.email}</Text>
                        <Text style={styles.profileRole}>
                            {user?.role === 'nutritionist' ? '👩‍⚕️ Nutricionista' : '👤 Cliente'}
                        </Text>
                    </View>
                </View>

                {/* Appearance */}
                <Text style={styles.sectionTitle}>🎨 Apariencia</Text>
                <View style={styles.settingCard}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Modo oscuro</Text>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            color={Colors.primary}
                        />
                    </View>
                </View>

                {/* Account */}
                <Text style={styles.sectionTitle}>👤 Cuenta</Text>
                <View style={styles.settingCard}>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => router.push('/(shared)/payments')}
                    >
                        <Text style={styles.settingLabel}>💳 Historial de pagos</Text>
                        <Text style={styles.settingArrow}>→</Text>
                    </TouchableOpacity>
                    <Divider style={styles.divider} />
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => router.push('/(shared)/chat')}
                    >
                        <Text style={styles.settingLabel}>💬 Mensajes</Text>
                        <Text style={styles.settingArrow}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Support */}
                <Text style={styles.sectionTitle}>ℹ️ Soporte</Text>
                <View style={styles.settingCard}>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => openLink('https://wa.me/56912345678')}
                    >
                        <Text style={styles.settingLabel}>📱 Contactar soporte</Text>
                        <Text style={styles.settingArrow}>→</Text>
                    </TouchableOpacity>
                    <Divider style={styles.divider} />
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => Alert.alert('NutriAgenda', 'Versión 1.0.0\n\n© 2026 NutriAgenda')}
                    >
                        <Text style={styles.settingLabel}>📋 Acerca de</Text>
                        <Text style={styles.settingValue}>v1.0.0</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingVertical: Spacing.md },
    wrapper: { paddingHorizontal: Spacing.md, maxWidth: 500, alignSelf: 'center', width: '100%' },
    profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.sm },
    avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
    avatarText: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.textLight },
    profileInfo: { flex: 1 },
    profileName: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, color: Colors.text },
    profileEmail: { fontSize: FontSizes.sm, color: Colors.textSecondary },
    profileRole: { fontSize: FontSizes.sm, color: Colors.primary, marginTop: 2 },
    sectionTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: Spacing.sm },
    settingCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, marginBottom: Spacing.lg, ...Shadows.sm },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
    settingLabel: { fontSize: FontSizes.md, color: Colors.text },
    settingValue: { fontSize: FontSizes.sm, color: Colors.textMuted },
    settingArrow: { fontSize: FontSizes.md, color: Colors.textMuted },
    divider: { backgroundColor: Colors.border },
    logoutBtn: { backgroundColor: Colors.error, borderRadius: BorderRadius.sm, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.md },
    logoutText: { color: Colors.textLight, fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
});
