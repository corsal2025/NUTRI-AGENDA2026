import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function AppointmentsLayout() {
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
                name="add"
                options={{
                    title: 'Nueva Cita',
                    presentation: 'modal',
                }}
            />
        </Stack>
    );
}
