# Live Streaming Admin Panel (Next.js 16)

Administrative web console for the Live Streaming Platform.

---

## 1. Getting Started

Run the development server (configured to run on **Port 3001**):

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 2. Environment Configuration (`.env.local`)

```env
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 3. Architecture & Features (Phase 3.5 Integrated)

- **Port 3001 Default**: Configured in `package.json` scripts (`next dev -p 3001`) and `.env.local`.
- **Backend Authentication Mapping**: Fully integrated with backend Admin endpoints (`/api/v1/admin/auth/login`, `/api/v1/admin/auth/refresh`, `/api/v1/admin/auth/logout`, `/api/v1/admin/auth/me`).
- **Automatic Refresh Token Rotation**: Centralized Axios client (`src/services/api/client.ts`) handles 401 Unauthorized errors by queueing requests, refreshing access tokens, and retrying failed calls.
- **RBAC UI Protection**: Dynamic navigation and action button guards using `hasPermission("users:read")`, `hasPermission("users:write")`, and `hasPermission("users:ban")`.
- **User Management Integration (Phase 2 complete)**: Fully connected to `/api/v1/admin/users` with server-side pagination, search, status/verification/**auth-provider** filters, **sort** (backend whitelist), CSV export, full detail drawer (Overview / Account / Media & Privacy / Onboarding / **Moderation History** / Sessions), **Edit dialog** (all Phase 2 profile fields with dirty-field diffing), **Warn dialog**, suspend/ban dialogs, bulk actions, avatar/cover display, onboarding progress, and verified badges (email/phone).
- **Stacked Toast System**: Global reusable notifications via `import { toast } from "@/components/ui/toast"`.
