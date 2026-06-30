# Stuart Authentication Foundation v2

**Status:** Phase 2 complete — HTTP boundary foundation in Experience Lab  
**Scope:** Experience Lab (`stuart-grafana-prototype`)  
**Date:** June 2026  

This document defines how Stuart moves from the current mock user system to real authentication. Phase 2 adds the HTTP client boundary; passwords, MFA verification, and Stuart Core connections are not implemented yet.

---

## 1. Audit of Current Mock Foundation

### 1.1 What exists today

| Component | Location | Current behavior |
|-----------|----------|------------------|
| Mock identity data | `src/auth/mockAuth.ts` | Hardcoded users, roles, security policy, audit events |
| Auth provider | `src/auth/AuthContext.tsx` | In-memory `isAuthenticated` flag; `signIn()` / `signOut()` toggle only |
| Session gate | `src/auth/SessionGate.tsx` | Renders `LoginScreen` when not authenticated |
| Login UI | `src/auth/LoginScreen.tsx` | Two-step UI (credentials → MFA placeholder); no validation |
| Header operator | `src/auth/HeaderOperator.tsx` | Displays mock current user; Sign Out clears local flag |
| Users settings | `src/App.tsx` → `UsersSettings` | Directory table, roles, sessions from mock data |
| Security settings | `src/auth/SecuritySettings.tsx` | Static policy display + mock audit table |
| Audit page | `src/App.tsx` → `AuditPage` | Merges `MOCK_USER_AUDIT_EVENTS` into audit history |

**Development default:** `DEFAULT_AUTHENTICATED_FOR_DEV = true` in `AuthContext.tsx` — reviewers land in the app without signing in.

### 1.2 What can stay (reuse in real auth)

| Area | Rationale |
|------|-----------|
| **React context pattern** (`AuthProvider` + `useAuth`) | Clean shell integration; extend with session loading, MFA state, and org scope |
| **Session gate** | Correct boundary between public login and authenticated shell |
| **Login flow shape** | Credentials → MFA challenge → shell is the right UX sequence |
| **Role names** | Owner, Admin, Operator, Viewer align with Python Stuart and product intent |
| **Role permission summaries** | `MOCK_STUART_ROLES` is a reasonable v1 permission matrix starting point |
| **Header operator component** | UI shell is correct; data source changes only |
| **Security settings layout** | Authentication / Access Control / Public Preview Safety sections map to real policy |
| **Users directory table** | Column model (user, role, MFA, status) is production-appropriate |
| **Audit event types** | Sign-in, MFA passed, role changed, session expired are required production events |
| **Public preview safety rules** | Must remain enforced until real auth ships |
| **Architecture comments** | Already document Cloudflare mock-only and Core boundaries |

### 1.3 What must change for real auth

| Area | Required change |
|------|-----------------|
| **`mockAuth.ts`** | Replace with typed API models + server-backed data; no hardcoded users in frontend |
| **`AuthContext`** | Bootstrap session from server; handle `loading`, `mfaRequired`, `sessionExpired`; remove dev auto-login in production |
| **`signIn` / `signOut`** | HTTP calls to Stuart auth service; server sets HttpOnly session cookie |
| **`LoginScreen`** | Credential validation, error messages, rate-limit feedback, real MFA verification |
| **`MockSession`** | Server-issued session ID, expiry, device fingerprint; never store secrets client-side |
| **`UsersSettings`** | Read/write via authorized API; invite, disable, role edit |
| **`SecuritySettings`** | Policy from server; toggles only for authorized roles |
| **Audit events** | Append-only backend log; frontend reads filtered stream |
| **Organization access** | Per-user org membership and role; not global role only |
| **Data layer** | All stewardship/Core paths must check auth + authorization server-side |

---

## 2. Current vs Target Behavior

### 2.1 Current (mock)

```
User opens app
  → DEFAULT_AUTHENTICATED_FOR_DEV may skip login
  → signIn() sets boolean true (no server)
  → MOCK_CURRENT_USER always returned
  → All data is mock/static in frontend bundle
  → signOut() sets boolean false
```

### 2.2 Target (real)

```
User opens app
  → Frontend calls GET /auth/session (credentials: include)
  → If no valid session: SessionGate shows LoginScreen
  → POST /auth/login with username/email + password
  → If MFA required: return mfa_challenge_id; show MFA screen
  → POST /auth/mfa/verify → server creates session (HttpOnly cookie)
  → Frontend receives user profile + org memberships + permissions
  → All API calls include session cookie; server enforces RBAC
  → Idle timeout / explicit signOut → server invalidates session
  → Audit log records every security event server-side
```

---

## 3. Target User Account Model

Canonical fields (API / database). Frontend may use camelCase equivalents.

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | UUID | Stable primary key; never reused |
| `display_name` | string | Operator-facing name (e.g. "Michael") |
| `username` | string | Unique login identifier (e.g. `mhatzopoulos`) |
| `email` | string | Unique; used for login, invites, recovery |
| `role` | enum | Global default role: `owner` \| `admin` \| `operator` \| `viewer` |
| `mfa_enabled` | boolean | Whether MFA is configured and active |
| `mfa_status` | enum | `enabled` \| `pending` \| `disabled` |
| `status` | enum | `active` \| `invited` \| `inactive` \| `locked` |
| `created_at` | ISO 8601 | Account creation timestamp |
| `last_login_at` | ISO 8601 \| null | Last successful full authentication |
| `failed_login_count` | integer | Consecutive failures; reset on success |
| `password_changed_at` | ISO 8601 \| null | For rotation policy enforcement |
| `invited_by` | user_id \| null | Who sent the invitation |
| `organization_memberships` | array | See §7 — overrides global role per org |

**Not stored in frontend:** password hashes, MFA secrets, backup code plaintext, session tokens.

**Password handling (server only, future):** bcrypt or Argon2id; never logged; never returned in API responses.

---

## 4. Role Model

Four roles are retained. Permissions are enforced **server-side**; UI hides unauthorized actions but is not the security boundary.

### Owner

- Full control over Stuart deployment, organizations, billing, and security policy
- Manage all users and roles
- Connect/disconnect Stuart Cores
- Approve high-risk steward actions
- Configure MFA policy and session rules
- Access all audit and billing data

### Admin

- Manage systems, users, and settings within assigned organizations
- Invite and disable users (cannot demote Owner)
- Configure providers, automation, and diagnostics
- Review and act on briefings
- View audit for assigned organizations
- **MFA required**

### Operator

- Day-to-day monitoring and interaction
- Review briefings and act on recommendations (within approval rules)
- Ask Stuart, run investigations, view operations consoles
- Cannot manage users, security policy, or billing
- MFA optional unless org policy requires it

### Viewer

- Read-only access to dashboards, briefings, and audit (as permitted)
- Cannot approve actions, change settings, or invoke write operations
- MFA optional

### Permission enforcement matrix (summary)

| Capability | Owner | Admin | Operator | Viewer |
|------------|:-----:|:-----:|:--------:|:------:|
| Billing & subscriptions | ✓ | — | — | — |
| Security policy | ✓ | — | — | — |
| User management | ✓ | ✓ | — | — |
| Organization management | ✓ | ✓ | — | — |
| Stuart Core connection | ✓ | ✓ | — | — |
| Settings (non-security) | ✓ | ✓ | — | — |
| Briefings & recommendations | ✓ | ✓ | ✓ | read |
| Audit (read) | ✓ | ✓ | ✓ | ✓ |
| Steward write actions | ✓ | ✓ | ✓ | — |

---

## 5. Session Model

### 5.1 Authenticated session

- Issued by Stuart auth service after successful login (+ MFA when required)
- Represented by **HttpOnly, Secure, SameSite** session cookie
- Session record server-side: `session_id`, `user_id`, `created_at`, `expires_at`, `last_activity_at`, `ip_hash`, `user_agent`, `mfa_verified_at`

### 5.2 Session timeout

- **Idle timeout:** 30 minutes (configurable; matches current mock policy)
- **Absolute maximum:** 24 hours (re-auth required regardless of activity)
- Frontend may show warning at T-5 minutes; server is authoritative

### 5.3 Refresh behavior

- **Sliding window:** each authenticated API request updates `last_activity_at`
- **No long-lived refresh tokens in localStorage** for browser sessions
- Optional: silent session extension endpoint if user is active and within policy
- Stuart Core connections use **separate** service credentials — not the operator browser session

### 5.4 Sign out

- `POST /auth/logout` invalidates server session and clears cookie
- Client clears in-memory auth state
- Audit: `user_signed_out`

### 5.5 Expired session

- Server returns `401` with `session_expired` code
- `SessionGate` redirects to login with message
- Audit: `session_expired` (already mocked in v1)

### 5.6 Audit logging (session events)

| Event | Actor | When |
|-------|-------|------|
| `user_signed_in` | user | Successful password verification |
| `mfa_challenge_issued` | system | MFA step started |
| `mfa_challenge_passed` | user | Valid TOTP/backup code |
| `mfa_challenge_failed` | user | Invalid MFA attempt |
| `user_signed_out` | user | Explicit logout |
| `session_expired` | system | Idle or absolute timeout |
| `session_revoked` | admin/system | Forced logout, lockout, password reset |

---

## 6. MFA Model (plan only — not implemented)

### 6.1 Strategy

MFA is **required for Owner and Admin** at launch. Operator and Viewer follow organization policy.

### 6.2 Methods (priority order)

| Method | Priority | Notes |
|--------|----------|-------|
| **TOTP authenticator app** | Preferred | Google Authenticator, Authy, etc.; RFC 6238 |
| **Backup codes** | Required companion | One-time use; generated at MFA enrollment; stored hashed server-side |
| **Email OTP** | Possible temporary | Acceptable for invite/onboarding only; not sole long-term method for privileged roles |

### 6.3 Enrollment flow (future)

1. User completes initial login
2. If role requires MFA and `mfa_status = pending`: force enrollment wizard
3. Display QR secret → user verifies one TOTP code → show backup codes once
4. Set `mfa_enabled = true`, `mfa_status = enabled`

### 6.4 Login flow with MFA (future)

1. Valid password → server returns `{ mfa_required: true, challenge_id }` (no session yet)
2. User enters TOTP or backup code
3. Server verifies → issues session cookie
4. Failed MFA increments counter; lockout after policy threshold

### 6.5 Explicitly not in v2 implementation

- WebAuthn / passkeys (future consideration)
- SMS MFA (avoid — SIM swap risk)
- Third-party IdP MFA delegation (requires explicit approval)

---

## 7. Organization Access Model

Stuart operators often steward **multiple organizations**. Access is two-dimensional:

```
Effective permission = organization_membership.role (if set) OR user.role (global default)
```

### Organization membership record

| Field | Description |
|-------|-------------|
| `organization_id` | Target org |
| `user_id` | Member |
| `role` | `admin` \| `operator` \| `viewer` (Owner is global) |
| `granted_by` | user_id |
| `granted_at` | timestamp |

### Rules

- Owner sees all organizations
- Admin/Operator/Viewer see only orgs where they have membership
- Environment selector and Core connection UI filter by membership
- Stuart Core API proxy checks: `session valid` + `MFA satisfied` + `org membership` + `role permits action`

---

## 8. Public Preview Safety Model

**Until real authentication is fully implemented and deployed:**

| Rule | Status |
|------|--------|
| Public Cloudflare site serves **mock data only** | **Required** |
| Live Stuart Core data exposure | **Disabled** |
| Customer / production data | **None** |
| Real billing or contact PII | **None** |
| Real credentials in frontend code or bundle | **Forbidden** |
| Auth bypass defaults (`DEFAULT_AUTHENTICATED_FOR_DEV`) | **Dev/local only**; must be `false` in production builds |

### Build-time safeguards (recommended)

- `VITE_PREVIEW_MODE=true` on Cloudflare Pages production branch
- API layer rejects Core proxy requests when preview flag is set
- Feature flag: `liveDataEnabled` — off until auth + authorization ship

---

## 9. Cloudflare Deployment Considerations

### 9.1 Current architecture

- **Frontend:** Cloudflare Pages (static Vite build)
- **Domain:** `stuartlab.signallabsystems.com` (preview)
- **No backend** in Experience Lab today

### 9.2 Target architecture options

| Option | Description | Recommendation |
|--------|-------------|----------------|
| **A. Stuart Auth API (separate service)** | Dedicated auth service behind Cloudflare; Pages frontend calls it | **Preferred** — clear boundary, shared with on-prem Stuart |
| **B. Cloudflare Workers BFF** | Workers validate session and proxy to Core | Good for preview; not a substitute for full auth service |
| **C. On-prem auth only** | Auth lives with Stuart Core; cloud is UI only | Required for customer deployments; cloud preview stays mock |

### 9.3 Cookie & CORS

- Auth API sets cookies on parent domain or dedicated auth subdomain
- `SameSite=Lax` minimum; `Secure` always in production
- CORS: allow only known Stuart frontend origins
- No session tokens in `localStorage` or URL query parameters

### 9.4 Pages environment variables (future)

```
VITE_AUTH_API_URL=https://auth.stuart.example
VITE_PREVIEW_MODE=true
VITE_REQUIRE_AUTH=false   # true when production auth ships
```

---

## 10. Stuart Core Integration Boundaries

```
┌─────────────────────┐         ┌─────────────────────┐         ┌─────────────────────┐
│  Stuart Frontend    │  cookie │  Stuart Auth API    │  creds  │  Stuart Core        │
│  (Cloudflare Pages) │ ──────► │  (session, MFA,     │ ──────► │  (per organization) │
│                     │         │   users, audit)     │         │                     │
└─────────────────────┘         └─────────────────────┘         └─────────────────────┘
        │                                   │
        │ mock data only                    │ never exposed to browser
        │ until auth complete               │ directly
        ▼                                   ▼
   Preview bundle                     Operator session ≠ Core service token
```

### Rules

1. **Browser never holds Stuart Core credentials**
2. **Core connection** is established server-side using org-scoped service identity
3. **Every Core API call** validates operator session + org membership + role
4. **Public preview frontend** must not embed Core URLs, API keys, or WebSocket endpoints
5. **Audit** of Core access is logged in both auth audit and Stuart Core audit streams

---

## 11. Implementation Phases

### Phase 0 — This document (complete)

- Architecture defined
- Mock UI foundation in place
- Security boundaries documented

### Phase 1 — Auth service skeleton (complete)

**Experience Lab frontend:**

- `src/services/auth/` — service abstraction, API contract, provider pattern
- `AuthContext` → `AuthService` → `MockAuthProvider` (UI no longer reads session from `mockAuth.ts`)
- `Session` model replaces boolean `isAuthenticated` internally (UI still exposes `isAuthenticated` for compatibility)
- `AuthStatus` placeholders: `initializing`, `session_expired`, `mfa_required` (only `authenticated` / `unauthenticated` active)
- `AuthError` types defined (not yet surfaced in UI)
- Environment: development uses `MockAuthProvider`; `ProductionAuthProvider` reserved, not enabled
- `mockAuth.ts` retained for catalog data only (users directory, security policy, audit samples)

**Not in Phase 1 (deferred to Phase 2+):**

- Stuart Auth API HTTP project
- User table, session table, password hash storage
- Real `POST /auth/login`, cookie-based sessions

### Phase 2 — HTTP boundary foundation (complete)

**Experience Lab frontend:**

- `authHttpClient.ts` — centralized HTTP client; mock transport with simulated latency
- `authEndpoints.ts` — `/api/auth/*` endpoint contracts
- `authHttpErrors.ts` — HTTP status → `AuthError` mapping (401, 403, 423, 500)
- `mockAuthSessionStore.ts` — in-memory session store behind mock HTTP
- `FetchAuthHttpClient` — production client reserved (`credentials: 'include'`); not enabled
- Flow: `AuthService` → `MockAuthProvider` → `AuthHttpClient` → mock responses
- Session bootstrap via `GET /api/auth/session` mock (~100ms); `AuthContext` starts `initializing`
- Cookie strategy documented — no tokens in `localStorage`, `sessionStorage`, or URL

**Not in Phase 2 (deferred to Phase 3+):**

- Real password validation
- HttpOnly cookie issuance from backend
- MFA verification
- `ProductionAuthProvider` / `FetchAuthHttpClient` activation

### Phase 3 — Credential validation & session cookies

- Real login validation with error states in `LoginScreen`
- HttpOnly session cookies
- Idle timeout enforcement
- Server-side audit log for sign-in / sign-out / expiry
- Lockout after `failed_login_count` threshold

### Phase 4 — MFA

- TOTP enrollment and verification
- Backup codes
- MFA challenge step wired to API (replace placeholder)
- Require MFA for Owner/Admin

### Phase 5 — User & role management UI

- Invite users, disable users, role editing
- `UsersSettings` backed by API
- Password reset flow
- Security settings read/write for Owner

### Phase 6 — Organization permissions

- Organization membership model
- Environment selector filtered by membership
- Per-org role overrides
- Authorization middleware on all data routes

### Phase 7 — Production preview hardening

- Disable mock data path when `VITE_PREVIEW_MODE=false`
- Enable authorized Core proxy for authenticated operators only
- Remove dev auth bypass from production builds
- Security review before customer data

---

## 12. UI Roadmap (future work)

| Screen / feature | Phase | Notes |
|------------------|-------|-------|
| Real login validation + errors | 2 | Invalid credentials, locked account, rate limit |
| MFA challenge (functional) | 3 | Replace placeholder; lockout messaging |
| MFA enrollment wizard | 3 | QR code, backup codes display |
| Password reset (email link) | 4 | Server-sent token; no secrets in frontend |
| Invite user flow | 4 | Email invite → set password → MFA enroll |
| Disable / reactivate user | 4 | Owner/Admin only |
| Role editing | 4 | With audit trail |
| Organization permissions UI | 5 | Per-org role assignment |
| Security policy editor | 4 | Session timeout, MFA policy, lockout rules |
| Session management (active sessions) | 4 | View/revoke other sessions |
| Audit trail for security actions | 2+ | Unified with main Audit page |
| Emergency lockout | 5 | Owner kills all sessions for org |

---

## 13. Mapping Mock Types to Target Model

| Mock (`StuartUser`) | Target API field |
|---------------------|------------------|
| `id` | `user_id` |
| `displayName` | `display_name` |
| `username` | `username` |
| `email` | `email` |
| `role` | `role` |
| `mfaEnabled` | `mfa_enabled` |
| `mfaStatus` | `mfa_status` |
| `accountStatus` | `status` |
| *(missing)* | `created_at` |
| *(missing)* | `last_login_at` |
| *(missing)* | `failed_login_count` |

---

## 14. References

| File | Purpose |
|------|---------|
| `src/auth/mockAuth.ts` | Mock catalog data (users, roles, policy); not session state |
| `src/services/auth/authService.ts` | Auth service singleton |
| `src/services/auth/authHttpClient.ts` | HTTP client (mock + reserved fetch) |
| `src/services/auth/authEndpoints.ts` | Endpoint contracts |
| `src/services/auth/authHttpErrors.ts` | HTTP → AuthError mapping |
| `src/services/auth/mockAuthSessionStore.ts` | Mock session store |
| `src/services/auth/MockAuthProvider.ts` | Active provider (routes through HTTP client) |
| `src/auth/AuthContext.tsx` | React session state; consumes `authService` |
| `src/auth/SessionGate.tsx` | Auth boundary |
| `src/auth/LoginScreen.tsx` | Login + MFA UI shell |
| `src/auth/HeaderOperator.tsx` | Operator identity in header |
| `src/auth/SecuritySettings.tsx` | Security policy display |
| `src/App.tsx` | `UsersSettings`, `AuditPage` integration |

---

## 15. Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth ownership | Stuart-owned auth service | Consistent with Python Stuart; no third-party dependency without approval |
| Session transport | HttpOnly cookies | XSS-resistant; standard for browser apps |
| MFA primary method | TOTP | Industry standard; works offline |
| Privileged MFA | Required for Owner/Admin | Protects billing, users, Core connections |
| Preview data | Mock only until Phase 6 | Prevents public data exposure |
| Core credentials | Server-side only | Browser never holds Core secrets |
| RBAC enforcement | Server-side | UI gating is convenience, not security |

---

## 16. Phase 1 Implementation — Service Abstraction

### 16.1 Architecture

```
┌──────────────┐     ┌──────────────┐     ┌───────────────────┐     ┌────────────────────────┐
│  UI Layer    │     │ AuthContext  │     │   AuthService     │     │  AuthProvider          │
│ LoginScreen  │────►│ useAuth()    │────►│  (singleton)      │────►│  MockAuthProvider ✓    │
│ HeaderOperator│    │ SessionGate  │     │                   │     │  ProductionAuthProvider│
│ UsersSettings│     └──────────────┘     └───────────────────┘     │  (reserved)            │
└──────────────┘                                                      └────────────────────────┘
                                                                              │
                                                                              ▼
                                                                    mockAuth.ts (catalog only)
```

### 16.2 Service interfaces (`AuthApi`)

| Method | Purpose | Phase 1 behavior |
|--------|---------|------------------|
| `signIn(request)` | Establish session | Mock: creates preview session |
| `signOut()` | End session | Mock: clears in-memory session |
| `getCurrentSession()` | Read active session | Mock: returns in-memory session |
| `refreshSession()` | Extend idle window | Mock: updates `expiresAt` |
| `verifyMfa(request)` | Complete MFA step | Mock: sets `mfaVerified` (placeholder) |

### 16.3 Session model

```typescript
Session {
  sessionId: string
  authenticated: boolean
  currentUser: StuartUser
  createdAt: string          // ISO 8601
  expiresAt: string          // ISO 8601
  authenticationMethod: 'preview' | 'password' | 'sso'
  mfaVerified: boolean
  // Display metadata (UI compatibility)
  sessionType, authenticatedAt, device, location, durationLabel
}
```

### 16.4 Provider pattern

| Provider | When used | Phase 1 status |
|----------|-----------|----------------|
| `MockAuthProvider` | Development / preview | **Active** |
| `ProductionAuthProvider` | Production Stuart Auth API | **Reserved** — not enabled |

`resolveAuthProviderKind()` always returns `mock` until Phase 2. Setting `VITE_AUTH_PROVIDER=production` logs a warning only.

### 16.5 Environment configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_AUTH_DEV_BOOTSTRAP` | `true` in development | Auto-authenticate on load for review |
| `VITE_AUTH_PROVIDER` | `mock` | Reserved switch for `ProductionAuthProvider` |
| `import.meta.env.PROD` | — | Drives `getAuthDeploymentEnvironment()` |

### 16.6 Auth status & errors

**Status:** `initializing` | `authenticated` | `unauthenticated` | `session_expired` | `mfa_required`

**Errors (types only):** `InvalidCredentials`, `SessionExpired`, `MfaRequired`, `AccountLocked`, `ServerUnavailable`

### 16.7 What unchanged in Phase 1

- Login, Header, Users, Security, Audit, Home UI
- Sign In / Sign Out user flows
- All stewardship data remains mock

---

## 17. Phase 2 Implementation — HTTP Boundary

### 17.1 Architecture

```
┌────────────┐   ┌─────────────┐   ┌─────────────────┐   ┌──────────────────┐   ┌─────────────────────┐
│ UI Layer   │──►│ AuthContext │──►│   AuthService   │──►│ MockAuthProvider │──►│   AuthHttpClient    │
└────────────┘   └─────────────┘   └─────────────────┘   └──────────────────┘   │ MockAuthHttpClient ✓ │
                                                                                  │ FetchAuthHttpClient  │
                                                                                  │ (reserved)           │
                                                                                  └──────────┬───────────┘
                                                                                             │
                                                                                             ▼
                                                                                  MockAuthSessionStore
```

### 17.2 Endpoint contracts

| Method | Endpoint | Mock delay | Purpose |
|--------|----------|------------|---------|
| `GET` | `/api/auth/session` | ~100ms | Bootstrap / read session |
| `POST` | `/api/auth/login` | ~250ms | Sign in |
| `POST` | `/api/auth/logout` | ~150ms | Sign out |
| `POST` | `/api/auth/refresh` | ~120ms | Extend idle window |
| `POST` | `/api/auth/mfa` | ~200ms | MFA verify (placeholder) |
| `POST` | `/api/auth/password-reset` | ~180ms | Contract only |

Base path override: `VITE_AUTH_API_URL`

### 17.3 Session bootstrap flow

```
App mount
  → AuthContext status: initializing
  → SessionGate: existing loading state (null render)
  → authService.initialize()
  → MockAuthProvider.getCurrentSession()
  → AuthHttpClient.getSession() [~100ms]
  → MockAuthSessionStore (bootstrap session if dev flag set)
  → AuthContext status: authenticated | unauthenticated
  → SessionGate renders shell or LoginScreen
```

### 17.4 Cookie strategy (production target)

```
Browser ──(HttpOnly, Secure, SameSite cookie)──► Stuart Auth API ──► Session validation
```

**Forbidden in browser:** `localStorage`, `sessionStorage`, URL query tokens.

`FetchAuthHttpClient` uses `credentials: 'include'` only. Not enabled in Phase 2.

### 17.5 HTTP error mapping

| HTTP status | AuthError |
|-------------|-----------|
| 401 | `InvalidCredentials` |
| 403 | `MfaRequired` |
| 419 / 440 | `SessionExpired` |
| 423 | `AccountLocked` |
| 500+ | `ServerUnavailable` |

### 17.6 What unchanged in Phase 2

- All UI screens and flows
- No real passwords, MFA, Core, or Organizations
- `ProductionAuthProvider` not enabled
- `mockAuth.ts` remains catalog-only

---

*This document should be updated when implementation phases complete or architecture decisions change.*
