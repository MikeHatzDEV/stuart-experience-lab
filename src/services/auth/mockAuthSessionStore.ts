import {
  MOCK_CURRENT_USER,
  MOCK_PREVIEW_SESSION,
} from '../../auth/mockAuth'
import type { Session } from './authTypes'

const MOCK_SESSION_TTL_MS = 30 * 60 * 1000

export function createMockSessionRecord(): Session {
  const now = Date.now()
  const createdAt = new Date(now).toISOString()
  const expiresAt = new Date(now + MOCK_SESSION_TTL_MS).toISOString()

  return {
    sessionId: `preview-${MOCK_CURRENT_USER.userId}-${now}`,
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

/** In-memory session store — replaced by server session + HttpOnly cookie in production. */
export class MockAuthSessionStore {
  private session: Session | null

  constructor(initialSession: Session | null = null) {
    this.session = initialSession
  }

  getSession(): Session | null {
    return this.session
  }

  setSession(session: Session | null): void {
    this.session = session
  }

  refreshExpiry(): Session | null {
    if (!this.session) return null

    const now = Date.now()
    this.session = {
      ...this.session,
      expiresAt: new Date(now + MOCK_SESSION_TTL_MS).toISOString(),
    }
    return this.session
  }

  markMfaVerified(): Session | null {
    if (!this.session) return null
    this.session = { ...this.session, mfaVerified: true }
    return this.session
  }
}
