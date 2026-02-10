// Product and Order Management Service
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Order, CreateOrderData, OrderStatus } from '../types/product.types';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

/**
 * Get all active products
 */
export const getActiveProducts = async (): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        category: data.category,
        image: data.image,
        active: data.active,
        createdAt: data.createdAt.toDate(),
      };
    });
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener productos');
  }
};

/**
 * Get product by ID
 */
export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
    
    if (!productDoc.exists()) {
      return null;
    }

    const data = productDoc.data();
    
    return {
      id: productDoc.id,
      name: data.name,
      description: data.description,
      price: data.price,
      currency: data.currency,
      category: data.category,
      image: data.image,
      active: data.active,
      createdAt: data.createdAt.toDate(),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener producto');
  }
};

/**
 * Create a new order
 */
export const createOrder = async (
  clientId: string,
  clientName: string,
  data: CreateOrderData
): Promise<Order> => {
  try {
    const orderRef = doc(collection(db, ORDERS_COLLECTION));
    
    const orderData = {
      clientId,
      clientName,
      items: data.items.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          currency: item.product.currency,
        },
        quantity: item.quantity,
      })),
      total: data.total,
      currency: data.currency,
      status: 'pending' as OrderStatus,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(orderRef, orderData);

    return {
      id: orderRef.id,
      clientId,
      clientName,
      items: data.items,
      total: data.total,
      currency: data.currency,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al crear orden');
  }
};

/**
 * Update order with Mercado Pago info
 */
export const updateOrderPayment = async (
  orderId: string,
  mercadoPagoId: string,
  mercadoPagoStatus: string,
  status: OrderStatus
): Promise<void> => {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      mercadoPagoId,
      mercadoPagoStatus,
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Error al actualizar pago');
  }
};

/**
 * Get orders by client
 */
export const getOrdersByClient = async (clientId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        clientId: data.clientId,
        clientName: data.clientName,
        items: data.items,
        total: data.total,
        currency: data.currency,
        status: data.status,
        mercadoPagoId: data.mercadoPagoId,
        mercadoPagoStatus: data.mercadoPagoStatus,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener órdenes');
  }
};

/**
 * Get all orders (for nutritionist)
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        clientId: data.clientId,
        clientName: data.clientName,
        items: data.items,
        total: data.total,
        currency: data.currency,
        status: data.status,
        mercadoPagoId: data.mercadoPagoId,
        mercadoPagoStatus: data.mercadoPagoStatus,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener órdenes');
  }
};
