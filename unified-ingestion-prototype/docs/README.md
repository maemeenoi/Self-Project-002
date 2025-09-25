# Unified Ingestion Prototype

Jira (CSV + API) and GitHub (API) → normalized schema via Prisma (SQLite). Next.js App Router UI with tables and a weekly deployment frequency chart.

## Quick start
```bash
pnpm i # or npm i / yarn
cp .env.example .env.local
npx prisma generate
npx prisma migrate dev --name init
pnpm dev
```

- Open `http://localhost:3000/dashboard`.
- The page uses **demo** data by default. Wire real data by calling the API routes without `demo: true`.

## API routes
- `POST /api/ingest/github/prs` body `{ repos: ['owner/repo'], state?: 'open'|'closed'|'all' }`
- `POST /api/ingest/jira/api` body `{ jql?: string, projects?: string[] }`
- `POST /api/ingest/jira/csv` multipart: `file=<csv>`

## Azure migration (later)
- Switch `datasource db { provider = "postgresql" }` or `"sqlserver"` in `prisma/schema.prisma`.
- Set `DATABASE_URL` accordingly (Azure PostgreSQL Flexible Server or Azure SQL).
- Run `prisma migrate dev` to generate and apply migrations.
