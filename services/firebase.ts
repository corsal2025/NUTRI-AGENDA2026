// Firebase Configuration and Initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - Direct values for web deployment
const firebaseConfig = {
  apiKey: "AIzaSyBdLjFMV_Mdx8UMc1B8JfQLUVNBrslp_lw",
  authDomain: "nutri-agenda-5bd9f.firebaseapp.com",
  projectId: "nutri-agenda-5bd9f",
  storageBucket: "nutri-agenda-5bd9f.firebasestorage.app",
  messagingSenderId: "959595137128",
  appId: "1:959595137128:web:4bac44a6cab6310c9553dd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
