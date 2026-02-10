import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Redirect } from 'expo-router';
import { useAuthContext } from '../contexts/AuthContext';
import { Colors, Spacing } from '@/constants/theme';

export default function Index() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  // Redirect based on role
  if (user.role === 'nutritionist') {
    return <Redirect href="/(nutritionist)/dashboard" />;
  } else {
    return <Redirect href="/(client)/dashboard" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.textSecondary,
  },
});
