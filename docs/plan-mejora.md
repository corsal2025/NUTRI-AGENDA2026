# Plan de mejora: NutriAgenda (Nutri-agenda_main)

## 0) Objetivo
Dejar el proyecto **estable, entendible, ejecutable y desplegable** (web + mobile + backend) con un flujo de trabajo profesional: ambientes, calidad, CI, y roadmap de features.

## 1) Estado actual (lo que hay hoy)
- **Mobile**: Expo / React Native (carpeta raiz `app/`, `components/`, etc.).
- **Web**: Next.js en `web/` con Supabase SSR (`@supabase/ssr`), rutas protegidas por `middleware`.
- **Backend**: FastAPI + SQLAlchemy en `backend/` (parece BFF/API propia).
- **Supabase**: migraciones + Edge Functions en `supabase/` (por ejemplo PDF y webhook MercadoPago).

Esto sugiere que el producto esta en modo **monorepo multi-plataforma**, pero falta una definicion clara de “backend principal”.

## 2) Problemas detectados (prioridad alta)
- **Backend no arrancaba** por `api_router` no importado en `backend/app/main.py` (ya corregido localmente).
- **Documentacion desalineada**: README/Quickstart mencionan Firebase/Expo, pero el Web depende fuerte de Supabase/Next y hay backend FastAPI.
- **Ambientes/variables**: faltan `.env.example` por componente (web/backend). Hoy hay variables para Firebase/MercadoPago, pero el web requiere `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`, `GOOGLE_CLIENT_*`, etc.
- **Calidad**: no hay pipeline claro de lint/tests en raiz; en `web/` hay ESLint pero no hay CI.
- **Deuda de repo**: hay muchos cambios locales sin publicar (y mezcla de carpetas `.agent`).

## 3) Decision clave (para no perder tiempo)
En 1 hora definimos una sola linea:

Opcion A (recomendada si el foco es web + rapidez):
- **Backend principal = Supabase** (Auth + DB + Storage + Edge Functions)
- **Logica server**: Next API Routes + Supabase Edge Functions
- `backend/` queda como referencia o se elimina/extrae a repo aparte.

Opcion B (recomendada si quieres API propia y control total):
- **Backend principal = FastAPI + Postgres**
- Web/Mobile consumen tu API
- Supabase se usa solo como Postgres (o se elimina) y se migran funciones.

Sin esta decision, vas a duplicar modelos, auth y pagos.

## 4) Plan por fases

### Fase 1: Estabilizacion (hoy)
- Alinear documentacion a la realidad del repo.
- Crear `.env.example` por app:
  - `web/.env.example`
  - `backend/.env.example`
- Dejar comandos de arranque reproducibles:
  - `web`: `npm ci && npm run dev`
  - `backend`: `python -m venv .venv && pip install -r requirements.txt && uvicorn app.main:app --reload`
  - `mobile`: `npm ci && npm run web/android`
- Agregar un `Makefile` o `scripts/dev.sh` para 1 comando por componente.

**Definicion de hecho**: cualquiera puede clonar y levantar web + backend en su PC.

### Fase 2: Arquitectura y datos (1-2 dias)
- Elegir A o B (arriba).
- Unificar **modelo de datos** (appointments, patients, anthropometry, payments).
- Definir fuente de verdad de usuarios/roles (nutricionista vs paciente):
  - si Supabase: roles via claims/RLS + tablas
  - si FastAPI: JWT + RBAC

**Definicion de hecho**: una sola forma de crear usuarios, permisos consistentes y tablas alineadas.

### Fase 3: Pagos + agenda (2-4 dias)
- MercadoPago:
  - preferencia/checkout
  - webhook idempotente (evitar cobros duplicados)
  - estados: pending/approved/rejected + auditoria
- Google Calendar:
  - OAuth bien aislado
  - reintentos + logs
- Emails:
  - plantilla y envio (Resend) con modo “dry-run” si falta API key

**Definicion de hecho**: flujo de pago end-to-end y citas sincronizadas.

### Fase 4: Calidad, CI y despliegue (1-2 dias)
- `web`:
  - `npm run lint` en CI
  - tests basicos (al menos smoke + servicios)
  - E2E (Playwright) para login + dashboard
- `backend`:
  - formateo/lint (ruff) y tests basicos (pytest)
- GitHub Actions:
  - lint/test por carpeta
- Deploy:
  - `web` -> Vercel
  - `backend` -> Render (si aplica) o Edge Functions

**Definicion de hecho**: PRs con checks verdes y deploy automatico.

## 5) Como vamos a usar tus MCP/skills
- `context7` (MCP): documentacion actualizada (Next.js, Supabase, Expo, FastAPI) para no adivinar.
- Skill `playwright`: E2E reales (login, dashboard, crear cita).
- Skill `vercel-deploy` / `render-deploy`: cuando toque publicar.
- Skill `gh-fix-ci`: si falla CI.

## 6) Proximo paso (accionable)
Elige A o B (backend principal) y yo:
1) alineo `.env` y docs,
2) dejo scripts de arranque,
3) creo CI basico,
4) preparo commits limpios para subir.
