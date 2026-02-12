#!/usr/bin/env bash
set -euo pipefail

echo "NutriAgenda - Setup demo users (Firebase)"

top_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$top_dir"

if [ ! -f .env ]; then
  echo "Falta .env en la raiz. Crea uno con: cp .env.example .env"
  exit 1
fi

# Exporta variables desde .env (formato KEY=VALUE)
set -a
# shellcheck disable=SC1091
source .env
set +a

required=(
  EXPO_PUBLIC_FIREBASE_API_KEY
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  EXPO_PUBLIC_FIREBASE_PROJECT_ID
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  EXPO_PUBLIC_FIREBASE_APP_ID
)

for v in "${required[@]}"; do
  if [ -z "${!v:-}" ]; then
    echo "Falta variable $v (ver .env.example)"
    exit 1
  fi
done

cat > /tmp/seed_users.js <<'JS'
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}.`);
  return v;
}

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
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`Already exists: ${user.email}`);
      } else {
        console.error(`Error creating ${user.email}:`, error.message);
      }
    }
  }
}

createDemoUsers()
  .then(() => console.log('Demo users ready'))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
JS

node /tmp/seed_users.js
