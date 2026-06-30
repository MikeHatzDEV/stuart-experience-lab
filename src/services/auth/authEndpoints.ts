/**
 * Stuart Authentication API endpoint contracts.
 * Production requests use credentials: 'include' (HttpOnly cookies).
 * See docs/authentication_foundation_v2.md §17.
 */

/** Base path for Stuart Auth API (override via VITE_AUTH_API_URL in production). */
export const AUTH_API_BASE_PATH =
  (import.meta.env.VITE_AUTH_API_URL as string | undefined) ?? '/api/auth'

export const AUTH_ENDPOINTS = {
  login: `${AUTH_API_BASE_PATH}/login`,
  logout: `${AUTH_API_BASE_PATH}/logout`,
  session: `${AUTH_API_BASE_PATH}/session`,
  refresh: `${AUTH_API_BASE_PATH}/refresh`,
  mfa: `${AUTH_API_BASE_PATH}/mfa`,
  passwordReset: `${AUTH_API_BASE_PATH}/password-reset`,
} as const

export type AuthEndpointKey = keyof typeof AUTH_ENDPOINTS
