// Authentication Service
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, LoginCredentials, RegisterData } from '../types/auth.types';

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<User> => {
  try {
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // Create user document in Firestore
    const userData: Omit<User, 'id'> = {
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    return {
      id: userCredential.user.uid,
      ...userData,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al registrar usuario');
  }
};

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }

    const userData = userDoc.data();
    
    return {
      id: userCredential.user.uid,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      createdAt: userData.createdAt.toDate(),
      updatedAt: userData.updatedAt.toDate(),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al iniciar sesión');
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Error al cerrar sesión');
  }
};

/**
 * Get current user data
 */
export const getCurrentUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    
    return {
      id: firebaseUser.uid,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      createdAt: userData.createdAt.toDate(),
      updatedAt: userData.updatedAt.toDate(),
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await getCurrentUser(firebaseUser);
      callback(user);
    } else {
      callback(null);
    }
  });
};
