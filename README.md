Notes Cloud Frontend
A React 19 + TypeScript SPA (Single Page Application) for the Notes Cloud platform.
Overview
The frontend handles:

Authentication UI: Login, registration, logout, OAuth login (Google, GitLab)
Session Management: Access token storage, automatic token refresh on 401, OAuth cookie reading
Notes: Create, read, update, delete — the core deliverable
Reminders: Priority-based reminders (URGENT / HIGH / MEDIUM / LOW) with in-app notifications
Sharing: Generate public links, view shared notes without authentication
Real-time Notifications: WebSocket + STOMP subscription for push events
TODO List: Task management module

Important: The frontend communicates only with the API Gateway (localhost:8090 in production, localhost:8081 in local dev via Vite proxy). It never calls notes-service, reminder-service or other downstream services directly.

Authentication Flow
Cookie + localStorage Strategy
The frontend uses a hybrid strategy matching the auth-service implementation:
TokenWhere it livesWho sets itWho reads itrefresh_tokenhttpOnly cookieauth-serviceBrowser automatic (JS cannot read)access_tokenlocalStorageFrontend (from JSON response)Frontend (Authorization: Bearer)
Regular Login Flow
Endpoint: POST /authService/api/v1/login

User submits email + password form
Frontend sends POST /authService/api/v1/login with credentials: 'include'
Auth-service validates credentials, generates tokens
Auth-service sets refresh_token as httpOnly cookie (JS cannot access)
Auth-service returns only AccessToken in JSON body
Frontend stores access token in localStorage
All subsequent API calls include Authorization: Bearer <accessToken> + credentials: 'include'

Key implementation: src/Auth/Session.ts
tsexport async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    credentials: 'include',          // sends/receives cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  localStorage.setItem('access_token', data.data.token);
}
OAuth Login Flow (Google / GitLab)
Endpoints:

GET /authService/api/v1/auth/google/start
GET /authService/api/v1/auth/gitlab/start


User clicks "Continue with Google" → browser navigates to /auth/google/start
Auth-service redirects to Google OAuth
User authenticates with Google
Auth-service receives callback, creates/links user, generates tokens
Auth-service sets both cookies:

refresh_token — httpOnly, 7 days
access_token — readable by JS, 1 hour (needed after browser redirect)


Auth-service redirects browser to FRONTEND_URL
Frontend reads access_token cookie on landing, saves to localStorage, clears cookie

Key implementation: src/Auth/Session.ts
tsexport function readOAuthCookie(): void {
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  if (match) {
    localStorage.setItem('access_token', decodeURIComponent(match[1]));
    // clear the readable cookie — refresh_token httpOnly cookie stays
    document.cookie = 'access_token=; Max-Age=0; path=/';
  }
}
Why OAuth sets a readable cookie: Regular login is a fetch call that can return JSON. OAuth is a browser redirect — there is no JSON response the frontend can read. A readable access_token cookie is the only way to pass the token after a redirect. The refresh token remains httpOnly for security.
Token Refresh Flow
Endpoint: POST /authService/api/v1/refresh
All API calls go through fetchWithAuth(), which automatically handles 401 responses:

fetchWithAuth() makes request with Authorization: Bearer <token>
Server returns 401 (access token expired)
Frontend sends POST /authService/api/v1/refresh with credentials: 'include'
— the httpOnly refresh_token cookie is attached automatically by the browser
Auth-service validates cookie, rotates both tokens, sets new httpOnly cookie
Auth-service returns new AccessToken in JSON body
Frontend updates localStorage, retries original request

Key implementation: src/api/config.ts
tsexport async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('access_token');
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const refreshed = await refreshToken();   // POST /refresh with credentials: 'include'
    if (!refreshed) { logout(); return res; }
    return fetchWithAuth(url, options);       // retry original request with new token
  }
  return res;
}
Logout Flow
Endpoint: POST /authService/api/v1/logout

Frontend sends POST /authService/api/v1/logout with credentials: 'include'
Auth-service reads refresh token from httpOnly cookie
Auth-service revokes token in database
Auth-service clears cookie (Max-Age: -1)
Frontend clears localStorage and redirects to /login

Key implementation: src/Auth/LogOut.tsx
tsexport async function logout(): Promise<void> {
  await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
  localStorage.removeItem('access_token');
  window.location.href = '/login';
}

Real-time Notifications (WebSocket + STOMP)
After login the frontend opens a persistent WebSocket connection for push notifications.
Flow:

Login completes → connectNotifications(userId, accessToken) is called
Browser opens WebSocket to the gateway: wss://gateway/ws
STOMP CONNECT frame sent with Authorization: Bearer <token>
Server responds CONNECTED
Frontend subscribes to /user/{userId}/notifications
When another user shares a note → backend publishes to that topic
Frontend receives the message instantly → toast + bell badge update, no polling

Key implementation: src/api/notifications.ts
const client = new Client({
  brokerURL: `${WS_BASE}/ws`,
  connectHeaders: { Authorization: `Bearer ${token}` },
  onConnect: () => {
    client.subscribe(`/user/${userId}/notifications`, (msg) => {
      const notification = JSON.parse(msg.body);
      showToast(notification);
      incrementBadge();
    });
  },
});
client.activate();

Routes
PathComponentAuth requiredDescription/——Redirect to /notes or /login/loginLogIn.tsxNoEmail + password login, OAuth buttons/registerSignUp.tsxNoRegistration form/notesNotesList.tsxYesNotes list + editor — core deliverable/notes/:idNotesList.tsxYesSingle note editor/remindersReminders.tsxYesReminders grouped by urgency/public/:tokenPublicNote.tsxNoShared note view, no login required
Protected routes check localStorage for access_token on mount. If missing or expired, they attempt a silent refresh via the httpOnly cookie. If refresh fails, the user is redirected to /login.

Configuration
In development, the Vite dev server proxies all /authService/* requests to the auth-service. No .env file is required for the default local setup.
vite.config.ts
tsserver: {
  proxy: {
    '/authService': {
      target: 'http://localhost:8081',
      changeOrigin: true,
    },
  },
},
Important: credentials: 'include' must be set on every fetch call. Without it the browser will not attach the refresh_token cookie to requests, and will not store Set-Cookie headers from the auth-service response.
In production, the API Gateway handles CORS with Access-Control-Allow-Credentials: true. The Vite proxy is not involved.

Running Locally
Prerequisites

Node.js v20+
npm v9+
Auth-service running on http://localhost:8081

For the full stack (all services + PostgreSQL), see notes-cloud-infrastructure.
Steps
bash# Clone the repository
git clone https://github.com/notes-in-the-cloud/notes-cloud-frontend.git
cd notes-cloud-frontend

# Install dependencies (exact versions from package-lock.json)
npm ci

# Start the development server
npm run dev
App is available at http://localhost:5173

Available Scripts
bash# Development server with HMR at http://localhost:5173
npm run dev

# TypeScript type check + production build → dist/
npm run build

# ESLint code quality check
npm run lint

# Local preview of the production build
npm run preview

Docker
Build and Run
bash# Build image
docker build -t notes-cloud-frontend:latest .

# Run container
docker run -p 8080:8080 notes-cloud-frontend:latest
App is available at http://localhost:8080
How the Dockerfile Works
Multi-stage build — the final image contains only Nginx and the compiled static files:
Stage 1 — builder (node:20-alpine)
  ├── npm ci           ← installs all dependencies
  └── npm run build    ← TypeScript check + Vite bundle → dist/

Stage 2 — runtime (nginx:1.27-alpine)
  ├── copies dist/     ← only the compiled output (~2 MB)
  ├── copies nginx.conf
  └── nginx on port 8080  ← no Node.js, no npm, no dev deps
Final image size: ~40 MB (vs ~400 MB with Node included).
Nginx runs as the non-root nginx user — required for Kubernetes.
Nginx Configuration Notes

Listens on port 8080 — non-privileged, required for non-root user in Kubernetes
try_files $uri $uri/ /index.html — SPA routing, all unknown paths return index.html
JS/CSS assets cached for 1 year (Cache-Control: public, immutable) — safe because Vite hashes filenames on every build
index.html is never cached (no-store, no-cache) — users always receive the latest version
/health endpoint returns 200 OK — used by Kubernetes liveness probe
Security headers: X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, X-XSS-Protection


Kubernetes Deployment
The frontend is deployed as part of the notes-cloud platform. See notes-cloud-infrastructure for Kubernetes manifests.
Important: Client applications should access the API Gateway (port 8090), not the frontend service directly.
bash# Access via API Gateway (recommended)
kubectl port-forward -n notes-cloud svc/api-gateway 8090:8090

# Direct access to frontend (for debugging only)
kubectl port-forward -n notes-cloud svc/notes-frontend 8080:8080

Project Structure
notes-cloud-frontend/
├── public/                  # Static assets (favicon)
├── src/
│   ├── main.tsx             # Entry point — mounts <App />
│   ├── App.tsx              # Root component and route definitions
│   ├── types.ts             # Shared TypeScript types (Note, Reminder, Priority...)
│   ├── Auth/
│   │   ├── Session.ts       # Token storage, readOAuthCookie(), fetchWithAuth()
│   │   ├── LogIn.tsx        # Login form + OAuth buttons
│   │   ├── SignUp.tsx       # Registration form
│   │   └── LogOut.tsx       # Logout handler
│   ├── Notes/
│   │   ├── HeaderBar.tsx    # Navigation bar, notification bell + badge
│   │   ├── NotesList.tsx    # Notes list + editor (core deliverable)
│   │   ├── Reminders.tsx    # Reminders grouped by urgency and date
│   │   └── Reminders.css
│   └── api/
│       ├── config.ts        # API_BASE constant, fetchWithAuth() with auto-refresh
│       ├── notes.ts         # fetchNotes, createNote, updateNote, deleteNote
│       ├── reminders.ts     # fetchReminders, createReminder, updateReminder, deleteReminder
│       └── notifications.ts # STOMP client setup and topic subscription
├── index.html               # HTML shell with <div id="root">
├── vite.config.ts           # Vite config + dev proxy to auth-service
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint rules including react-hooks plugin
├── Dockerfile               # Multi-stage build
├── nginx.conf               # Production Nginx config
└── .github/workflows/       # CI/CD — lint + build + docker push on main

System Architecture
┌──────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  notes-cloud-        │────▶│   API Gateway    │────▶│  Auth Service   │
│  frontend            │     │   (port 8090)    │     │   (port 8081)   │
│  (React SPA)         │     │                  │     │                 │
│                      │     │  - CORS          │     │ - Login/Logout  │
│  - Notes UI          │     │  - JWT Valid.    │     │ - OAuth/OIDC    │
│  - Reminders UI      │     │  - Auth Proxy    │     │ - Token Mgmt    │
│  - Auth forms        │     │  - Credentials   │     │ - User Mgmt     │
│  - STOMP client      │     │                  │     │                 │
└──────────────────────┘     └──────────────────┘     └─────────────────┘
         │  WSS                        │
         │ (notifications)             ├──────────────▶ Notes Service
         └─────────────────────────────├──────────────▶ Reminder Service
                                       ├──────────────▶ Todo Service
                                       └──────────────▶ Sharing Service
Key points:

All HTTP requests go through the API Gateway — the frontend uses one base URL
credentials: 'include' is set on every fetch call — required for the httpOnly refresh token cookie
The refresh_token cookie is never readable by JavaScript — protected against XSS
The access_token lives in localStorage — available for Authorization headers
WebSocket connects to the Gateway for STOMP push notifications
In local development, the Vite dev proxy replaces the Gateway