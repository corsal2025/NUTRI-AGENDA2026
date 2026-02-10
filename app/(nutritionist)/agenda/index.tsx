import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Text, ActivityIndicator, Chip, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { getAppointmentsByNutritionist } from '../../../services/appointment.service';
import { Appointment } from '../../../types/appointment.types';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AgendaScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    updateMarkedDates();
  }, [appointments, selectedDate]);

  const loadAppointments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date();
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      end.setMonth(end.getMonth() + 2); // Load 3 months

      const appointmentsData = await getAppointmentsByNutritionist(user.id, start, end);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMarkedDates = () => {
    const marked: any = {};

    // Mark dates with appointments
    appointments.forEach(apt => {
      const dateStr = format(apt.date, 'yyyy-MM-dd');
      if (!marked[dateStr]) {
        marked[dateStr] = { marked: true, dots: [] };
      }
      
      const color = apt.status === 'scheduled' ? Colors.scheduled :
                    apt.status === 'completed' ? Colors.completed :
                    apt.status === 'cancelled' ? Colors.cancelled :
                    Colors.textSecondary;
      
      marked[dateStr].dots.push({ color });
    });

    // Mark selected date
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = Colors.primary;
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: Colors.primary,
      };
    }

    setMarkedDates(marked);
  };

  const getAppointmentsForDate = (date: string): Appointment[] => {
    return appointments.filter(apt => 
      format(apt.date, 'yyyy-MM-dd') === date
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const selectedAppointments = getAppointmentsForDate(selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return Colors.scheduled;
      case 'completed': return Colors.completed;
      case 'cancelled': return Colors.cancelled;
      default: return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'no-show': return 'No asistió';
      default: return status;
    }
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
      <ScrollView>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            selectedDayBackgroundColor: Colors.primary,
            todayTextColor: Colors.primary,
            arrowColor: Colors.primary,
            monthTextColor: Colors.text,
            textMonthFontWeight: 'bold',
          }}
        />

        <View style={styles.appointmentsContainer}>
          <Text style={styles.dateTitle}>
            {format(new Date(selectedDate), "EEEE, d 'de' MMMM", { locale: es })}
          </Text>

          {selectedAppointments.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No hay citas para este día</Text>
              </Card.Content>
            </Card>
          ) : (
            selectedAppointments.map(apt => (
              <Card key={apt.id} style={styles.appointmentCard}>
                <Card.Content>
                  <View style={styles.appointmentHeader}>
                    <Text style={styles.appointmentTime}>
                      {format(apt.date, 'HH:mm')}
                    </Text>
                    <Chip
                      mode="flat"
                      style={{ backgroundColor: getStatusColor(apt.status) }}
                      textStyle={{ color: Colors.textLight }}
                    >
                      {getStatusText(apt.status)}
                    </Chip>
                  </View>

                  <Text style={styles.clientName}>{apt.clientName}</Text>
                  
                  <View style={styles.durationRow}>
                    <Text style={styles.durationText}>
                      Duración: {apt.duration} minutos
                    </Text>
                  </View>

                  {apt.notes && (
                    <Text style={styles.notesText}>{apt.notes}</Text>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(nutritionist)/appointments/add')}
        label="Nueva Cita"
      />
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
  appointmentsContainer: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
    textTransform: 'capitalize',
  },
  emptyCard: {
    borderRadius: BorderRadius.lg,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  appointmentCard: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  appointmentTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  durationRow: {
    marginTop: Spacing.xs,
  },
  durationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    backgroundColor: Colors.primary,
  },
});
