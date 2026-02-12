## Variables de Entorno para EAS Build (Expo)

EAS Build no usa tu `.env` local. Debes configurar secretos/variables en el proyecto (Expo).

### Variables (app Expo)

Estas variables se usan en `services/firebase.ts`:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

Y opcional:

- `EXPO_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
- `APP_ENV` (ej: `production`)

### Opcion 1: Via Web

1. Entra a los secretos del proyecto en Expo (EAS):
2. Agrega cada variable (nombre/valor).

### Opcion 2: Via CLI

Ejemplo (reemplaza los valores):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "TU_VALOR"
```

### Importante

- No guardes tokens/secretos en el repo.
- Si un secreto ya se publico, rotalo (revoca y genera uno nuevo).
