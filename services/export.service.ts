// Excel export service for nutritionist data
import { Alert, Share, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ExportData {
    clients?: any[];
    measurements?: any[];
    appointments?: any[];
}

// Convert data to CSV format
const convertToCSV = (data: any[], headers: string[]): string => {
    const headerRow = headers.join(',');
    const dataRows = data.map(item =>
        headers.map(header => {
            const value = item[header];
            // Handle special characters and commas
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',')
    );
    return [headerRow, ...dataRows].join('\n');
};

// Export clients to CSV
export const exportClientsToCSV = async (clients: any[]): Promise<void> => {
    try {
        const headers = ['nombre', 'email', 'telefono', 'genero', 'fechaNacimiento', 'fechaRegistro'];
        const data = clients.map(c => ({
            nombre: c.personalInfo?.name || c.name,
            email: c.personalInfo?.email || c.email,
            telefono: c.personalInfo?.phone || c.phone,
            genero: c.personalInfo?.gender || '',
            fechaNacimiento: c.personalInfo?.birthDate ? new Date(c.personalInfo.birthDate).toLocaleDateString() : '',
            fechaRegistro: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
        }));

        const csv = convertToCSV(data, headers);
        await saveAndShareCSV(csv, 'clientes_nutriagenda.csv');
    } catch (error) {
        console.error('Error exporting clients:', error);
        Alert.alert('Error', 'No se pudo exportar los datos');
    }
};

// Export measurements to CSV
export const exportMeasurementsToCSV = async (measurements: any[], clientName: string): Promise<void> => {
    try {
        const headers = ['fecha', 'peso', 'altura', 'imc', 'grasaCorporal', 'masaMagra', 'cintura', 'cadera', 'metabolismoBasal'];
        const data = measurements.map(m => ({
            fecha: m.date ? new Date(m.date).toLocaleDateString() : '',
            peso: m.weight,
            altura: m.height,
            imc: m.bmi?.toFixed(1) || '',
            grasaCorporal: m.bodyFat?.toFixed(1) || '',
            masaMagra: m.leanMass?.toFixed(1) || '',
            cintura: m.waist || '',
            cadera: m.hip || '',
            metabolismoBasal: Math.round(m.basalMetabolism || 0),
        }));

        const csv = convertToCSV(data, headers);
        const filename = `mediciones_${clientName.replace(/\s+/g, '_')}.csv`;
        await saveAndShareCSV(csv, filename);
    } catch (error) {
        console.error('Error exporting measurements:', error);
        Alert.alert('Error', 'No se pudo exportar los datos');
    }
};

// Export appointments to CSV
export const exportAppointmentsToCSV = async (appointments: any[]): Promise<void> => {
    try {
        const headers = ['fecha', 'hora', 'cliente', 'estado', 'duracion', 'notas'];
        const data = appointments.map(a => ({
            fecha: a.date ? new Date(a.date).toLocaleDateString() : '',
            hora: a.date ? new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            cliente: a.clientName,
            estado: a.status,
            duracion: `${a.duration || 60} min`,
            notas: a.notes || '',
        }));

        const csv = convertToCSV(data, headers);
        await saveAndShareCSV(csv, 'citas_nutriagenda.csv');
    } catch (error) {
        console.error('Error exporting appointments:', error);
        Alert.alert('Error', 'No se pudo exportar los datos');
    }
};

// Save CSV file and share it
const saveAndShareCSV = async (csvContent: string, filename: string): Promise<void> => {
    try {
        const fileUri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Exportar datos',
                UTI: 'public.comma-separated-values-text',
            });
        } else {
            // Fallback for web
            if (Platform.OS === 'web') {
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                link.click();
            } else {
                Alert.alert('Guardado', `Archivo guardado en: ${fileUri}`);
            }
        }
    } catch (error) {
        console.error('Error saving CSV:', error);
        throw error;
    }
};

// Generate full report
export const generateFullReport = async (data: ExportData): Promise<void> => {
    try {
        let reportContent = 'REPORTE NUTRIAGENDA\n';
        reportContent += `Fecha: ${new Date().toLocaleDateString()}\n\n`;

        if (data.clients?.length) {
            reportContent += `CLIENTES (${data.clients.length})\n`;
            reportContent += '-'.repeat(40) + '\n';
            data.clients.forEach(c => {
                reportContent += `• ${c.personalInfo?.name || c.name} - ${c.personalInfo?.email || c.email}\n`;
            });
            reportContent += '\n';
        }

        if (data.appointments?.length) {
            reportContent += `CITAS (${data.appointments.length})\n`;
            reportContent += '-'.repeat(40) + '\n';
            data.appointments.forEach(a => {
                reportContent += `• ${new Date(a.date).toLocaleDateString()} - ${a.clientName} (${a.status})\n`;
            });
        }

        await saveAndShareCSV(reportContent, 'reporte_nutriagenda.txt');
    } catch (error) {
        console.error('Error generating report:', error);
        Alert.alert('Error', 'No se pudo generar el reporte');
    }
};
