// Social authentication service (Google, Facebook)
import {
    signInWithCredential,
    GoogleAuthProvider,
    FacebookAuthProvider,
    sendEmailVerification,
    User
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';

// Configure for web browser redirect
WebBrowser.maybeCompleteAuthSession();

// Google OAuth config
const GOOGLE_CONFIG = {
    expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

// Facebook OAuth config
const FACEBOOK_CONFIG = {
    clientId: 'YOUR_FACEBOOK_APP_ID',
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User | null> => {
    try {
        // In production, use expo-auth-session
        // This is a simplified implementation
        Alert.alert(
            'Google Sign In',
            'Configuración requerida: Agrega tus credenciales OAuth de Google Cloud Console en services/social-auth.service.ts',
            [{ text: 'OK' }]
        );
        return null;

        /* Production implementation:
        const [request, response, promptAsync] = Google.useAuthRequest({
          ...GOOGLE_CONFIG,
        });
    
        if (response?.type === 'success') {
          const { id_token } = response.params;
          const credential = GoogleAuthProvider.credential(id_token);
          const userCredential = await signInWithCredential(auth, credential);
          
          // Save to Firestore
          await saveUserToFirestore(userCredential.user, 'google');
          
          return userCredential.user;
        }
        */
    } catch (error) {
        console.error('Google sign in error:', error);
        Alert.alert('Error', 'No se pudo iniciar sesión con Google');
        return null;
    }
};

// Sign in with Facebook
export const signInWithFacebook = async (): Promise<User | null> => {
    try {
        Alert.alert(
            'Facebook Sign In',
            'Configuración requerida: Agrega tu App ID de Facebook Developer en services/social-auth.service.ts',
            [{ text: 'OK' }]
        );
        return null;

        /* Production implementation:
        const [request, response, promptAsync] = Facebook.useAuthRequest({
          clientId: FACEBOOK_CONFIG.clientId,
        });
    
        if (response?.type === 'success') {
          const { access_token } = response.params;
          const credential = FacebookAuthProvider.credential(access_token);
          const userCredential = await signInWithCredential(auth, credential);
          
          // Save to Firestore
          await saveUserToFirestore(userCredential.user, 'facebook');
          
          return userCredential.user;
        }
        */
    } catch (error) {
        console.error('Facebook sign in error:', error);
        Alert.alert('Error', 'No se pudo iniciar sesión con Facebook');
        return null;
    }
};

// Save user info to Firestore
const saveUserToFirestore = async (user: User, provider: string): Promise<void> => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        // New user - create profile
        await setDoc(userRef, {
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
            provider,
            role: 'client', // Default role
            createdAt: Timestamp.now(),
            emailVerified: user.emailVerified,
        });
    } else {
        // Existing user - update last login
        await setDoc(userRef, {
            lastLogin: Timestamp.now(),
            emailVerified: user.emailVerified,
        }, { merge: true });
    }
};

// Send email verification
export const sendVerificationEmail = async (): Promise<boolean> => {
    try {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Error', 'No hay usuario autenticado');
            return false;
        }

        if (user.emailVerified) {
            Alert.alert('Info', 'Tu email ya está verificado');
            return true;
        }

        await sendEmailVerification(user);
        Alert.alert(
            '📧 Correo enviado',
            `Hemos enviado un enlace de verificación a ${user.email}. Revisa tu bandeja de entrada.`
        );
        return true;
    } catch (error: any) {
        console.error('Email verification error:', error);
        let message = 'No se pudo enviar el correo de verificación';
        if (error.code === 'auth/too-many-requests') {
            message = 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.';
        }
        Alert.alert('Error', message);
        return false;
    }
};

// Check if email is verified
export const isEmailVerified = (): boolean => {
    return auth.currentUser?.emailVerified || false;
};

// Reload user to get latest verification status
export const refreshVerificationStatus = async (): Promise<boolean> => {
    try {
        await auth.currentUser?.reload();
        return auth.currentUser?.emailVerified || false;
    } catch (error) {
        console.error('Error refreshing user:', error);
        return false;
    }
};
