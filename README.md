# NutriAgenda (Monorepo)

Suite para nutricionistas y pacientes: agenda de citas, evaluaciones/antropometria, historial, pagos (Mercado Pago) y notificaciones.

## Que incluye este repositorio

- `app/`, `components/`, `services/`: app **Expo (React Native)**.
- `web/`: web **Next.js** (dashboard/admin) con **Supabase**.
- `supabase/`: migraciones y Edge Functions.
- `backend/`: API **FastAPI** (opcional / en evolucion).

## Requisitos

- Node.js 18+
- npm
- (Opcional) Python 3.10+ para `backend/`
- (Opcional) Docker si vas a levantar Supabase local

## Arranque rapido (local)

### 1) App Expo (movil)

```bash
npm install
cp .env.example .env
# Completa EXPO_PUBLIC_* en .env
npm run start
```

### 2) Web (Next.js)

```bash
cd web
npm install
cp .env.example .env.local
# Completa variables en web/.env.local
npm run dev
```

### 3) Backend (FastAPI) (opcional)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Documentacion

- `QUICKSTART.md`: pasos detallados de setup.
- `docs/plan-mejora.md`: roadmap y decisiones.

## Seguridad

- `.env` / `.env.local` no se commitean.
- No pegues tokens en chats ni los guardes en archivos del repo.
- Si un token se filtro, revocalo y crea uno nuevo.
