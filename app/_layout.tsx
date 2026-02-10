import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../contexts/AuthContext';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.textLight,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: 'Iniciar Sesión', headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ title: 'Registrarse', headerShown: false }} />
          <Stack.Screen name="(nutritionist)" options={{ headerShown: false }} />
          <Stack.Screen name="(client)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  );
}
