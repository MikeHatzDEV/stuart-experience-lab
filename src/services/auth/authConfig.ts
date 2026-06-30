/**
 * Auth environment and provider selection.
 *
 * Development → MockAuthProvider
 * Production  → ProductionAuthProvider (reserved; not enabled until Phase 2+)
 */

import type { AuthProviderKind } from './authProvider'

export type AuthDeploymentEnvironment = 'development' | 'production'

export function getAuthDeploymentEnvironment(): AuthDeploymentEnvironment {
  return import.meta.env.PROD ? 'production' : 'development'
}

/**
 * Resolve which provider implementation to load.
 * Phase 1: always mock. ProductionAuthProvider is reserved for Phase 2+.
 */
export function resolveAuthProviderKind(): AuthProviderKind {
  if (import.meta.env.VITE_AUTH_PROVIDER === 'production') {
    console.warn(
      '[auth] VITE_AUTH_PROVIDER=production is reserved — MockAuthProvider remains active until Phase 2.',
    )
  }
  return 'mock'
}

/** Dev default: skip login on first load (Experience Lab review convenience). */
export function isDevSessionBootstrapEnabled(): boolean {
  const flag = import.meta.env.VITE_AUTH_DEV_BOOTSTRAP as string | undefined
  if (flag === 'false') return false
  if (flag === 'true') return true
  return getAuthDeploymentEnvironment() === 'development'
}
