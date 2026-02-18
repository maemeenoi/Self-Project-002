# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NexusCRM is a full-stack CRM application with AI sales assistant integration. The stack is:
- **Frontend:** Vue 3 + Vite + TypeScript + Tailwind CSS v4 + Pinia + Vue Router
- **Backend:** Python FastAPI + SQLAlchemy + PostgreSQL
- **Planned:** Azure OpenAI integration, Docker, Terraform, Azure deployment

## Common Commands

### Frontend (`/frontend`)

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Type check + production build
npm run test:unit    # Run unit tests with Vitest
npm run lint         # ESLint with auto-fix
npm run format       # Prettier formatting
npm run type-check   # TypeScript check only (vue-tsc)
```

### Backend (`/backend`)

```bash
# Activate virtual environment first
source venv/bin/activate           # macOS/Linux
uvicorn main:app --reload          # Start dev server (http://127.0.0.1:8000)
# Swagger UI available at http://127.0.0.1:8000/docs
```

## Architecture

### Frontend Structure (`/frontend/src`)

```
src/
├── __tests__/       # Vitest unit tests
├── router/          # Vue Router (index.ts) — web history mode
├── stores/          # Pinia stores — Composition API pattern
├── App.vue          # Root component
├── main.ts          # Entry: creates app, installs Pinia + Router
└── style.css        # Tailwind v4 directives
```

- **Component pattern:** Vue 3 `<script setup>` Composition API with TypeScript
- **Path alias:** `@` resolves to `./src`
- **State:** Pinia stores in `src/stores/` (follow the `counter.ts` Composition API pattern)
- **Routing:** `src/router/index.ts` — add routes here using `import.meta.env.BASE_URL`

### Backend Structure (`/backend`)

```
backend/
├── main.py          # FastAPI app entry point
└── venv/            # Python virtual environment
```

- **Pattern (planned):** Routers → Controllers → Services → Repositories layers
- **Database:** PostgreSQL via SQLAlchemy + asyncpg; Alembic for migrations
- **Validation:** Pydantic models
- **Key tables planned:** `leads`, `contacts`, `deals`, `interactions`

### Planned API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/leads` | List / create leads |
| GET | `/leads/{id}` | Lead details |
| GET | `/deals/pipeline` | Deals grouped by stage |
| PATCH | `/deals/{id}/stage` | Move deal stage |
| POST | `/ai/chat` | AI assistant with RAG context |

## Code Style

- **Prettier:** no semicolons, single quotes, print width 100
- **ESLint:** flat config (`eslint.config.ts`) with Vue + TypeScript + Vitest rules
- **Format on save** is enabled in `.vscode/settings.json`
- Tests go in `src/__tests__/` and use Vitest + `@vue/test-utils`

## Development Phases (from PROJECT_DESIGN.md)

- **Phase 1:** Core CRUD — Leads/Deals management
- **Phase 2:** Kanban pipeline board, charts/analytics, timeline views
- **Phase 3:** AI assistant integration, Docker, Terraform, Azure deployment
