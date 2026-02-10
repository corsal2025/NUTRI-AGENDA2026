# Configuración de Firebase para NutriAgenda

Esta guía te ayudará a configurar Firebase para tu aplicación NutriAgenda paso a paso.

## 📋 Requisitos Previos

- Cuenta de Google
- Proyecto NutriAgenda instalado localmente

## 🔥 Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Agregar proyecto"**
3. Nombre del proyecto: `nutri-agenda` (o el nombre que prefieras)
4. Acepta los términos y haz clic en **"Continuar"**
5. (Opcional) Habilita Google Analytics
6. Haz clic en **"Crear proyecto"**
7. Espera a que se complete la configuración

## 📱 Paso 2: Registrar la Aplicación

1. En la página principal del proyecto, haz clic en el ícono **Web** (`</>`)
2. Nombre de la app: `NutriAgenda Web`
3. **NO** marques "Firebase Hosting"
4. Haz clic en **"Registrar app"**
5. **IMPORTANTE**: Copia las credenciales que aparecen (las necesitarás después)

Las credenciales se ven así:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 🔐 Paso 3: Configurar Authentication

1. En el menú lateral, ve a **"Authentication"**
2. Haz clic en **"Comenzar"**
3. En la pestaña **"Sign-in method"**, haz clic en **"Email/Password"**
4. **Habilita** el proveedor Email/Password
5. Haz clic en **"Guardar"**

## 💾 Paso 4: Configurar Firestore Database

1. En el menú lateral, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Iniciar en modo de prueba"** (lo cambiaremos después)
4. Elige la ubicación más cercana (ej: `southamerica-east1` para Argentina)
5. Haz clic en **"Habilitar"**

### Configurar Reglas de Seguridad

1. Ve a la pestaña **"Reglas"**
2. Reemplaza el contenido con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Clients collection
    match /clients/{clientId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.nutritionistId == request.auth.uid;
    }
    
    // Appointments collection
    match /appointments/{appointmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    
    // Measurements collection
    match /measurements/{measurementId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

3. Haz clic en **"Publicar"**

## 📦 Paso 5: Configurar Storage

1. En el menú lateral, ve a **"Storage"**
2. Haz clic en **"Comenzar"**
3. Acepta las reglas predeterminadas
4. Elige la misma ubicación que Firestore
5. Haz clic en **"Listo"**

### Configurar Reglas de Storage

1. Ve a la pestaña **"Reglas"**
2. Reemplaza el contenido con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /measurements/{clientId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. Haz clic en **"Publicar"**

## ⚙️ Paso 6: Configurar Variables de Entorno

1. Abre tu proyecto NutriAgenda en el editor
2. Crea un archivo `.env` en la raíz del proyecto:

```bash
cd /home/raulsalazar/CascadeProjects/nutri-agenda
cp .env.example .env
```

3. Edita el archivo `.env` con tus credenciales de Firebase:

```env
# Firebase Configuration
FIREBASE_API_KEY=tu_api_key_aqui
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_APP_ID=tu_app_id

# Mercado Pago Configuration (dejar vacío por ahora)
MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=

# App Configuration
APP_ENV=development
```

4. **Guarda el archivo**

## ✅ Paso 7: Verificar la Configuración

1. Ejecuta la aplicación:

```bash
cd /home/raulsalazar/CascadeProjects/nutri-agenda
npm run web
```

2. Abre el navegador en `http://localhost:8081`
3. Intenta registrar un usuario nuevo
4. Si todo funciona, verás el usuario en Firebase Console → Authentication

## 🎯 Próximos Pasos

Una vez configurado Firebase:

1. **Crear usuario de prueba**:
   - Registra un usuario nutricionista
   - Registra un usuario cliente

2. **Probar funcionalidades**:
   - Agregar clientes
   - Crear citas
   - Registrar mediciones

3. **Verificar en Firebase Console**:
   - Ve a Firestore Database
   - Deberías ver las colecciones: `users`, `clients`, `appointments`, `measurements`

## 🐛 Solución de Problemas

### Error: "Firebase not initialized"
- Verifica que el archivo `.env` existe y tiene las credenciales correctas
- Reinicia el servidor de desarrollo

### Error: "Permission denied"
- Verifica que las reglas de Firestore están configuradas correctamente
- Asegúrate de estar autenticado

### Error: "Network request failed"
- Verifica tu conexión a internet
- Verifica que el proyecto de Firebase está activo

## 📚 Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

¡Listo! Tu aplicación NutriAgenda ahora está conectada a Firebase y lista para usar. 🎉
