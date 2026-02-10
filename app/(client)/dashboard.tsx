import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useAuthContext } from '../../contexts/AuthContext';
import { signOut } from '../../services/auth.service';
import { Colors, Shadows, Spacing, BorderRadius } from '../../constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function ClientDashboard() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [nextAppointment, setNextAppointment] = useState<any>(null);

  React.useEffect(() => {
    const fetchNextAppointment = async () => {
      if (!user?.id) return;
      try {
        const q = query(
          collection(db, 'appointments'),
          where('clientId', '==', user.id),
          where('status', '==', 'scheduled'),
          // orderBy('date', 'asc'), // Requires index, skipping for now to avoid error
          // limit(1)
        );
        const snapshot = await getDocs(q);

        // Manual sort since we might lack index
        const appointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate() // Convert Timestamp to Date
        })).sort((a: any, b: any) => a.date - b.date);

        if (appointments.length > 0) {
          // Filter only future appointments
          const now = new Date();
          const future = appointments.find((appt: any) => appt.date > now);
          setNextAppointment(future || null);
        }
      } catch (error) {
        console.error('Error fetching appointment:', error);
      }
    };

    fetchNextAppointment();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  const HologramCard = ({ icon, value, label, delay, color }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: delay }}
      style={[styles.hologramCard, { borderColor: color, shadowColor: color }]}
    >
      <MotiView
        from={{ opacity: 0.3, scale: 1 }}
        animate={{ opacity: 0.6, scale: 1.1 }}
        transition={{
          loop: true,
          type: 'timing',
          duration: 2500,
          repeatReverse: true
        }}
        style={[styles.halo, { backgroundColor: color }]}
      />
      <Text style={[styles.hologramIcon, { color: color }]}>{icon}</Text>
      <Text style={styles.hologramValue}>{value}</Text>
      <Text style={styles.hologramLabel}>{label}</Text>
    </MotiView>
  );

  const TechAction = ({ icon, label, onPress, delay, color }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
      <MotiView
        from={{ translateX: -50, opacity: 0 }}
        animate={{ translateX: 0, opacity: 1, scale: isPressed ? 0.96 : 1 }}
        transition={{ delay: delay, type: 'spring' }}
      >
        <TouchableOpacity
          style={styles.techAction}
          onPress={onPress}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          activeOpacity={1}
        >
          <LinearGradient
            colors={isPressed ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']}
            style={styles.techActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MotiView
              animate={{
                backgroundColor: isPressed ? color + '40' : color + '20',
                borderColor: isPressed ? color : color + '80'
              }}
              style={[styles.techIconBox]}
            >
              <Text style={styles.techIcon}>{icon}</Text>
            </MotiView>
            <Text style={[styles.techLabel, isPressed && { color: Colors.white }]}>{label}</Text>
            <Text style={[styles.techArrow, isPressed && { transform: [{ translateX: 5 }] }]}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/nutrition_bg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
      >
        <View style={styles.wrapper}>
          {/* HUD Header */}
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.header}
          >
            <View>
              <Text style={styles.hudLabel}>USUARIO ACTIVO</Text>
              <Text style={styles.greeting}>{user?.name?.toUpperCase()}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <View style={styles.avatarHull}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
              </View>
            </TouchableOpacity>
          </MotiView>

          {/* Holographic Metrics */}
          <Text style={styles.sectionTitle}>METRICAS EN VIVO</Text>
          <View style={styles.metricsRow}>
            <HologramCard icon="⚡" value="1,240" label="KCAL" delay={100} color={Colors.warning} />
            <HologramCard icon="💧" value="1.2L" label="H2O" delay={200} color={Colors.info} />
            <HologramCard icon="⚖️" value="72kg" label="PESO" delay={300} color={Colors.accent} />
          </View>

          {/* Next Mission */}
          <MotiView
            from={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 400, type: 'spring' }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>PRÓXIMA SESIÓN</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/(client)/book-appointment')}
              style={styles.missionCard}
            >
              <LinearGradient
                colors={[Colors.primary + '90', Colors.primary + '40']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.missionGradient}
              >
                <View style={styles.missionContent}>
                  {nextAppointment ? (
                    <>
                      <Text style={styles.cardTextWhite}>
                        {format(nextAppointment.date, "EEEE, d MMM", { locale: es })}
                      </Text>
                      <Text style={styles.cardHighlightWhite}>
                        {format(nextAppointment.date, 'HH:mm')}
                      </Text>
                    </>
                  ) : (
                    <>
                      <View>
                        <Text style={styles.missionTitle}>SINCRONIZAR AGENDA</Text>
                        <Text style={styles.missionSubtitle}>Conectar con especialista.</Text>
                      </View>
                      <View style={styles.missionIconContainer}>
                        <Text style={styles.missionIcon}>📅</Text>
                      </View>
                    </>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>

          {/* Command Center */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CENTRO DE COMANDO</Text>
            <View style={styles.actionsList}>
              <TechAction
                icon="🛒"
                label="MARKETPLACE"
                onPress={() => router.push('/(shared)/shop')}
                delay={500}
                color={Colors.primary}
              />
              <TechAction
                icon="📦"
                label="MIS PEDIDOS"
                onPress={() => router.push('/(client)/orders')}
                delay={600}
                color={Colors.accent}
              />
              <TechAction
                icon="📈"
                label="ANÁLISIS DE PROGRESO"
                onPress={() => router.push('/(client)/progress')}
                delay={700}
                color={Colors.warning}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>DESCONECTAR SISTEMA</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.85)', // Darker overlay for content readability
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 40,
    paddingBottom: 100,
  },
  wrapper: {
    paddingHorizontal: 20,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 20,
  },
  hudLabel: {
    color: Colors.accent,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    letterSpacing: 1,
  },
  avatarHull: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
    ...Shadows.strong,
  },
  avatarText: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 16,
    marginLeft: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 40,
  },
  hologramCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  halo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },
  hologramIcon: {
    fontSize: 24,
    marginBottom: 8,
    marginTop: 8,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  hologramValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  hologramLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 40,
  },
  missionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary,
    ...Shadows.medium,
  },
  missionGradient: {
    padding: 24,
  },
  missionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
    letterSpacing: 1,
  },
  missionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  missionIconContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  missionIcon: {
    fontSize: 20,
  },
  actionsList: {
    gap: 12,
  },
  techAction: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  techActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  techIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
  },
  techIcon: {
    fontSize: 18,
  },
  techLabel: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  techArrow: {
    color: Colors.textMuted,
    fontSize: 20,
  },
  logoutBtn: {
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  logoutText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cardTextWhite: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  cardHighlightWhite: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  }
});
