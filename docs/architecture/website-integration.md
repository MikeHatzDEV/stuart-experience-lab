# Website Integration — Domain Architecture

Foundation v1 · Platform version `0.2.0-Alpha_v2`

## One application

`stuart-grafana-prototype` is the single React application for both the public website and the Stuart Experience Platform. The separate `signal-lab-systems-website` project was a temporary prototype only and is not maintained.

## User journey

```
www.signallabsystems.com
        ↓
   /  Landing Page
        ↓
   /login  Login (mock authentication)
        ↓
   /app  Stuart Experience Platform
```

When `VITE_AUTH_DEV_BOOTSTRAP` is enabled (development default), `/app` may load with an auto-established mock session. Otherwise the mock credentials → MFA → Access Stuart flow applies before entering `/app`.

## Route map

| Route | Purpose |
|-------|---------|
| `/` | Public landing — introduce Stuart, Access Stuart CTA |
| `/login` | Authentication entry (no backend in v1) |
| `/app` | Full Experience Platform (unchanged product shell) |

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
