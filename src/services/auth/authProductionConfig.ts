/**
 * Production Stuart Authentication configuration (contracts only).
 * See docs/authentication_foundation_v2.md §18.
 */

import { AUTH_ENDPOINTS } from './authEndpoints'

export const PRODUCTION_AUTH_UNAVAILABLE_MESSAGE =
  'Stuart authentication is temporarily unavailable. Please try again later or contact your administrator.'

export const PRODUCTION_AUTH_NOT_IMPLEMENTED_MESSAGE =
  'This authentication capability is not yet available.'

export const PRODUCTION_AUTH_CONFIG = {
  apiBaseUrl: (import.meta.env.VITE_AUTH_API_URL as string | undefined) ?? '/api/auth',
  requestTimeoutMs: 15_000,
  cookieExpectations: {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax' as const,
    description: 'Session cookies issued by Stuart Auth API — never readable from JavaScript.',
  },
  retryPolicy: {
    maxAttempts: 2,
    backoffMs: 500,
  },
  endpoints: {
    login: AUTH_ENDPOINTS.login,
    logout: AUTH_ENDPOINTS.logout,
    session: AUTH_ENDPOINTS.session,
    refresh: AUTH_ENDPOINTS.refresh,
    mfa: AUTH_ENDPOINTS.mfa,
    passwordReset: AUTH_ENDPOINTS.passwordReset,
  },
} as const

export type ProductionAuthConfig = typeof PRODUCTION_AUTH_CONFIG
