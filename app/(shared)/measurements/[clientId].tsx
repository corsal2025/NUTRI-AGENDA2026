import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors, Spacing } from '@/constants/theme';

export default function MeasurementsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Historial de Mediciones</Text>
            <Text style={styles.subtitle}>Próximamente...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: Spacing.lg,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
    },
});
