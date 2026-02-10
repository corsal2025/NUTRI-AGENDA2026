# NutriAgenda - Aplicación Móvil de Nutrición

Aplicación móvil completa para nutricionistas y clientes con gestión de citas, mediciones, y pagos integrados con Mercado Pago.

## 🚀 Características

### Para Nutricionistas
- ✅ Dashboard con estadísticas
- ✅ Gestión de clientes
- ✅ Agenda de citas
- ✅ Registro de mediciones
- ✅ Historial de progreso de clientes

### Para Clientes
- ✅ Dashboard personal
- ✅ Agendar citas
- ✅ Ver progreso y mediciones
- ✅ Tienda de productos/planes
- ✅ Carrito de compras con Mercado Pago

## 📱 Tecnologías

- **Frontend**: React Native con Expo
- **UI**: React Native Paper
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Pagos**: Mercado Pago
- **Navegación**: Expo Router
- **Lenguaje**: TypeScript

## 🛠️ Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Expo CLI
- Cuenta de Firebase
- Cuenta de Mercado Pago (para pagos)

### Pasos

1. **Clonar el repositorio**
```bash
cd /home/raulsalazar/CascadeProjects/nutri-agenda
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar Authentication (Email/Password)
   - Crear base de datos Firestore
   - Habilitar Storage
   - Copiar las credenciales de configuración

4. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu_proyecto_id
FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_APP_ID=tu_app_id

MERCADO_PAGO_PUBLIC_KEY=tu_public_key
MERCADO_PAGO_ACCESS_TOKEN=tu_access_token
```

5. **Ejecutar la aplicación**

Para Android:
```bash
npm run android
```

Para iOS (solo macOS):
```bash
npm run ios
```

Para web:
```bash
npm run web
```

## 📂 Estructura del Proyecto

```
nutri-agenda/
├── app/                      # Pantallas de la app (Expo Router)
│   ├── (auth)/              # Autenticación
│   ├── (nutritionist)/      # Pantallas de nutricionista
│   ├── (client)/            # Pantallas de cliente
│   └── (shared)/            # Pantallas compartidas
├── components/              # Componentes reutilizables
├── services/                # Servicios (Firebase, APIs)
├── hooks/                   # Custom hooks
├── types/                   # TypeScript types
├── utils/                   # Utilidades
├── constants/               # Constantes (tema, colores)
└── assets/                  # Imágenes, fuentes
```

## 🔐 Roles de Usuario

### Nutricionista
- Gestión completa de clientes
- Crear y gestionar citas
- Registrar mediciones
- Ver estadísticas

### Cliente
- Ver citas programadas
- Ver progreso personal
- Comprar productos/planes
- Gestionar perfil

## 🔥 Configuración de Firebase

### Firestore Collections

```
users/
  - email, role, name, phone, createdAt, updatedAt

clients/
  - userId, nutritionistId, personalInfo, medicalHistory

appointments/
  - clientId, nutritionistId, date, duration, status, notes

measurements/
  - clientId, date, weight, height, bmi, waist, hip, bodyFat, photos

products/
  - name, description, price, currency, category, image, active

orders/
  - clientId, items, total, status, mercadoPagoId
```

### Reglas de Seguridad (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Nutritionists can manage their clients
    match /clients/{clientId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if resource.data.nutritionistId == request.auth.uid;
    }
    
    // Similar rules for appointments, measurements, etc.
  }
}
```

## 💳 Integración de Mercado Pago

**Nota**: La integración completa de Mercado Pago requiere un backend para seguridad.

### Pasos para integración completa:

1. Crear cuenta de desarrollador en [Mercado Pago](https://www.mercadopago.com.ar/developers)
2. Obtener credenciales (Public Key y Access Token)
3. Implementar backend API (Node.js recomendado)
4. Configurar webhooks para notificaciones de pago
5. Actualizar `services/mercadopago.service.ts` con la lógica real

## 📱 Compilación para Producción

### Android (APK)
```bash
eas build --platform android
```

### iOS (IPA)
```bash
eas build --platform ios
```

### Configurar EAS Build
```bash
npm install -g eas-cli
eas login
eas build:configure
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con cobertura
npm run test:coverage
```

## 📝 Próximas Funcionalidades

- [ ] Notificaciones push
- [ ] Chat entre nutricionista y cliente
- [ ] Planes de alimentación
- [ ] Recetas
- [ ] Integración con wearables
- [ ] Modo offline

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es privado y propietario.

## 👥 Autor

Desarrollado para gestión nutricional profesional.

## 📞 Soporte

Para soporte, contactar al desarrollador.
