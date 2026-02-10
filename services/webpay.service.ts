// WebPay (Transbank) integration service for Chilean cards
import { Alert, Linking } from 'react-native';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// Transbank credentials (replace with real ones from Transbank portal)
const WEBPAY_CONFIG = {
    commerceCode: '597055555532', // Test commerce code
    apiKey: '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C', // Test key
    environment: 'integration', // 'integration' for testing, 'production' for live
    returnUrl: 'https://nutri-agenda.vercel.app/payment/return',
    finalUrl: 'https://nutri-agenda.vercel.app/payment/final',
};

interface WebPayTransaction {
    token: string;
    url: string;
}

// Create WebPay transaction
export const createWebPayTransaction = async (
    amount: number,
    orderId: string,
    returnUrl: string = WEBPAY_CONFIG.returnUrl
): Promise<WebPayTransaction | null> => {
    try {
        // In production, this would be a call to your backend
        // which then calls Transbank's API
        const response = await fetch('https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions', {
            method: 'POST',
            headers: {
                'Tbk-Api-Key-Id': WEBPAY_CONFIG.commerceCode,
                'Tbk-Api-Key-Secret': WEBPAY_CONFIG.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                buy_order: orderId,
                session_id: `session_${Date.now()}`,
                amount: amount,
                return_url: returnUrl,
            }),
        });

        if (!response.ok) {
            throw new Error('WebPay transaction failed');
        }

        const data = await response.json();
        return {
            token: data.token,
            url: data.url,
        };
    } catch (error) {
        console.error('WebPay error:', error);
        return null;
    }
};

// Open WebPay checkout
export const openWebPayCheckout = async (
    amount: number,
    orderId: string,
    userId: string,
    description: string
): Promise<boolean> => {
    try {
        // Save pending payment to Firestore
        await addDoc(collection(db, 'payments'), {
            userId,
            orderId,
            amount,
            description,
            status: 'pending',
            paymentMethod: 'webpay',
            date: Timestamp.now(),
        });

        const transaction = await createWebPayTransaction(amount, orderId);

        if (transaction?.url) {
            const checkoutUrl = `${transaction.url}?token_ws=${transaction.token}`;
            await Linking.openURL(checkoutUrl);
            return true;
        }

        // Fallback message
        Alert.alert(
            'WebPay no disponible',
            'Por favor usa transferencia bancaria o Mercado Pago',
            [{ text: 'OK' }]
        );
        return false;
    } catch (error) {
        console.error('Error opening WebPay:', error);
        Alert.alert('Error', 'No se pudo iniciar el pago');
        return false;
    }
};

// Confirm WebPay transaction (called from return URL)
export const confirmWebPayTransaction = async (token: string): Promise<any> => {
    try {
        const response = await fetch(`https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`, {
            method: 'PUT',
            headers: {
                'Tbk-Api-Key-Id': WEBPAY_CONFIG.commerceCode,
                'Tbk-Api-Key-Secret': WEBPAY_CONFIG.apiKey,
                'Content-Type': 'application/json',
            },
        });

        return await response.json();
    } catch (error) {
        console.error('Error confirming WebPay:', error);
        return null;
    }
};

// Check transaction status
export const getWebPayTransactionStatus = async (token: string): Promise<string> => {
    try {
        const result = await confirmWebPayTransaction(token);

        if (result?.response_code === 0) {
            return 'approved';
        } else if (result?.response_code) {
            return 'rejected';
        }
        return 'pending';
    } catch (error) {
        return 'error';
    }
};
