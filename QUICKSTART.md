# NutriAgenda - Guía de Inicio Rápido

## 🚀 Inicio Rápido

### 1. Configurar Firebase (15 minutos)

Sigue la guía detallada en [FIREBASE_SETUP.md](file:///home/raulsalazar/CascadeProjects/nutri-agenda/FIREBASE_SETUP.md)

**Resumen rápido:**
1. Crear proyecto en Firebase Console
2. Habilitar Authentication (Email/Password)
3. Crear Firestore Database
4. Habilitar Storage
5. Copiar credenciales al archivo `.env`

### 2. Ejecutar la Aplicación

```bash
cd /home/raulsalazar/CascadeProjects/nutri-agenda

# Para web (más fácil para probar)
npm run web

# Para Android
npm run android

# Para iOS (solo macOS)
npm run ios
```

### 3. Crear Usuarios de Prueba

**Nutricionista:**
- Email: nutri@test.com
- Contraseña: test123
- Rol: Nutricionista

**Cliente:**
- Email: cliente@test.com
- Contraseña: test123
- Rol: Cliente

## ✅ Funcionalidades Implementadas

### Para Nutricionistas:
- ✅ Dashboard con estadísticas
- ✅ Lista de clientes con búsqueda
- ✅ Agregar/editar clientes
- ✅ Perfil completo del cliente
- ✅ Calendario de citas
- ✅ Agendar nuevas citas
- ✅ Registrar mediciones con fotos

### Para Clientes:
- ✅ Dashboard personal
- ⏳ Ver citas (próximamente)
- ⏳ Agendar citas (próximamente)
- ⏳ Ver progreso (próximamente)
- ⏳ Tienda (próximamente)

## 📁 Estructura del Proyecto

```
nutri-agenda/
├── app/                    # Pantallas
│   ├── auth/              # Login y registro
│   ├── (nutritionist)/    # Pantallas de nutricionista
│   ├── (client)/          # Pantallas de cliente
│   └── (shared)/          # Pantallas compartidas
├── services/              # Servicios de backend
├── types/                 # TypeScript types
├── constants/             # Tema y constantes
└── README.md             # Documentación completa
```

## 🔧 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Limpiar caché
npm start -- --clear

# Ver logs
npx expo start

# Compilar para producción
eas build --platform android
eas build --platform ios
```

## 📚 Documentación

- [README.md](file:///home/raulsalazar/CascadeProjects/nutri-agenda/README.md) - Documentación completa
- [FIREBASE_SETUP.md](file:///home/raulsalazar/CascadeProjects/nutri-agenda/FIREBASE_SETUP.md) - Configuración de Firebase
- [walkthrough.md](file:///home/raulsalazar/.gemini/antigravity/brain/8370a7f2-dffa-48d0-a0b9-306ec24876e6/walkthrough.md) - Guía de implementación

## 🐛 Problemas Comunes

**Error: "Firebase not initialized"**
→ Verifica que el archivo `.env` existe con las credenciales correctas

**Error: "Permission denied"**
→ Verifica las reglas de Firestore en Firebase Console

**La app no carga**
→ Ejecuta `npm start -- --clear` para limpiar caché

## 🎯 Próximos Pasos

1. ✅ Configurar Firebase
2. ✅ Probar login/registro
3. ✅ Agregar clientes
4. ✅ Crear citas
5. ✅ Registrar mediciones
6. ⏳ Implementar gráficos de progreso
7. ⏳ Integrar Mercado Pago
8. ⏳ Agregar notificaciones push

---

¿Necesitas ayuda? Revisa la documentación completa en README.md
