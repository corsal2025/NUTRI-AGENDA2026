import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

function requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing env var ${name}. See .env.example`);
    }
    return value;
}

// Nota: este script espera variables de entorno cargadas (por ejemplo: `source .env`).
const firebaseConfig = {
    apiKey: requiredEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: requiredEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: requiredEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: requiredEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requiredEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requiredEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createDemoUsers() {
    console.log('Creating demo users...');

    const users = [
        { email: 'demo@nutriagenda.com', password: 'demo123456', name: 'Demo User', role: 'client', phone: '+1234567890' },
        { email: 'nutritionist@nutriagenda.com', password: 'nutri123456', name: 'Dr. Demo', role: 'nutritionist', phone: '+0987654321' },
    ];

    for (const user of users) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                createdAt: new Date().toISOString(),
            });
            console.log(`Created: ${user.email} (${user.role})`);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`Already exists: ${user.email}`);
            } else {
                console.error(`Error creating ${user.email}:`, error.message);
            }
        }
    }

    console.log('Demo users ready');
}

createDemoUsers().catch(console.error);
