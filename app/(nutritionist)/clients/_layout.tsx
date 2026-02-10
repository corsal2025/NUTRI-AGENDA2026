import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function ClientsLayout() {
  return (
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
      <Stack.Screen
        name="index"
        options={{
          title: 'Clientes',
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Agregar Cliente',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Perfil del Cliente',
        }}
      />
    </Stack>
  );
}
