# 🌾 crop tracker— Field Management Platform

A full-stack field management system for agricultural operations. Admins manage fields and agents; agents log observations and update crop stages in the field.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)

---

## Project Structure

```
farmops/
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx
│   │   │   └── agent/
│   │   │       └── AgentDashboard.jsx
│   │   └── store/
│   │       └── authStore.js    # Zustand auth state
│
└── backend/                    # Node.js + Express
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── controllers/        # HTTP request/response handlers
        ├── services/           # Core business logic
        ├── models/             # Prisma client singleton
        ├── middleware/         # Auth (JWT) + RBAC + validation
        └── routes/             # API endpoint definitions
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Zustand, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT (httpOnly cookie) |
| Validation | express-validator |

---

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- PostgreSQL database (local or hosted, e.g. Supabase, Railway)
- npm

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/farmops.git
cd farmops
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/farmops?schema=public"
JWT_SECRET="your-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV=development
CORS_ORIGINS="http://localhost:5173"
```

> Generate a strong JWT secret with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

#### Run database migrations

```bash
npm run db:migrate
```

#### Seed the database with demo data

```bash
npm run db:seed
```

This creates the following demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@farmops.com | admin123 |
| Agent | john@farmops.com | john123 |
| Agent | maria@farmops.com | maria123 |
| Agent | david@farmops.com | david123 |

#### Start the backend server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:4000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

### 4. Verify everything is working

```bash
curl http://localhost:4000/health
# → { "status": "ok", "timestamp": "..." }
```

Then open `http://localhost:5173` in your browser and log in with any demo account.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | ❌ | Token lifetime (default: `7d`) |
| `PORT` | ❌ | Server port (default: `4000`) |
| `NODE_ENV` | ❌ | `development` or `production` |
| `CORS_ORIGINS` | ❌ | Comma-separated allowed origins |

---

## API Overview

All protected routes require an active session cookie (`farmops_session`) set at login.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | ❌ | Login, sets httpOnly cookie |
| POST | `/api/auth/logout` | ✅ | Clears session cookie |
| POST | `/api/auth/register` | ADMIN | Create a new user |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/me/password` | ✅ | Change own password |

### Users — `/api/users` (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users (`?role=AGENT`) |
| GET | `/api/users/:id` | Get user + assigned fields |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update name, email, or role |
| DELETE | `/api/users/:id` | Delete user |

### Fields — `/api/fields`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/fields` | ANY | Admin: all fields. Agent: own fields only |
| POST | `/api/fields` | ADMIN | Create a field (assign by agent name) |
| GET | `/api/fields/:id` | ANY | Get field + observation history |
| PUT | `/api/fields/:id` | ADMIN | Update field or reassign agent |
| DELETE | `/api/fields/:id` | ADMIN | Delete field (cascades observations) |
| GET | `/api/fields/:id/observations` | ANY | List observations for a field |
| POST | `/api/fields/:id/observations` | AGENT | Add observation + optional stage update |

### Observations — `/api/observations`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/observations` | ADMIN | Paginated activity feed (`?page=1&limit=50`) |

### Crop Stages

```
PLANTED → GROWING → READY → HARVESTED
```

Mapped to a display status:

| Stage | Status |
|---|---|
| PLANTED, GROWING | Active |
| READY, HARVESTED | Completed |

---

## Design Decisions

### Authentication — httpOnly cookies over Authorization headers

JWTs are stored in httpOnly cookies rather than localStorage or returned as Bearer tokens. This prevents XSS attacks from stealing the token via JavaScript. The cookie is also flagged `sameSite: LAX` .

The JWT payload carries `sub` (user id), `name`, and `role`. Including `name` and `role` in the payload means the frontend can read identity information immediately on page load without a round-trip to `/api/auth/me`.

### Agent assignment by name, not ID

When creating or updating a field, admins provide `agentName` (e.g. `"John Smith"`) rather than an internal database ID. This makes the API more ergonomic for humans and aligns with how the admin UI presents agents. The service layer resolves the name to an ID with a case-insensitive lookup. If two agents share a name, the API returns a `409 Conflict` error prompting the caller to use `agentId` directly to disambiguate — so the safety net is still there.

### Role-based access enforced at the service layer, not just the route

Route-level `authorize("ADMIN")` guards are the first line of defence, but ownership checks (e.g. an agent accessing another agent's field) are enforced inside the service via `assertFieldOwnership`. This means the business rules hold even if a route guard is accidentally removed or bypassed.

### Stage updates only via observations

A field's `currentStage` can only be changed by an agent submitting an observation. Admins can edit field metadata (name, crop type, agent assignment) but cannot directly mutate the stage. This enforces a full audit trail — every stage change has a linked observation record with a timestamp and author.

### Prisma transactions for observation + stage update

When an agent adds an observation, the observation insert and the field's `currentStage` update are wrapped in a `prisma.$transaction`. This guarantees they are atomic — you can never have an observation recorded with a stage that does not match the field's current stage, even under concurrent requests.

### ESM throughout

The entire backend uses ES modules (`import`/`export`) with `"type": "module"` in `package.json`. This keeps the codebase consistent with the React frontend and avoids the cognitive overhead of mixing CommonJS and ESM syntax.

### Zustand with persistence for frontend auth state

Zustand is used for global auth state (`user`, `isLoggedIn`). The `persist` middleware syncs state to `localStorage` so users are not logged out on page refresh. The backend cookie is the source of truth for actual authentication — the Zustand state is purely for the UI to know what to render without making an API call on every mount.

---

## Assumptions

1. **Single organisation.** The system is designed for one farm operation. There is no multi-tenancy — all admins can see and manage all fields and agents.

2. **Agents are pre-created by admins.** There is no self-registration flow. Agents receive their credentials from an admin via the `POST /api/auth/register` endpoint (admin-only). The frontend login page's "Sign up" link is a placeholder that can be removed or implemented later.

3. **Agent names are unique enough for lookup.** Assigning a field by `agentName` assumes names are distinct within the system. A `409` error is returned if two agents share the same name, prompting the use of `agentId` as a fallback — but the system does not enforce name uniqueness at the database level to allow for real-world edge cases.

4. **PostgreSQL is the target database.** The Prisma schema uses `@db.Text` for observation notes which is a PostgreSQL-specific annotation. Switching to another database would require a schema adjustment.

5. **Crop stages follow a linear progression.** The four stages (`PLANTED → GROWING → READY → HARVESTED`) are treated as an ordered sequence in the UI. The backend does not enforce that stages can only move forward — an agent could technically record a stage regression. Enforcing forward-only progression was omitted to allow corrections in the field.

6. **No file attachments on observations.** Agents can only add text notes. Image uploads (e.g. photos of crop damage) were out of scope and would require additional storage infrastructure (S3 or similar).

7. **Network is trusted between backend and database.** No SSL is enforced on the `DATABASE_URL` in development. Production deployments should append `?sslmode=require` to the connection string.