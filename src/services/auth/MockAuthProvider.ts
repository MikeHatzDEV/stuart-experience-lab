import {
  MOCK_CURRENT_USER,
  MOCK_PREVIEW_SESSION,
} from '../../auth/mockAuth'
import { isDevSessionBootstrapEnabled } from './authConfig'
import type { AuthProvider } from './authProvider'
import type {
  AuthStatus,
  MfaVerifyRequest,
  MfaVerifyResult,
  Session,
  SignInRequest,
  SignInResult,
} from './authTypes'

const MOCK_SESSION_TTL_MS = 30 * 60 * 1000

function createMockSession(): Session {
  const now = Date.now()
  const createdAt = new Date(now).toISOString()
  const expiresAt = new Date(now + MOCK_SESSION_TTL_MS).toISOString()

  return {
    sessionId: `preview-${MOCK_CURRENT_USER.id}-${now}`,
    authenticated: true,
    currentUser: MOCK_CURRENT_USER,
    createdAt,
    expiresAt,
    authenticationMethod: 'preview',
    mfaVerified: MOCK_CURRENT_USER.mfaEnabled,
    sessionType: MOCK_PREVIEW_SESSION.sessionType,
    authenticatedAt: MOCK_PREVIEW_SESSION.authenticatedAt,
    device: MOCK_PREVIEW_SESSION.device,
    location: MOCK_PREVIEW_SESSION.location,
    durationLabel: MOCK_PREVIEW_SESSION.durationLabel,
  }
}

/**
 * Mock auth provider — returns catalog mock data through the service layer.
 * UI must not import mock session state directly.
 */
export class MockAuthProvider implements AuthProvider {
  private session: Session | null

  constructor() {
    this.session = isDevSessionBootstrapEnabled() ? createMockSession() : null
  }

  getBootstrapState(): { status: AuthStatus; session: Session | null } {
    if (this.session?.authenticated) {
      return { status: 'authenticated', session: this.session }
    }
    return { status: 'unauthenticated', session: null }
  }

  async getCurrentSession(): Promise<Session | null> {
    return this.session
  }

  async signIn(_request: SignInRequest): Promise<SignInResult> {
    this.session = createMockSession()
    return { success: true, session: this.session }
  }

  async signOut(): Promise<void> {
    this.session = null
  }

  async refreshSession(): Promise<Session | null> {
    if (!this.session) return null

    const now = Date.now()
    this.session = {
      ...this.session,
      expiresAt: new Date(now + MOCK_SESSION_TTL_MS).toISOString(),
    }
    return this.session
  }

  async verifyMfa(_request: MfaVerifyRequest): Promise<MfaVerifyResult> {
    if (!this.session) {
      return {
        success: false,
        error: {
          code: 'MfaRequired',
          message: 'No active session awaiting MFA verification.',
        },
      }
    }

    this.session = { ...this.session, mfaVerified: true }
    return { success: true, session: this.session }
  }
}
