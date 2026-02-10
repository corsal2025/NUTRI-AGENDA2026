import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../contexts/AuthContext';
import { signOut } from '../../services/auth.service';
import { getClientsByNutritionist } from '../../services/client.service';
import { getAppointmentsByNutritionist } from '../../services/appointment.service';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { isToday } from 'date-fns';

export default function NutritionistDashboard() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const clients = await getClientsByNutritionist(user.id);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const appointments = await getAppointmentsByNutritionist(user.id, today, nextWeek);
      const todayAppts = appointments.filter(apt => isToday(apt.date));
      setStats({
        totalClients: clients.length,
        todayAppointments: todayAppts.length,
        upcomingAppointments: appointments.length,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Hola, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.subtitle}>Panel de control</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statValue}>{stats.totalClients}</Text>
              <Text style={styles.statLabel}>Clientes</Text>
            </View>
            <View style={[styles.statCard, styles.statCardAccent]}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statValue}>{stats.todayAppointments}</Text>
              <Text style={styles.statLabel}>Hoy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🗓️</Text>
              <Text style={styles.statValue}>{stats.upcomingAppointments}</Text>
              <Text style={styles.statLabel}>Próximas</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones rápidas</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCardPrimary}
                onPress={() => router.push('/(nutritionist)/clients/add')}
              >
                <Text style={styles.actionIconLight}>➕</Text>
                <Text style={styles.actionLabelLight}>Nuevo cliente</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/(nutritionist)/appointments/add')}
              >
                <Text style={styles.actionIcon}>📅</Text>
                <Text style={styles.actionLabel}>Nueva cita</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Navigation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gestión</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(nutritionist)/clients')}
            >
              <Text style={styles.menuIcon}>👥</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Clientes</Text>
                <Text style={styles.menuDesc}>{stats.totalClients} registrados</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(nutritionist)/agenda')}
            >
              <Text style={styles.menuIcon}>📆</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Agenda</Text>
                <Text style={styles.menuDesc}>Ver calendario</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.md,
  },
  wrapper: {
    paddingHorizontal: Spacing.md,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statCardAccent: {
    backgroundColor: Colors.primarySoft,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  actionCardPrimary: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  actionIconLight: {
    fontSize: 22,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: FontWeights.medium,
  },
  actionLabelLight: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    fontWeight: FontWeights.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.text,
  },
  menuDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  menuArrow: {
    fontSize: 24,
    color: Colors.textMuted,
  },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
});
