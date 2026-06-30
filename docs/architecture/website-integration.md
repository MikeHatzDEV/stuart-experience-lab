# Website Integration — Domain Architecture

Foundation v2 · Platform version `0.2.1-Alpha_v2`

## One application

`stuart-grafana-prototype` is the single React application for both the public website and the Stuart Experience Platform. The separate `signal-lab-systems-website` project was a temporary prototype only and is not maintained.

## Public website structure

| Route | Role |
|-------|------|
| `/` | **Public website** — landing page at `https://signallabsystems.com/` |
| `/login` | **Authentication** — existing login screen (mock until central Stuart auth) |
| `/app` | **Experience Platform** — full Stuart product shell (unchanged) |

## User journey

```
https://signallabsystems.com/
        ↓
   /  Public landing
        ↓  [Access Stuart]
   /login  Authentication
        ↓
   /app  Experience Platform
```

When `VITE_AUTH_DEV_BOOTSTRAP` is enabled (development default), `/app` may load with an auto-established mock session. Otherwise the existing mock credentials → MFA → Access Stuart flow applies before entering `/app`.

## Landing page (v2)

The root URL is a minimal public front door:

- Signal Lab Systems branding
- Centered Stuart Orb
- Mission: Observe · Understand · Act
- Single CTA: **Access Stuart** → `/login`
- Footer placeholders (Documentation, Downloads, Support, Contact) — disabled
- Platform version from `package.json`

No downloads, accounts, documentation content, or marketing sections.

## Future routes (not implemented)

- Downloads
- Documentation
- Support
- Account / customer portal

## Principles

- The public website stays intentionally lightweight.
- The Experience Platform remains the primary product.
- Marketing content must not dominate development effort.

## Version

Platform version is the single source of truth in `package.json`, consumed by `src/app/version.ts`.
