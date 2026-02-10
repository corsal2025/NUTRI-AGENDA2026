import { Platform } from 'react-native';

const MP_ACCESS_TOKEN = "TEST-Your-Access-Token-Here"; // Debería estar en .env

export const createPreference = async (itemTitle: string, price: number) => {
    // En una app real, esto debe llamar a TU backend (Firebase Function).
    // Nunca expongas el Access Token en el frontend en producción.
    // Aquí simulamos la llamada al API de MP directamente para desarrollo.

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: [
                {
                    title: itemTitle,
                    quantity: 1,
                    currency_id: 'CLP',
                    unit_price: price
                }
            ],
            back_urls: {
                success: "nutriagenda://checkout/success",
                failure: "nutriagenda://checkout/failure",
                pending: "nutriagenda://checkout/pending"
            },
            auto_return: "approved"
        })
    });

    const data = await response.json();
    return data.init_point; // URL para el WebView
};
