import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, Button, Badge } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';

// Products catalog
const PRODUCTS = [
    {
        id: '1',
        name: 'Consulta Nutricional',
        description: 'Consulta individual con nutricionista',
        price: 25000,
        category: 'servicio',
        emoji: '👩‍⚕️',
    },
    {
        id: '2',
        name: 'Plan Nutricional Mensual',
        description: 'Plan personalizado de alimentación',
        price: 45000,
        category: 'servicio',
        emoji: '📋',
    },
    {
        id: '3',
        name: 'Pack Suplementos Básico',
        description: 'Vitaminas y minerales esenciales',
        price: 35000,
        category: 'producto',
        emoji: '💊',
    },
    {
        id: '4',
        name: 'Proteína Whey 1kg',
        description: 'Proteína de suero de alta calidad',
        price: 28000,
        category: 'producto',
        emoji: '🥛',
    },
    {
        id: '5',
        name: 'Control de Peso (3 meses)',
        description: 'Programa completo de seguimiento',
        price: 120000,
        category: 'servicio',
        emoji: '⚖️',
    },
    {
        id: '6',
        name: 'Snacks Saludables Pack',
        description: 'Pack de 10 snacks nutritivos',
        price: 18000,
        category: 'producto',
        emoji: '🥜',
    },
];

interface CartItem {
    product: typeof PRODUCTS[0];
    quantity: number;
}

export default function ShopScreen() {
    const router = useRouter();
    const { user } = useAuthContext();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [loading, setLoading] = useState(false);

    const addToCart = (product: typeof PRODUCTS[0]) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    const handleCheckout = async () => {
        if (!user || cart.length === 0) return;

        setLoading(true);
        try {
            const order = {
                clientId: user.id,
                clientName: user.name,
                clientEmail: user.email,
                items: cart.map(item => ({
                    productId: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                })),
                total: getTotal(),
                status: 'pending',
                date: Timestamp.now(),
                createdAt: Timestamp.now(),
            };

            await addDoc(collection(db, 'orders'), order);

            // Generate payment link (simulated - replace with real payment provider)
            const paymentUrl = `https://www.mercadopago.cl/checkout/v1/redirect?pref_id=demo_${Date.now()}`;

            Alert.alert(
                '¡Pedido creado!',
                `Total: $${getTotal().toLocaleString()}\n\nSerás redirigido a la página de pago.`,
                [
                    {
                        text: 'Pagar ahora',
                        onPress: () => {
                            // In a real app, this would open the payment URL
                            Alert.alert(
                                'Link de pago',
                                `Para completar tu compra, realiza una transferencia a:\n\nBanco: Banco Estado\nCuenta: 12345678\nRUT: 12.345.678-9\nMonto: $${getTotal().toLocaleString()}\n\nO contacta por WhatsApp para pagar con Mercado Pago.`,
                                [{
                                    text: 'OK', onPress: () => {
                                        setCart([]);
                                        setShowCart(false);
                                        router.push('/(client)/orders');
                                    }
                                }]
                            );
                        }
                    },
                    {
                        text: 'Pagar después', onPress: () => {
                            setCart([]);
                            setShowCart(false);
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error creating order:', error);
            Alert.alert('Error', 'No se pudo crear el pedido');
        } finally {
            setLoading(false);
        }
    };

    if (showCart) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setShowCart(false)}>
                        <Text style={styles.backBtn}>← Volver</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Carrito</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.wrapper}>
                        {cart.length === 0 ? (
                            <View style={styles.emptyCart}>
                                <Text style={styles.emptyIcon}>🛒</Text>
                                <Text style={styles.emptyText}>Tu carrito está vacío</Text>
                            </View>
                        ) : (
                            <>
                                {cart.map((item) => (
                                    <View key={item.product.id} style={styles.cartItem}>
                                        <Text style={styles.cartEmoji}>{item.product.emoji}</Text>
                                        <View style={styles.cartItemInfo}>
                                            <Text style={styles.cartItemName}>{item.product.name}</Text>
                                            <Text style={styles.cartItemPrice}>
                                                ${item.product.price.toLocaleString()}
                                            </Text>
                                        </View>
                                        <View style={styles.quantityControls}>
                                            <TouchableOpacity
                                                style={styles.qtyBtn}
                                                onPress={() => updateQuantity(item.product.id, -1)}
                                            >
                                                <Text style={styles.qtyBtnText}>−</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.qtyText}>{item.quantity}</Text>
                                            <TouchableOpacity
                                                style={styles.qtyBtn}
                                                onPress={() => updateQuantity(item.product.id, 1)}
                                            >
                                                <Text style={styles.qtyBtnText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}

                                <View style={styles.totalSection}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>${getTotal().toLocaleString()}</Text>
                                </View>

                                <Button
                                    mode="contained"
                                    onPress={handleCheckout}
                                    loading={loading}
                                    disabled={loading}
                                    style={styles.checkoutBtn}
                                    contentStyle={styles.checkoutBtnContent}
                                    buttonColor={Colors.primary}
                                >
                                    Proceder al pago
                                </Button>
                            </>
                        )}
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tienda</Text>
                <TouchableOpacity style={styles.cartBtn} onPress={() => setShowCart(true)}>
                    <Text style={styles.cartIcon}>🛒</Text>
                    {getCartCount() > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.wrapper}>
                    {/* Services */}
                    <Text style={styles.sectionTitle}>🩺 Servicios</Text>
                    {PRODUCTS.filter(p => p.category === 'servicio').map((product) => (
                        <View key={product.id} style={styles.productCard}>
                            <Text style={styles.productEmoji}>{product.emoji}</Text>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{product.name}</Text>
                                <Text style={styles.productDesc}>{product.description}</Text>
                                <Text style={styles.productPrice}>${product.price.toLocaleString()}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => addToCart(product)}
                            >
                                <Text style={styles.addBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Products */}
                    <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>📦 Productos</Text>
                    {PRODUCTS.filter(p => p.category === 'producto').map((product) => (
                        <View key={product.id} style={styles.productCard}>
                            <Text style={styles.productEmoji}>{product.emoji}</Text>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{product.name}</Text>
                                <Text style={styles.productDesc}>{product.description}</Text>
                                <Text style={styles.productPrice}>${product.price.toLocaleString()}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => addToCart(product)}
                            >
                                <Text style={styles.addBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Floating cart button */}
            {getCartCount() > 0 && (
                <TouchableOpacity
                    style={styles.floatingCart}
                    onPress={() => setShowCart(true)}
                >
                    <Text style={styles.floatingCartText}>
                        Ver carrito ({getCartCount()}) - ${getTotal().toLocaleString()}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    backBtn: {
        fontSize: FontSizes.md,
        color: Colors.primary,
        fontWeight: FontWeights.medium,
    },
    cartBtn: {
        position: 'relative',
        padding: Spacing.xs,
    },
    cartIcon: {
        fontSize: 24,
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: Colors.textLight,
        fontSize: 11,
        fontWeight: FontWeights.bold,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: Spacing.md,
        paddingBottom: 80,
    },
    wrapper: {
        paddingHorizontal: Spacing.md,
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
    },
    sectionTitle: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.semibold,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    productEmoji: {
        fontSize: 32,
        marginRight: Spacing.md,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.medium,
        color: Colors.text,
    },
    productDesc: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    productPrice: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.bold,
        color: Colors.primary,
        marginTop: 4,
    },
    addBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addBtnText: {
        color: Colors.textLight,
        fontSize: 20,
        fontWeight: FontWeights.bold,
    },
    floatingCart: {
        position: 'absolute',
        bottom: Spacing.md,
        left: Spacing.md,
        right: Spacing.md,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        ...Shadows.md,
    },
    floatingCartText: {
        color: Colors.textLight,
        fontSize: FontSizes.md,
        fontWeight: FontWeights.semibold,
    },
    emptyCart: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    emptyText: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    cartEmoji: {
        fontSize: 28,
        marginRight: Spacing.md,
    },
    cartItemInfo: {
        flex: 1,
    },
    cartItemName: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.medium,
        color: Colors.text,
    },
    cartItemPrice: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        fontWeight: FontWeights.semibold,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyBtnText: {
        fontSize: 18,
        color: Colors.text,
        fontWeight: FontWeights.bold,
    },
    qtyText: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.semibold,
        color: Colors.text,
        minWidth: 24,
        textAlign: 'center',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        marginTop: Spacing.md,
    },
    totalLabel: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.medium,
        color: Colors.text,
    },
    totalValue: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.bold,
        color: Colors.primary,
    },
    checkoutBtn: {
        marginTop: Spacing.md,
        borderRadius: BorderRadius.sm,
    },
    checkoutBtnContent: {
        height: 50,
    },
});
