import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function AgendaLayout() {
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
          title: 'Agenda',
        }}
      />
    </Stack>
  );
}
