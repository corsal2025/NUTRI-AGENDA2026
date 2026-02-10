import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSizes } from '@/constants/theme';

export default function NutritionistLayout() {
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
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="home-outline" size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="clients"
                options={{
                    title: 'Clientes',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account-group-outline" size={22} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="agenda"
                options={{
                    title: 'Agenda',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="calendar-outline" size={22} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="appointments"
                options={{ href: null }}
            />
        </Tabs>
    );
}
