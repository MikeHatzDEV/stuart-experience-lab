import type { AuthProvider } from './authProvider'
import type {
  AuthStatus,
  MfaVerifyRequest,
  MfaVerifyResult,
  Session,
  SignInRequest,
  SignInResult,
} from './authTypes'

/**
 * Production auth provider — reserved for Stuart Auth API (Phase 2+).
 * Not enabled: all methods return ServerUnavailable until HTTP integration ships.
 */
export class ProductionAuthProvider implements AuthProvider {
  private unavailable(): never {
    throw new Error(
      'ProductionAuthProvider is not enabled. Set VITE_AUTH_PROVIDER=mock or complete Phase 2.',
    )
  }

  getBootstrapState(): { status: AuthStatus; session: Session | null } {
    return { status: 'unauthenticated', session: null }
  }

  async getCurrentSession(): Promise<Session | null> {
    return null
  }

  async signIn(_request: SignInRequest): Promise<SignInResult> {
    return {
      success: false,
      error: {
        code: 'ServerUnavailable',
        message: 'Stuart Auth API is not connected.',
      },
    }
  }

  async signOut(): Promise<void> {
    this.unavailable()
  }

  async refreshSession(): Promise<Session | null> {
    return null
  }

  async verifyMfa(_request: MfaVerifyRequest): Promise<MfaVerifyResult> {
    return {
      success: false,
      error: {
        code: 'ServerUnavailable',
        message: 'Stuart Auth API is not connected.',
      },
    }
  }
}
