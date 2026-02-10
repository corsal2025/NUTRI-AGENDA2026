import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSizes } from '@/constants/theme';

export default function ClientLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: Colors.borderLight,
                    height: 56,
                    paddingBottom: 4,
                },
                tabBarLabelStyle: {
                    fontSize: FontSizes.xs,
                },
                headerStyle: {
                    backgroundColor: Colors.surface,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.borderLight,
                },
                headerTintColor: Colors.text,
                headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: FontSizes.lg,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home-outline" size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="appointments"
                options={{
                    title: 'Citas',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="calendar-outline" size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: 'Progreso',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="chart-line" size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="book-appointment"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="orders"
                options={{ href: null }}
            />
        </Tabs>
    );
}
