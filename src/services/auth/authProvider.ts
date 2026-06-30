import type { AuthApi } from './authApi'
import type { AuthStatus, Session } from './authTypes'

/**
 * Provider interface — swap MockAuthProvider for ProductionAuthProvider without UI changes.
 */
export interface AuthProvider extends AuthApi {
  /** Synchronous bootstrap for initial render (avoids login flash in dev). */
  getBootstrapState(): { status: AuthStatus; session: Session | null }
}

export type AuthProviderKind = 'mock' | 'production'
