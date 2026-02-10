import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getClient } from '../../../services/client.service';
import { getMeasurementsByClient } from '../../../services/measurement.service';
import { getAppointmentsByClient } from '../../../services/appointment.service';
import { Client } from '../../../types/client.types';
import { Measurement } from '../../../types/measurement.types';
import { Appointment } from '../../../types/appointment.types';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ClientProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const clientData = await getClient(id);
      setClient(clientData);

      if (clientData) {
        const [measurementsData, appointmentsData] = await Promise.all([
          getMeasurementsByClient(id, 5),
          getAppointmentsByClient(id),
        ]);
        setMeasurements(measurementsData);
        setAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error loading client:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Cliente no encontrado</Text>
        <Button onPress={() => router.back()}>Volver</Button>
      </View>
    );
  }

  const latestMeasurement = measurements[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Personal Info Card */}
      <Card style={styles.card}>
        <Card.Title title="Información Personal" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{client.personalInfo.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{client.personalInfo.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{client.personalInfo.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.value}>{calculateAge(client.personalInfo.birthDate)} años</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Género:</Text>
            <Text style={styles.value}>
              {client.personalInfo.gender === 'male' ? 'Masculino' : 
               client.personalInfo.gender === 'female' ? 'Femenino' : 'Otro'}
            </Text>
          </View>

          {client.personalInfo.address && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{client.personalInfo.address}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Medical History Card */}
      <Card style={styles.card}>
        <Card.Title title="Historial Médico" />
        <Card.Content>
          {client.medicalHistory.allergies.length > 0 && (
            <View style={styles.medicalSection}>
              <Text style={styles.medicalLabel}>Alergias:</Text>
              <View style={styles.chipContainer}>
                {client.medicalHistory.allergies.map((allergy, index) => (
                  <Chip key={index} style={styles.chip} mode="outlined">
                    {allergy}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {client.medicalHistory.medications.length > 0 && (
            <View style={styles.medicalSection}>
              <Text style={styles.medicalLabel}>Medicamentos:</Text>
              <View style={styles.chipContainer}>
                {client.medicalHistory.medications.map((med, index) => (
                  <Chip key={index} style={styles.chip} mode="outlined">
                    {med}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {client.medicalHistory.conditions.length > 0 && (
            <View style={styles.medicalSection}>
              <Text style={styles.medicalLabel}>Condiciones:</Text>
              <View style={styles.chipContainer}>
                {client.medicalHistory.conditions.map((condition, index) => (
                  <Chip key={index} style={styles.chip} mode="outlined">
                    {condition}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {client.medicalHistory.notes && (
            <View style={styles.medicalSection}>
              <Text style={styles.medicalLabel}>Notas:</Text>
              <Text style={styles.notesText}>{client.medicalHistory.notes}</Text>
            </View>
          )}

          {client.medicalHistory.allergies.length === 0 &&
           client.medicalHistory.medications.length === 0 &&
           client.medicalHistory.conditions.length === 0 &&
           !client.medicalHistory.notes && (
            <Text style={styles.emptyText}>Sin información médica registrada</Text>
          )}
        </Card.Content>
      </Card>

      {/* Latest Measurement Card */}
      <Card style={styles.card}>
        <Card.Title title="Última Medición" />
        <Card.Content>
          {latestMeasurement ? (
            <View>
              <View style={styles.measurementGrid}>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementValue}>{latestMeasurement.weight} kg</Text>
                  <Text style={styles.measurementLabel}>Peso</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementValue}>{latestMeasurement.bmi}</Text>
                  <Text style={styles.measurementLabel}>IMC</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementValue}>{latestMeasurement.waist} cm</Text>
                  <Text style={styles.measurementLabel}>Cintura</Text>
                </View>
              </View>
              <Text style={styles.dateText}>
                {format(latestMeasurement.date, "d 'de' MMMM, yyyy", { locale: es })}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>Sin mediciones registradas</Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => router.push(`/(nutritionist)/clients/${id}/add-measurement`)}>
            Nueva Medición
          </Button>
          <Button onPress={() => router.push(`/(shared)/measurements/${id}`)}>
            Ver Historial
          </Button>
        </Card.Actions>
      </Card>

      {/* Appointments Summary */}
      <Card style={styles.card}>
        <Card.Title title="Citas" />
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{appointments.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.scheduled }]}>
                {appointments.filter(a => a.status === 'scheduled').length}
              </Text>
              <Text style={styles.statLabel}>Programadas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.completed }]}>
                {appointments.filter(a => a.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completadas</Text>
            </View>
          </View>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => router.push(`/(nutritionist)/appointments/add?clientId=${id}`)}>
            Nueva Cita
          </Button>
        </Card.Actions>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          icon="pencil"
          onPress={() => router.push(`/(nutritionist)/clients/${id}/edit`)}
          style={styles.actionButton}
        >
          Editar Cliente
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 100,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  medicalSection: {
    marginBottom: Spacing.md,
  },
  medicalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  measurementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  measurementItem: {
    alignItems: 'center',
  },
  measurementValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  measurementLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  actionButtons: {
    marginTop: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
  },
});
