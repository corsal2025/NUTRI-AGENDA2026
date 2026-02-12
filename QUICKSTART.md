# NutriAgenda - Guia de Inicio Rapido

Este repo es un monorepo: app Expo (raiz), web Next.js (`web/`) y backend FastAPI (`backend/`).

## 1) Web (Next.js)

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Variables requeridas: ver `web/.env.example`.

## 2) App Expo (React Native)

```bash
npm install
cp .env.example .env
npm run start
```

Variables requeridas: ver `.env.example`.

## 3) Backend (FastAPI) (opcional)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Si quieres crear tablas automaticamente en desarrollo:

```bash
# en backend/.env
AUTO_CREATE_TABLES=true
```

## 4) Demo users (Firebase) (opcional)

Si estas usando Firebase en la app Expo y quieres crear usuarios demo:

```bash
./scripts/setup-demo.sh
```

## Problemas comunes

- Si Git muestra cientos de archivos cambiados sin razon (CRLF/LF): en este repo se fuerza LF con `.gitattributes`.
- Si `services/firebase.ts` falla: revisa que existan las variables `EXPO_PUBLIC_FIREBASE_*` en `.env`.
