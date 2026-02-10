// Mercado Pago integration service
import { Alert, Linking } from 'react-native';

// Mercado Pago credentials (replace with real ones)
const MP_PUBLIC_KEY = 'APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
const MP_ACCESS_TOKEN = 'APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx';

// Payment configuration
export const PAYMENT_CONFIG = {
    consultationPrice: 25000,
    currency: 'CLP',
    bankDetails: {
        bank: 'Banco Estado',
        accountType: 'Cuenta Vista',
        accountNumber: '12345678',
        rut: '12.345.678-9',
        name: 'NutriAgenda',
        email: 'pagos@nutriagenda.cl',
    },
    whatsapp: '+56912345678',
};

interface PaymentItem {
    title: string;
    quantity: number;
    unit_price: number;
}

interface CreatePreferenceResponse {
    id: string;
    init_point: string;
    sandbox_init_point: string;
}

// Create Mercado Pago preference (checkout link)
export const createPaymentPreference = async (
    items: PaymentItem[],
    payerEmail: string,
    externalReference: string
): Promise<CreatePreferenceResponse | null> => {
    try {
        const preference = {
            items: items.map(item => ({
                title: item.title,
                quantity: item.quantity,
                unit_price: item.unit_price,
                currency_id: PAYMENT_CONFIG.currency,
            })),
            payer: {
                email: payerEmail,
            },
            external_reference: externalReference,
            back_urls: {
                success: 'nutriagenda://payment/success',
                failure: 'nutriagenda://payment/failure',
                pending: 'nutriagenda://payment/pending',
            },
            auto_return: 'approved',
            notification_url: 'https://your-server.com/webhooks/mercadopago',
        };

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preference),
        });

        if (!response.ok) {
            throw new Error('Error creating preference');
        }

        return await response.json();
    } catch (error) {
        console.error('Mercado Pago error:', error);
        return null;
    }
};

// Open Mercado Pago checkout
export const openMercadoPagoCheckout = async (
    items: PaymentItem[],
    payerEmail: string,
    orderId: string
): Promise<boolean> => {
    try {
        const preference = await createPaymentPreference(items, payerEmail, orderId);

        if (preference?.init_point) {
            const canOpen = await Linking.canOpenURL(preference.init_point);
            if (canOpen) {
                await Linking.openURL(preference.init_point);
                return true;
            }
        }

        // Fallback to bank transfer
        showBankTransferAlert(items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0));
        return false;
    } catch (error) {
        console.error('Error opening checkout:', error);
        showBankTransferAlert(items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0));
        return false;
    }
};

// Show bank transfer details
export const showBankTransferAlert = (amount: number): void => {
    const { bank, accountType, accountNumber, rut, name, email } = PAYMENT_CONFIG.bankDetails;

    Alert.alert(
        'Datos para transferencia',
        `Banco: ${bank}\nTipo: ${accountType}\nN° Cuenta: ${accountNumber}\nRUT: ${rut}\nNombre: ${name}\nMonto: $${amount.toLocaleString()}\n\nEnvía comprobante a:\n${email}\n\nO por WhatsApp:\n${PAYMENT_CONFIG.whatsapp}`,
        [
            { text: 'Copiar datos', onPress: () => copyBankDetails(amount) },
            { text: 'WhatsApp', onPress: () => openWhatsApp(amount) },
            { text: 'OK' },
        ]
    );
};

// Copy bank details to clipboard (simplified)
const copyBankDetails = (amount: number): void => {
    const { bank, accountNumber, rut, name } = PAYMENT_CONFIG.bankDetails;
    const text = `${bank} | ${accountNumber} | ${rut} | ${name} | $${amount.toLocaleString()}`;
    // In a real app, use Clipboard.setString(text)
    Alert.alert('Datos copiados', text);
};

// Open WhatsApp with payment message
export const openWhatsApp = async (amount: number): Promise<void> => {
    const message = encodeURIComponent(
        `Hola! Quiero realizar un pago de $${amount.toLocaleString()} en NutriAgenda.`
    );
    const url = `https://wa.me/${PAYMENT_CONFIG.whatsapp.replace('+', '')}?text=${message}`;

    try {
        await Linking.openURL(url);
    } catch (error) {
        Alert.alert('Error', 'No se pudo abrir WhatsApp');
    }
};

// Generate payment link for consultation
export const getConsultationPaymentLink = (): string => {
    return `https://link.mercadopago.cl/nutriagenda-consulta`;
};
