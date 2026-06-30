/**
 * Auth environment and provider selection.
 *
 * development → MockAuthProvider
 * preview     → MockAuthProvider
 * production  → ProductionAuthProvider (requires VITE_AUTH_BACKEND_ENABLED=true)
 *
 * See docs/authentication_foundation_v2.md §18.4
 */

import type { AuthProviderKind } from './authProvider'

export type AuthRuntimeEnvironment = 'development' | 'preview' | 'production'

/** @deprecated Use getAuthRuntimeEnvironment */
export type AuthDeploymentEnvironment = 'development' | 'production'

export function getAuthRuntimeEnvironment(): AuthRuntimeEnvironment {
  const configured = import.meta.env.VITE_AUTH_RUNTIME as string | undefined
  if (configured === 'development' || configured === 'preview' || configured === 'production') {
    return configured
  }
  if (import.meta.env.PROD) {
    return 'preview'
  }
  return 'development'
}

/** @deprecated Use getAuthRuntimeEnvironment */
export function getAuthDeploymentEnvironment(): AuthDeploymentEnvironment {
  return getAuthRuntimeEnvironment() === 'production' ? 'production' : 'development'
}

/**
 * Stuart Auth API backend gate.
 * Production provider is only active when runtime is production AND backend is enabled.
 */
export function isProductionAuthBackendEnabled(): boolean {
  return import.meta.env.VITE_AUTH_BACKEND_ENABLED === 'true'
}

/**
 * Resolve which provider implementation AuthService loads.
 * Default: mock for development and preview builds.
 */
export function resolveAuthProviderKind(): AuthProviderKind {
  const runtime = getAuthRuntimeEnvironment()

  if (runtime === 'production' && isProductionAuthBackendEnabled()) {
    return 'production'
  }

  if (runtime === 'production' && !isProductionAuthBackendEnabled()) {
    if (import.meta.env.DEV) {
      console.info(
        '[auth] production runtime selected but VITE_AUTH_BACKEND_ENABLED is not true — MockAuthProvider remains active.',
      )
    }
  }

  return 'mock'
}

/** Dev default: skip login on first load (Experience Lab review convenience). */
export function isDevSessionBootstrapEnabled(): boolean {
  const flag = import.meta.env.VITE_AUTH_DEV_BOOTSTRAP as string | undefined
  if (flag === 'false') return false
  if (flag === 'true') return true
  return getAuthRuntimeEnvironment() === 'development'
}
