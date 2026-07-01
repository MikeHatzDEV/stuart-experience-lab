# Website Integration — Domain Architecture

Foundation v4 · Platform version `0.2.3-Alpha_v2`

## One application

`stuart-grafana-prototype` is the single React application for both the public website and the Stuart Experience Platform.

## Public website structure

| Route | Role |
|-------|------|
| `/` | **Public website** — landing page |
| `/login` | **Sign in** — mock session flow (login integration future) |
| `/register` | **Account creation** — real Stuart Authentication Service |
| `/organizations` | **Organization selection** |
| `/app` | **Experience Platform** (unchanged) |

## Registration integration (v1)

```
Website (/register)
        ↓  POST /auth/register
Stuart Authentication Service (0.3.1-Alpha_v2)
        ↓
Future Email Verification
        ↓
Future MFA
        ↓
Future Login
```

### Responsibility split

| Layer | Owns |
|-------|------|
| **Website** | Forms, navigation, client validation, user experience |
| **Authentication Service** | Users, password hashing, server validation, duplicate email checks |

Registration **does not** sign in, issue sessions, or navigate to `/app`.

### Configuration

| Variable | Purpose |
|----------|---------|
| `VITE_STUART_AUTH_SERVICE_URL` | Base URL for Stuart Authentication Service (no trailing slash) |

Development uses Vite proxy: `/stuart-auth` → `http://127.0.0.1:8100`.

API client: `src/services/stuartAuthApi/`

## Approved user journey (sign-in path)

```
/  Landing → /login → /organizations → /app
```

## Account creation journey

```
/  Landing → /login → [Create Account] → /register → success message
```

No automatic login after registration.

## Organization selection (v1)

Unchanged — single Signal Lab organization card before `/app`.

## Principles

- The public website stays intentionally lightweight.
- The Experience Platform remains the primary product.
- Marketing content must not dominate development effort.

## Version

Platform version is the single source of truth in `package.json`, consumed by `src/app/version.ts`.

Authentication Service version (`0.3.1-Alpha_v2`) is independent.
