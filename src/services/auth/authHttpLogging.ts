/**
 * Authentication HTTP logging boundaries.
 *
 * Safe to log:
 * - request IDs
 * - timestamps
 * - endpoint paths (not bodies)
 * - HTTP method
 * - duration
 * - HTTP status code
 *
 * Never log:
 * - passwords
 * - MFA codes
 * - cookies
 * - session identifiers
 * - authentication secrets
 * - request or response bodies containing credentials
 *
 * See docs/authentication_foundation_v2.md §18.6
 */

export type SafeAuthRequestLog = {
  requestId: string
  timestamp: string
  method: string
  endpoint: string
  durationMs: number
  status?: number
}

export function createAuthRequestId(): string {
  return `auth-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function logAuthRequestSafe(meta: SafeAuthRequestLog): void {
  if (!import.meta.env.DEV) return
  console.info('[stuart-auth]', {
    requestId: meta.requestId,
    timestamp: meta.timestamp,
    method: meta.method,
    endpoint: meta.endpoint,
    durationMs: meta.durationMs,
    status: meta.status,
  })
}
