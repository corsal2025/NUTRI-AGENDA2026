import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ImageBackground } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useAuthContext } from '../../contexts/AuthContext';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '../../constants/theme';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Text } from 'react-native-paper';

LocaleConfig.locales['es'] = {
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

const AVAILABLE_TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export default function BookAppointmentScreen() {
    const router = useRouter();
    const { user } = useAuthContext();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const getTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getDate30DaysAhead = () => {
        const future = new Date();
        future.setDate(future.getDate() + 30);
        return future.toISOString().split('T')[0];
    };

    const handleDayPress = (day: any) => {
        setSelectedDate(day.dateString);
        setSelectedTime(null);
    };

    const formatDateDisplay = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
    };

    const handleBook = async () => {
        if (!selectedDate || !selectedTime || !user) {
            Alert.alert('Error', 'Por favor selecciona fecha y hora');
            return;
        }

        setLoading(true);
        try {
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const appointmentDate = new Date(selectedDate + 'T00:00:00');
            appointmentDate.setHours(hours, minutes, 0, 0);

            await addDoc(collection(db, 'appointments'), {
                clientId: user.id,
                clientName: user.name,
                clientEmail: user.email,
                date: Timestamp.fromDate(appointmentDate),
                status: 'scheduled',
                notes: notes,
                createdAt: Timestamp.now(),
            });

            Alert.alert(
                '¡Cita Confirmada! ✅',
                `Tu sesión para el ${formatDateDisplay(selectedDate)} a las ${selectedTime} ha sido reservada.\n\nLa verás reflejada en tu Dashboard inmediatamente.`,
                [{
                    text: 'Ir al Dashboard',
                    onPress: () => router.push('/(client)/dashboard')
                }]
            );
        } catch (error) {
            console.error('Error booking appointment:', error);
            Alert.alert('Error', 'No se pudo agendar la cita. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const markedDates = selectedDate ? {
        [selectedDate]: {
            selected: true,
            selectedColor: Colors.accent,
            selectedTextColor: '#ffffff',
        }
    } : {};

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
                    {/* Header */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring' }}
                        style={styles.header}
                    >
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Text style={styles.backButtonText}>← REGRESAR</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>SINCRONIZAR AGENDA</Text>
                        <Text style={styles.subtitle}>Selecciona tu ventana temporal</Text>
                    </MotiView>

                    {/* Calendar Hologram - Agenda Pro */}
                    <MotiView
                        from={{ translateY: 50, opacity: 0 }}
                        animate={{ translateY: 0, opacity: 1 }}
                        transition={{ delay: 200, type: 'spring' }}
                        style={styles.card3D}
                    >
                        <Calendar
                            minDate={getTomorrow()}
                            maxDate={getDate30DaysAhead()}
                            onDayPress={handleDayPress}
                            markedDates={markedDates}
                            firstDay={1} // Lunes start
                            renderHeader={(date) => {
                                const headerDate = new Date(date);
                                const monthName = headerDate.toLocaleString('es-ES', { month: 'long' });
                                const year = headerDate.getFullYear();
                                return (
                                    <View style={styles.customHeader}>
                                        <Text style={styles.customHeaderTitle}>
                                            {monthName.toUpperCase()} <Text style={styles.customHeaderYear}>{year}</Text>
                                        </Text>
                                    </View>
                                );
                            }}
                            dayComponent={({ date, state, marking }) => {
                                if (!date) return <View />;
                                const isSelected = marking?.selected;
                                const isToday = state === 'today';
                                const isDisabled = state === 'disabled';

                                return (
                                    <TouchableOpacity
                                        onPress={() => !isDisabled && handleDayPress(date)}
                                        activeOpacity={0.7}
                                    >
                                        <MotiView
                                            animate={{
                                                scale: isSelected ? 1.0 : 1, // Start small pop
                                                backgroundColor: isSelected ? Colors.accent : 'transparent',
                                                borderColor: isSelected ? Colors.accent : (isToday ? Colors.primary : 'transparent'),
                                                borderWidth: isSelected || isToday ? 1 : 0,
                                            }}
                                            transition={{ type: 'spring', damping: 15 }}
                                            style={[
                                                styles.customDay,
                                                isSelected && styles.customDaySelected
                                            ]}
                                        >
                                            <Text style={[
                                                styles.customDayText,
                                                isSelected && { color: Colors.background, fontWeight: 'bold' },
                                                isDisabled && { color: 'rgba(255,255,255,0.1)' },
                                                isToday && !isSelected && { color: Colors.primary }
                                            ]}>
                                                {date.day}
                                            </Text>

                                            {/* Neon Dot Indicator */}
                                            {isSelected && (
                                                <MotiView
                                                    from={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    style={styles.neonDot}
                                                />
                                            )}
                                        </MotiView>
                                    </TouchableOpacity>
                                );
                            }}
                            theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textSectionTitleColor: Colors.textMuted,
                                selectedDayBackgroundColor: Colors.accent,
                                selectedDayTextColor: '#000000',
                                todayTextColor: Colors.primary,
                                dayTextColor: Colors.white,
                                textDisabledColor: 'rgba(255,255,255,0.2)',
                                dotColor: Colors.primary,
                                selectedDotColor: '#000000',
                                arrowColor: Colors.accent,
                                monthTextColor: Colors.white,
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '600',
                                textDayHeaderFontSize: 12,
                                "stylesheet.calendar.header": {
                                    header: {
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        paddingLeft: 10,
                                        paddingRight: 10,
                                        marginTop: 10,
                                        alignItems: 'center',
                                        marginBottom: 20
                                    }
                                }
                            }}
                            enableSwipeMonths={true}
                        />
                    </MotiView>

                    {/* Time Selection */}
                    {selectedDate && (
                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            style={styles.section}
                        >
                            <Text style={styles.sectionTitle}>BLOQUES DISPONIBLES</Text>
                            <Text style={styles.selectedDateText}>{formatDateDisplay(selectedDate)}</Text>

                            <View style={styles.timesGrid}>
                                {AVAILABLE_TIMES.map((time, index) => {
                                    const isSelected = selectedTime === time;
                                    return (
                                        <MotiView
                                            key={time}
                                            from={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 50 }}
                                        >
                                            <TouchableOpacity
                                                style={[
                                                    styles.timeCard,
                                                    isSelected && styles.timeCardSelected
                                                ]}
                                                onPress={() => setSelectedTime(time)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.timeText,
                                                    isSelected && styles.timeTextSelected
                                                ]}>
                                                    {time}
                                                </Text>
                                            </TouchableOpacity>
                                        </MotiView>
                                    );
                                })}
                            </View>
                        </MotiView>
                    )}

                    {/* Notes & Action */}
                    {selectedTime && (
                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            style={styles.section}
                        >
                            <View style={styles.cardInput}>
                                <Text style={styles.label}>NOTAS DEL PACIENTE</Text>
                                <TextInput
                                    placeholder="Ingresa detalles de la consulta..."
                                    placeholderTextColor={Colors.textMuted}
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                    style={styles.notesInput}
                                    activeUnderlineColor={Colors.accent}
                                    underlineColor="transparent"
                                    textColor={Colors.white}
                                    theme={{ colors: { placeholder: Colors.textMuted, background: 'rgba(0,0,0,0.3)', text: Colors.white, primary: Colors.accent } }}
                                />
                            </View>

                            <Button
                                mode="contained"
                                onPress={handleBook}
                                loading={loading}
                                disabled={loading}
                                style={styles.bookBtn}
                                contentStyle={styles.bookBtnContent}
                                labelStyle={styles.bookBtnLabel}
                            >
                                CONFIRMAR RESERVA
                            </Button>
                        </MotiView>
                    )}
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
        backgroundColor: 'rgba(2, 6, 23, 0.85)',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 32,
        paddingBottom: 100,
    },
    wrapper: {
        paddingHorizontal: 20,
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        padding: 8,
    },
    backButtonText: {
        color: Colors.accent,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
        marginTop: 10,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textMuted,
        marginTop: 4,
    },
    card3D: {
        backgroundColor: '#0F172A', // Solid Dark Background (No Transparency)
        borderRadius: BorderRadius.lg,
        padding: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...Shadows.medium,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 2,
    },
    selectedDateText: {
        fontSize: 16,
        color: Colors.accent,
        marginBottom: 16,
        marginLeft: 4,
        fontWeight: '600',
    },
    timesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    timeCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        minWidth: 80,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    timeCardSelected: {
        backgroundColor: Colors.accent,
        borderColor: Colors.accent,
        transform: [{ scale: 1.05 }],
        ...Shadows.strong, // Neon glow
    },
    timeText: {
        fontSize: 16,
        color: Colors.white,
        fontWeight: '600',
    },
    timeTextSelected: {
        color: '#000', // Black text on neon green for high contrast
    },
    // Custom Calendar Styles
    customDay: {
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        margin: 2,
    },
    customDaySelected: {
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    customDayText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '500',
    },
    neonDot: {
        position: 'absolute',
        bottom: 5,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.white,
        shadowColor: Colors.white,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    customHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },
    customHeaderTitle: {
        color: Colors.white,
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    customHeaderYear: {
        color: Colors.accent,
        fontWeight: '300',
    },
    cardInput: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: BorderRadius.md,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 24,
    },
    label: {
        color: Colors.textMuted,
        fontSize: 12,
        marginBottom: 10,
        fontWeight: '600',
        letterSpacing: 1,
    },
    notesInput: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
        height: 80,
    },
    bookBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        ...Shadows.strong,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    bookBtnContent: {
        height: 56,
    },
    bookBtnLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
        letterSpacing: 2,
    },
});
