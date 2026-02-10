import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBdLjFMV_Mdx8UMc1B8JfQLUVNBrslp_lw",
    authDomain: "nutri-agenda-5bd9f.firebaseapp.com",
    projectId: "nutri-agenda-5bd9f",
    storageBucket: "nutri-agenda-5bd9f.firebasestorage.app",
    messagingSenderId: "959595137128",
    appId: "1:959595137128:web:4bac44a6cab6310c9553dd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createDemoUsers() {
    console.log('🚀 Creating demo users...\n');

    const users = [
        { email: 'demo@nutriagenda.com', password: 'demo123456', name: 'Demo User', role: 'client', phone: '+1234567890' },
        { email: 'nutritionist@nutriagenda.com', password: 'nutri123456', name: 'Dr. Demo', role: 'nutritionist', phone: '+0987654321' }
    ];

    for (const user of users) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                createdAt: new Date().toISOString()
            });
            console.log(`✅ Created: ${user.email} (${user.role})`);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`ℹ️  Already exists: ${user.email}`);
            } else {
                console.error(`❌ Error creating ${user.email}:`, error.message);
            }
        }
    }

    console.log('\n✅ Demo users ready!');
    console.log('================================');
    console.log('CLIENT LOGIN:');
    console.log('  Email: demo@nutriagenda.com');
    console.log('  Password: demo123456');
    console.log('');
    console.log('NUTRITIONIST LOGIN:');
    console.log('  Email: nutritionist@nutriagenda.com');
    console.log('  Password: nutri123456');
    console.log('================================');
    process.exit(0);
}

createDemoUsers().catch(console.error);
