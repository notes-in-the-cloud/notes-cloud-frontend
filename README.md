# Notes Cloud Frontend

A React 19 + TypeScript SPA for the Notes Cloud platform.

## Overview

- **Authentication**: Login, registration, logout, OAuth (Google, GitLab)
- **Notes**: Create, read, update, delete — the core deliverable
- **Reminders**: Priority-based (URGENT / HIGH / MEDIUM / LOW) with in-app notifications
- **Sharing**: Generate public links, view shared notes without authentication
- **Real-time Notifications**: WebSocket + STOMP push events
- **TODO List**: Task management module

> The frontend communicates only with the API Gateway. It never calls downstream services directly.

---

## Authentication Flow

### Token Strategy

| Token | Where it lives | Notes |
|---|---|---|
| `refresh_token` | httpOnly cookie | JS cannot read — XSS safe |
| `access_token` | localStorage | Used in `Authorization: Bearer` headers |

### Login
User submits credentials → auth-service returns `access_token` in JSON + sets `refresh_token` as httpOnly cookie → frontend stores token in localStorage.

### OAuth (Google / GitLab)
Browser redirects to `/auth/google/start` → OAuth flow → auth-service sets a readable `access_token` cookie (needed because there's no JSON response after a redirect) → frontend reads it, saves to localStorage, clears the cookie.

### Token Refresh
All requests go through `fetchWithAuth()`. On a 401, it automatically calls `POST /authService/api/v1/refresh` — the browser attaches the httpOnly cookie — then retries the original request with the new token.

### Logout
`POST /authService/api/v1/logout` → auth-service revokes the refresh token and clears the cookie → frontend clears localStorage and redirects to `/login`.

---

## Real-time Notifications

After login, a WebSocket connection is opened to the gateway. The frontend subscribes to `/user/{userId}/notifications` via STOMP. When a note is shared, the backend pushes a message → toast + bell badge update instantly, no polling.

---

## Routes

| Path | Auth required | Description |
|---|---|---|
| `/login` | No | Email + password login, OAuth buttons |
| `/register` | No | Registration form |
| `/notes` | Yes | Notes list + editor |
| `/notes/:id` | Yes | Single note editor |
| `/reminders` | Yes | Reminders grouped by urgency |
| `/public/:token` | No | Shared note view |

---

## Running Locally

**Prerequisites:** Node.js v20+, npm v9+, auth-service on `http://localhost:8081`

```bash
npm ci
npm run dev
```

App at `http://localhost:5173`. No `.env` needed — Vite proxies `/authService/*` to the auth-service automatically.

**Scripts:**

| Command | Description |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type check + production build |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview production build |

---

## Docker

```bash
docker build -t notes-cloud-frontend:latest .
docker run -p 8080:8080 notes-cloud-frontend:latest
```

Multi-stage build: Node builds the app → Nginx serves the static files. Final image ~40 MB.

---

## Kubernetes

```bash
# Recommended
kubectl port-forward -n notes-cloud svc/api-gateway 8090:8090

# Direct (debug only)
kubectl port-forward -n notes-cloud svc/notes-frontend 8080:8080
```

---

## Project Structure

```
src/
├── Auth/
│   ├── Session.ts       # Token storage, readOAuthCookie(), fetchWithAuth()
│   ├── LogIn.tsx
│   ├── SignUp.tsx
│   └── LogOut.tsx
├── Notes/
│   ├── HeaderBar.tsx    # Nav bar, notification bell + badge
│   ├── NotesList.tsx    # Notes list + editor
│   ├── Reminders.tsx
│   └── Reminders.css
└── api/
    ├── config.ts        # API_BASE, fetchWithAuth() with auto-refresh
    ├── notes.ts
    ├── reminders.ts
    └── notifications.ts # STOMP client
```

---

## System Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Frontend        │────▶│   API Gateway    │────▶│  Auth Service   │
│  (React SPA)     │     │   (port 8090)    │     │   (port 8081)   │
└──────────────────┘     └──────────────────┘     └─────────────────┘
         │ WSS                     │
         │ (notifications)         ├──────────────▶ Notes Service
         └─────────────────────────├──────────────▶ Reminder Service
                                   ├──────────────▶ Todo Service
                                   └──────────────▶ Sharing Service
```
