# ADR-001 — Central Stuart Authentication

| Field | Value |
|-------|-------|
| **Status** | APPROVED |
| **Date** | 2026-06-08 |
| **Decision owner** | Signal Lab Systems |
| **Decision** | Option B — Central Stuart Authentication Service |

---

## 1. Problem Statement

Stuart is deployed across many customer environments. Each environment runs a **Stuart Core** that observes networks, assets, services, and operational reality.

If every Stuart Core maintained its own:

- user accounts
- passwords
- MFA enrollment and verification
- sessions
- permissions

…identity management would be **duplicated** across every customer installation. Operators would need separate credentials per Core. MFA would be configured repeatedly. Permissions would diverge. Security audits would fragment. Onboarding and offboarding would not scale.

This model fails as Stuart grows from a handful of deployments to thousands of customer organizations.

Stuart requires a **single, authoritative identity layer** that sits above individual Cores and governs who may access which organization and which Core.

---

## 2. Decision

**Approved architecture: Option B — Central Stuart Authentication Service**

Identity, authentication, and organization-level access are owned by a dedicated **Stuart Authentication Service**. Stuart Core does not manage users, passwords, or sessions. The **Experience Platform** presents authenticated operators with the correct organization and Core context.

### Official platform flow

```
signallabsystems.com
        ↓
Marketing Website
        ↓
Login / Access Stuart
        ↓
Stuart Authentication Service
        ↓
Organizations
        ↓
Available Stuart Cores
        ↓
Stuart Experience Platform
        ↓
Selected Stuart Core
```

This is the foundation for all future authentication, organizations, permissions, and Stuart Core connectivity.

---

## 3. Component Responsibilities

### Marketing Website (`signallabsystems.com`)

**Responsible for:**

- Product information
- Pricing
- Documentation
- Downloads
- Support

**Not responsible for:**

- Authentication
- Operational or stewardship data
- Stuart Core connectivity

---

### Stuart Authentication Service

**Responsible for:**

- User accounts
- Passwords
- MFA
- Sessions
- Organizations
- Invitations
- Permissions
- Authentication auditing

**Not responsible for:**

- Networks
- Assets
- Monitoring
- Recommendations
- Stewardship execution inside a Core

---

### Stuart Core

**Responsible for:**

- Observation
- Knowledge
- Assets
- Networks
- Services
- Applications
- Projects
- Recommendations
- Briefings

**Not responsible for:**

- Identity
- Passwords
- User accounts
- Cross-organization membership

---

### Stuart Experience Platform

**Responsible for:**

- Presenting **authenticated** users with the correct **organization** and **Stuart Core**
- Operator-facing shell for Home, consoles, settings, and briefings
- Enforcing that only authorized sessions reach Core-backed data

**Not responsible for:**

- Owning identity records (delegates to Stuart Authentication Service)
- Duplicating permission policy (reads from auth service)

---

## 4. Future Login Flow

Intended operator experience:

```
Customer visits signallabsystems.com
        ↓
Clicks "Login" / "Access Stuart"
        ↓
Authenticates (Stuart Authentication Service)
        ↓
Selects Organization
        ↓
Selects Stuart Core (if multiple exist)
        ↓
Enters Stuart Experience Platform
        ↓
Platform connects to selected Stuart Core with authorized session context
```

Session cookies are issued by the Authentication Service. The Experience Platform never stores passwords or long-lived tokens in browser storage. Stuart Core validates that the operator session is authorized for the requested organization and Core before returning operational data.

---

## 5. Why This Was Chosen

| Benefit | Description |
|---------|-------------|
| **Single identity system** | One account per operator across all organizations and Cores |
| **Scales to thousands of customers** | Identity policy is centralized, not replicated per deployment |
| **Centralized MFA** | Owner/Admin MFA enforced once, consistently |
| **Centralized user management** | Invite, disable, role change, and audit in one place |
| **Centralized permissions** | Organization membership and role model owned by auth service |
| **No duplicated authentication** | Cores focus on stewardship, not identity |
| **Cleaner Stuart Core architecture** | Core trusts auth service; smaller security surface per installation |
| **Enterprise readiness** | Aligns with how SaaS platforms separate control plane (identity) from data plane (Core) |

---

## 6. Consequences

### Positive

- Simpler Stuart Core — no user database, password hashes, or session store in Core
- Professional, enterprise-grade architecture
- Scales with customer count without multiplying identity systems
- Centralized security policy, MFA, and audit
- Clear path to cloud-hosted Experience Platform and multi-tenant operations

### Negative

- Requires building and operating a **separate authentication service**
- Requires an **organization membership model** and APIs
- Adds another backend service to deploy, monitor, and secure
- Experience Platform and Core must integrate with auth service before live customer data is exposed

### Neutral / follow-on work

- Public preview (Cloudflare) remains **mock-data only** until auth service is live and `VITE_AUTH_BACKEND_ENABLED` is deliberately enabled
- Python Stuart and Experience Lab frontend auth work converges on this service as the single source of truth

---

## 7. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         signallabsystems.com                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Marketing Website                                   │  │
│  │   Product · Pricing · Docs · Downloads · Support                      │  │
│  │   (no auth · no operational data)                                     │  │
│  └───────────────────────────────┬───────────────────────────────────────┘  │
│                                  │ Login / Access Stuart                   │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   Stuart Authentication Service                              │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐  │
│  │   Users     │ │  Passwords  │ │     MFA      │ │     Sessions        │  │
│  └─────────────┘ └─────────────┘ └──────────────┘ └─────────────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐  │
│  │Organizations│ │ Invitations │ │ Permissions  │ │  Auth audit log     │  │
│  └─────────────┘ └─────────────┘ └──────────────┘ └─────────────────────┘  │
│                                                                              │
│  HttpOnly session cookies · no identity in Core · no ops data here          │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
         ┌──────────────────┐         ┌──────────────────┐
         │  Organization A  │         │  Organization B  │
         │  Stuart Core(s)  │         │  Stuart Core(s)  │
         └────────┬─────────┘         └────────┬─────────┘
                  │                            │
                  └────────────┬───────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   Stuart Experience Platform                                 │
│   Authenticated shell · org/Core selector · consoles · briefings · Home   │
│   (presents authorized context · does not own identity)                   │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ authorized Core API (server-side)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Selected Stuart Core                                 │
│   Observation · Knowledge · Assets · Networks · Services · Briefings        │
│   (no users · no passwords · no sessions)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Cross References

| Document | Location | Relationship |
|----------|----------|--------------|
| Authentication Foundation v2 | [`docs/authentication_foundation_v2.md`](../authentication_foundation_v2.md) | Detailed auth models, phases, HTTP boundary, production provider skeleton |
| Authentication Phase 1 | Foundation v2 §11, §16 | Auth service abstraction, provider pattern, session model |
| Authentication Phase 2 | Foundation v2 §11, §17 | HTTP client boundary, endpoint contracts, mock transport |
| Authentication Phase 3 | Foundation v2 §11, §18 | Production provider skeleton, environment switching, graceful failure |

The Experience Lab implementation (`src/services/auth/`) is exploratory frontend infrastructure aligned with this ADR. It does not replace the Central Authentication Service — it prepares the platform to consume it.

---

## 9. Decision Log

| ID | Choice | Rationale |
|----|--------|-----------|
| ADR-001 | Option B — Central Stuart Authentication | Eliminates per-Core identity duplication; scales to enterprise multi-tenant operations |
| Rejected | Per-Core authentication | Duplicates users, MFA, and permissions; does not scale |
| Session transport | HttpOnly cookies via Auth Service | Documented in Authentication Foundation v2 |
| Core boundary | Core never stores identity | Keeps stewardship domain focused and security surface smaller |

---

## 10. Approval

This ADR is **APPROVED** and supersedes any informal assumption that Stuart Core would own operator identity.

Future ADRs may refine organization permissions, Core connection tokens, and on-prem vs cloud deployment — but they must remain consistent with **central authentication** as defined here.

---

*ADR-001 · Signal Lab Systems · Central Stuart Authentication*
