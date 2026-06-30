# Website Integration — Domain Architecture

Foundation v3 · Platform version `0.2.2-Alpha_v2`

## One application

`stuart-grafana-prototype` is the single React application for both the public website and the Stuart Experience Platform. The separate `signal-lab-systems-website` project was a temporary prototype only and is not maintained.

## Public website structure

| Route | Role |
|-------|------|
| `/` | **Public website** — landing page at `https://signallabsystems.com/` |
| `/login` | **Authentication** — existing login screen (mock until central Stuart auth) |
| `/organizations` | **Organization selection** — bridge between authentication and platform |
| `/app` | **Experience Platform** — full Stuart product shell (unchanged) |

## Approved user journey

```
https://signallabsystems.com/
        ↓
   /  Landing
        ↓  [Access Stuart]
   /login  Authentication
        ↓
   /organizations  Organization selection
        ↓  [Open Stuart]
   /app  Experience Platform
```

### Architecture layers

- **Authentication** determines WHO the user is.
- **Organization selection** determines WHICH environment the user wishes to access.
- **Experience Platform** operates within the selected organization context.

When `VITE_AUTH_DEV_BOOTSTRAP` is enabled (development default), `/app` still requires organization selection in the current session unless the operator has already chosen an organization via **Open Stuart**.

## Organization selection (v1)

Foundation v1 exposes a single organization:

| Field | Value |
|-------|--------|
| Organization | Signal Lab |
| Description | Primary development and testing environment for Stuart. |
| Status | Healthy |
| Role | Owner |
| Primary Stuart Core | COMMS-01 (Planned) |

Even with one organization, operators see the selection page to establish the workflow before multiple organizations exist.

Organization creation, Stuart Core enrollment, and production authentication are not implemented.

## Landing page

The root URL is a minimal public front door:

- Signal Lab Systems branding
- Centered Stuart Orb
- Mission: Observe · Understand · Act
- Single CTA: **Access Stuart** → `/login`
- Footer placeholders (Documentation, Downloads, Support, Contact) — disabled
- Platform version from `package.json`

## Future routes (not implemented)

- Downloads
- Documentation
- Support
- Account / customer portal
- Organization management

## Principles

- The public website stays intentionally lightweight.
- The Experience Platform remains the primary product.
- Marketing content must not dominate development effort.

## Version

Platform version is the single source of truth in `package.json`, consumed by `src/app/version.ts`.
