import { resolveAuthProviderKind } from './authConfig'
import { MockAuthProvider } from './MockAuthProvider'
import { ProductionAuthProvider } from './ProductionAuthProvider'
import type { AuthProvider } from './authProvider'
import type {
  AuthStatus,
  MfaVerifyRequest,
  MfaVerifyResult,
  Session,
  SignInRequest,
  SignInResult,
} from './authTypes'

function createProvider(): AuthProvider {
  const kind = resolveAuthProviderKind()

  if (kind === 'production') {
    // Reserved — returns unauthenticated until Phase 2 HTTP integration.
    return new ProductionAuthProvider()
  }

  return new MockAuthProvider()
}

/**
 * AuthService — single entry point for UI and AuthContext.
 *
 * AuthService → AuthProvider → AuthHttpClient → mock/production transport
 * UI never talks to mockAuth.ts for session state or fetch() directly.
 */
export class AuthService {
  private readonly provider: AuthProvider

  constructor(provider?: AuthProvider) {
    this.provider = provider ?? createProvider()
  }

  getBootstrapState(): { status: AuthStatus; session: Session | null } {
    return this.provider.getBootstrapState()
  }

  async initialize(): Promise<Session | null> {
    return this.provider.getCurrentSession()
  }

  async signIn(request: SignInRequest = {}): Promise<SignInResult> {
    return this.provider.signIn(request)
  }

  async signOut(): Promise<void> {
    return this.provider.signOut()
  }

  async getCurrentSession(): Promise<Session | null> {
    return this.provider.getCurrentSession()
  }

  async refreshSession(): Promise<Session | null> {
    return this.provider.refreshSession()
  }

  async verifyMfa(request: MfaVerifyRequest): Promise<MfaVerifyResult> {
    return this.provider.verifyMfa(request)
  }
}

/** Shared singleton used by AuthContext. */
export const authService = new AuthService()
