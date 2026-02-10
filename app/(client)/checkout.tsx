import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createPreference } from '../../services/payment';
import { Text, Button } from 'react-native-paper';

export default function CheckoutScreen() {
    const { planId, price } = useLocalSearchParams();
    const [url, setUrl] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            // En prod, price y title vendrían de una DB segura, no params
            const mpUrl = await createPreference("Consulta Nutricional", Number(price) || 15000);
            setUrl(mpUrl);
        }
        load();
    }, []);

    const handleNavigationStateChange = (event: any) => {
        // Detectar redirección de éxito
        if (event.url.includes("checkout/success")) {
            alert("✅ Pago Aprobado!");
            router.replace('/(client)/dashboard');
        }
    };

    if (!url) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#009EE3" />
                <Text>Conectando con Mercado Pago...</Text>
            </View>
        );
    }

    return (
        <WebView
            source={{ uri: url }}
            onNavigationStateChange={handleNavigationStateChange}
            style={{ flex: 1 }}
        />
    );
}
