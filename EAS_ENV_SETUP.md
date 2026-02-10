## 🔥 Variables de Entorno para EAS Build

El archivo `.env` NO se sube a EAS por seguridad. Debes configurarlas en Expo:

### Opción 1: Via Web (Recomendado)
1. Ve a: https://expo.dev/accounts/cosal2026/projects/nutri-agenda/secrets
2. Agrega cada variable:

```
FIREBASE_API_KEY=AIzaSyBdLjFMV_Mdx8UMc1B8JfQLUVNBrslp_lw
FIREBASE_AUTH_DOMAIN=nutri-agenda-5bd9f.firebaseapp.com
FIREBASE_PROJECT_ID=nutri-agenda-5bd9f
FIREBASE_STORAGE_BUCKET=nutri-agenda-5bd9f.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=959595137128
FIREBASE_APP_ID=1:959595137128:web:4bac44a6cab6310c9553dd
APP_ENV=production
```

### Opción 2: Via CLI
```bash
npx eas secret:create --scope project --name FIREBASE_API_KEY --value AIzaSyBdLjFMV_Mdx8UMc1B8JfQLUVNBrslp_lw
npx eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value nutri-agenda-5bd9f.firebaseapp.com
npx eas secret:create --scope project --name FIREBASE_PROJECT_ID --value nutri-agenda-5bd9f
npx eas secret:create --scope project --name FIREBASE_STORAGE_BUCKET --value nutri-agenda-5bd9f.firebasestorage.app
npx eas secret:create --scope project --name FIREBASE_MESSAGING_SENDER_ID --value 959595137128
npx eas secret:create --scope project --name FIREBASE_APP_ID --value 1:959595137128:web:4bac44a6cab6310c9553dd
npx eas secret:create --scope project --name APP_ENV --value production
```

### ⚠️ IMPORTANTE
Después de agregar las variables:
1. **Cancela el build actual** (si aún corre)
2. **Relanza**: `npx eas-cli build --platform android --profile preview`

---

**Nota:** Si el build actual falla por "Firebase not configured", este es el problema.
