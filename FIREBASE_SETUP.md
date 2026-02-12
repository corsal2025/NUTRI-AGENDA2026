# Configuracion de Firebase para NutriAgenda (Expo)

Esta guia te ayuda a configurar Firebase para la app Expo (raiz del repo).

## Requisitos

- Cuenta de Google
- Proyecto Firebase

## 1) Crear proyecto en Firebase

1. Ve a https://console.firebase.google.com/
2. Agrega un proyecto nuevo.
3. Habilita Authentication (Email/Password) y Firestore.

## 2) Registrar la aplicacion Web en Firebase

En Firebase Console:

1. Project settings
2. Add app -> Web
3. Copia el `firebaseConfig` que te muestra.

Ejemplo (solo referencia):

```js
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 3) Configurar variables locales

En la raiz del repo:

```bash
cp .env.example .env
```

Completa en `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

## 4) Ejecutar

```bash
npm install
npm run start
```

Si falla, revisa que `.env` exista y tenga todas las variables.
