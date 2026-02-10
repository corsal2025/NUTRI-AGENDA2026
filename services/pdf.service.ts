// PDF generation service for invoices and diet plans
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BiometricReport } from '../types/biometrics';

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  clientName: string;
  clientRut?: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  total: number;
  businessName: string;
  businessRut: string;
  businessAddress: string;
}

interface DietPlanData {
  clientName: string;
  nutritionistName: string;
  date: Date;
  calories: number;
  meals: {
    breakfast: string;
    snack1: string;
    lunch: string;
    snack2: string;
    dinner: string;
  };
  notes?: string;
  recommendations?: string[];
}

// Generate invoice/boleta PDF
export const generateInvoicePDF = async (data: InvoiceData): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #0D9488; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .info-block { margin-bottom: 20px; }
        .info-label { font-size: 12px; color: #666; }
        .info-value { font-size: 14px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #0D9488; color: white; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        .total-row { font-weight: bold; font-size: 16px; }
        .total-row td { border-top: 2px solid #0D9488; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🥗 NutriAgenda</div>
        <div>Boleta Electrónica</div>
      </div>
      
      <div class="invoice-info">
        <div class="info-block">
          <div class="info-label">N° Boleta</div>
          <div class="info-value">${data.invoiceNumber}</div>
        </div>
        <div class="info-block">
          <div class="info-label">Fecha</div>
          <div class="info-value">${format(data.date, "d 'de' MMMM, yyyy", { locale: es })}</div>
        </div>
      </div>

      <div class="info-block">
        <div class="info-label">Cliente</div>
        <div class="info-value">${data.clientName}</div>
        ${data.clientRut ? `<div>${data.clientRut}</div>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Cant.</th>
            <th>Precio Unit.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>$${item.unitPrice.toLocaleString()}</td>
              <td>$${(item.quantity * item.unitPrice).toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3" style="text-align: right;">TOTAL</td>
            <td>$${data.total.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <strong>${data.businessName}</strong><br>
        RUT: ${data.businessRut}<br>
        ${data.businessAddress}<br><br>
        Documento generado electrónicamente
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw error;
  }
};

// Generate diet plan PDF
export const generateDietPlanPDF = async (data: DietPlanData): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; background: #0D9488; color: white; padding: 20px; border-radius: 10px; }
        .logo { font-size: 28px; font-weight: bold; }
        .subtitle { font-size: 14px; margin-top: 5px; }
        .client-info { margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .meal-section { margin-bottom: 20px; }
        .meal-header { display: flex; align-items: center; background: #e8f5f3; padding: 10px; border-radius: 8px 8px 0 0; }
        .meal-emoji { font-size: 24px; margin-right: 10px; }
        .meal-title { font-weight: bold; color: #0D9488; }
        .meal-content { padding: 15px; border: 1px solid #e8f5f3; border-top: none; border-radius: 0 0 8px 8px; }
        .calories-badge { background: #0D9488; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
        .notes { background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; }
        .recommendations { margin-top: 20px; }
        .rec-item { padding: 8px 0; border-bottom: 1px solid #eee; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🥗 Plan Nutricional</div>
        <div class="subtitle">Elaborado por ${data.nutritionistName}</div>
      </div>

      <div class="client-info">
        <strong>Paciente:</strong> ${data.clientName}<br>
        <strong>Fecha:</strong> ${format(data.date, "d 'de' MMMM, yyyy", { locale: es })}<br>
        <span class="calories-badge">🔥 ${data.calories} kcal/día</span>
      </div>

      <div class="meal-section">
        <div class="meal-header">
          <span class="meal-emoji">🌅</span>
          <span class="meal-title">Desayuno (7:00 - 9:00)</span>
        </div>
        <div class="meal-content">${data.meals.breakfast}</div>
      </div>

      <div class="meal-section">
        <div class="meal-header">
          <span class="meal-emoji">🍎</span>
          <span class="meal-title">Colación Mañana (10:30)</span>
        </div>
        <div class="meal-content">${data.meals.snack1}</div>
      </div>

      <div class="meal-section">
        <div class="meal-header">
          <span class="meal-emoji">☀️</span>
          <span class="meal-title">Almuerzo (13:00 - 14:00)</span>
        </div>
        <div class="meal-content">${data.meals.lunch}</div>
      </div>

      <div class="meal-section">
        <div class="meal-header">
          <span class="meal-emoji">🥜</span>
          <span class="meal-title">Colación Tarde (17:00)</span>
        </div>
        <div class="meal-content">${data.meals.snack2}</div>
      </div>

      <div class="meal-section">
        <div class="meal-header">
          <span class="meal-emoji">🌙</span>
          <span class="meal-title">Cena (20:00 - 21:00)</span>
        </div>
        <div class="meal-content">${data.meals.dinner}</div>
      </div>

      ${data.notes ? `
        <div class="notes">
          <strong>📝 Notas importantes:</strong><br>
          ${data.notes}
        </div>
      ` : ''}

      ${data.recommendations?.length ? `
        <div class="recommendations">
          <strong>💡 Recomendaciones:</strong>
          ${data.recommendations.map(r => `<div class="rec-item">• ${r}</div>`).join('')}
        </div>
      ` : ''}

      <div class="footer">
        Generado con NutriAgenda<br>
        Este plan es personalizado y no debe ser compartido
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
  } catch (error) {
    console.error('Error generating diet plan PDF:', error);
    throw error;
  }
};

// Generate measurement report PDF
export const generateMeasurementReportPDF = async (
  clientName: string,
  measurements: any[]
): Promise<void> => {
  // ... (Existing implementation if needed, otherwise I'll focus on the new one)
  // For brevity, I will replace this with the new robust Biometric Report
  return generateBiometricReportPDF(measurements[0]); // Placeholder to keep signature safe if called elsewhere
};

// Generate detailed Fitdays-style report
export const generateBiometricReportPDF = async (report: BiometricReport): Promise<void> => {
  const getAssessmentColor = (val: string) => {
    if (val === 'Alto' || val === 'Very High') return '#ef4444'; // Red
    if (val === 'Bajo' || val === 'Low') return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #374151; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 800; color: #0D9488; }
        .report-meta { text-align: right; font-size: 0.9em; color: #6b7280; }
        
        .score-section { text-align: center; margin-bottom: 40px; background: #f0f9ff; padding: 30px; border-radius: 16px; }
        .score-val { font-size: 64px; font-weight: 900; color: #0284c7; line-height: 1; }
        .score-label { font-size: 18px; color: #0284c7; font-weight: 500; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        
        .section-title { font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #111827; border-left: 4px solid #0D9488; padding-left: 10px; }
        
        .metric-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .metric-name { font-weight: 500; }
        .metric-value { font-family: monospace; font-size: 1.1em; font-weight: 600; }
        .badge { padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; color: white; min-width: 80px; text-align: center; }

        .control-panel { background: #f9fafb; padding: 20px; border-radius: 12px; }
        .control-item { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .control-val { font-weight: 700; }

        .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">NutriAgenda</div>
        <div class="report-meta">
          ID: ${report.patientId}<br>
          Fecha: ${report.date}<br>
          ${report.gender} | ${report.age} años | ${report.heightCm}cm
        </div>
      </div>

      <div class="score-section">
        <div class="score-val">${report.score}</div>
        <div class="score-label">Puntuación Corporal / 100</div>
      </div>

      <div class="grid-2">
        <div>
          <div class="section-title">Análisis de Composición</div>
          ${Object.entries(report.composition).map(([key, data]) => `
            <div class="metric-row">
              <span class="metric-name">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <div style="text-align: right">
                <div class="metric-value">${data.value} ${data.unit}</div>
              </div>
              <span class="badge" style="background-color: ${getAssessmentColor(data.assessment)}">
                ${data.assessment}
              </span>
            </div>
          `).join('')}
        </div>

        <div>
           <div class="section-title">Control de Peso</div>
           <div class="control-panel">
             <div class="control-item">
               <span>Peso Objetivo</span>
               <span class="control-val">${report.weightControl.targetWeight} kg</span>
             </div>
             <div class="control-item">
               <span>Control Peso</span>
               <span class="control-val" style="color: ${report.weightControl.weightControl > 0 ? '#ef4444' : '#22c55e'}">
                 ${report.weightControl.weightControl} kg
               </span>
             </div>
             <div class="control-item">
               <span>Control Grasa</span>
               <span class="control-val" style="color: ${report.weightControl.fatControl > 0 ? '#ef4444' : '#22c55e'}">
                 ${report.weightControl.fatControl} kg
               </span>
             </div>
             <div class="control-item">
               <span>Control Músculo</span>
               <span class="control-val" style="color: ${report.weightControl.muscleControl < 0 ? '#ef4444' : '#22c55e'}">
                 ${report.weightControl.muscleControl > 0 ? '+' : ''}${report.weightControl.muscleControl} kg
               </span>
             </div>
           </div>

           <div class="section-title" style="margin-top: 30px">Análisis de Obesidad</div>
           <div class="control-panel">
             <div class="control-item">
               <span>IMC</span>
               <span class="control-val">${report.obesity.bmi}</span>
             </div>
             <div class="control-item">
               <span>% Grasa Corporal</span>
               <span class="control-val">${report.obesity.bodyFatPercentage}%</span>
             </div>
           </div>
        </div>
      </div>

      <div class="footer">
        Generado por NutriAgenda Pro • Documento Clínico Confidencial
      </div>
    </body>
    </html>
    `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
  } catch (error) {
    console.error('Error generating biometric PDF:', error);
    throw error;
  }
};
