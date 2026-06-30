import { mapHttpStatusToAuthError } from './authHttpErrors'
import {
  createMockSessionRecord,
  MockAuthSessionStore,
} from './mockAuthSessionStore'
import type { AuthError, MfaVerifyRequest, Session, SignInRequest } from './authTypes'

/** Simulated network latency for mock transport (milliseconds). */
export const MOCK_AUTH_HTTP_DELAYS = {
  session: 100,
  login: 250,
  logout: 150,
  refresh: 120,
  mfa: 200,
  passwordReset: 180,
} as const

export type AuthHttpSuccess<T> = {
  ok: true
  status: number
  data: T
}

export type AuthHttpFailure = {
  ok: false
  status: number
  error: AuthError
}

export type AuthHttpResponse<T> = AuthHttpSuccess<T> | AuthHttpFailure

export type SessionHttpData = {
  session: Session | null
}

export type LoginHttpData = {
  session: Session
  mfaRequired?: boolean
}

export type MfaHttpData = {
  session: Session
}

export type PasswordResetHttpData = {
  accepted: boolean
}

/**
 * Authentication HTTP client contract.
 * UI and AuthContext must not call fetch() directly.
 */
export interface AuthHttpClient {
  getSession(): Promise<AuthHttpResponse<SessionHttpData>>
  postLogin(body: SignInRequest): Promise<AuthHttpResponse<LoginHttpData>>
  postLogout(): Promise<AuthHttpResponse<null>>
  postRefresh(): Promise<AuthHttpResponse<SessionHttpData>>
  postMfa(body: MfaVerifyRequest): Promise<AuthHttpResponse<MfaHttpData>>
  postPasswordReset(body: { email: string }): Promise<AuthHttpResponse<PasswordResetHttpData>>
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function httpSuccess<T>(status: number, data: T): AuthHttpSuccess<T> {
  return { ok: true, status, data }
}

function httpFailure(status: number, error?: AuthError): AuthHttpFailure {
  return { ok: false, status, error: error ?? mapHttpStatusToAuthError(status) }
}

/**
 * Mock HTTP transport — simulates Stuart Auth API responses with async delays.
 * AuthProvider → AuthHttpClient → MockAuthSessionStore
 */
export class MockAuthHttpClient implements AuthHttpClient {
  private readonly store: MockAuthSessionStore

  constructor(store: MockAuthSessionStore) {
    this.store = store
  }

  async getSession(): Promise<AuthHttpResponse<SessionHttpData>> {
    await delay(MOCK_AUTH_HTTP_DELAYS.session)
    return httpSuccess(200, { session: this.store.getSession() })
  }

  async postLogin(_body: SignInRequest): Promise<AuthHttpResponse<LoginHttpData>> {
    await delay(MOCK_AUTH_HTTP_DELAYS.login)
    const session = createMockSessionRecord()
    this.store.setSession(session)
    return httpSuccess(200, { session })
  }

  async postLogout(): Promise<AuthHttpResponse<null>> {
    await delay(MOCK_AUTH_HTTP_DELAYS.logout)
    this.store.setSession(null)
    return httpSuccess(200, null)
  }

  async postRefresh(): Promise<AuthHttpResponse<SessionHttpData>> {
    await delay(MOCK_AUTH_HTTP_DELAYS.refresh)
    const session = this.store.refreshExpiry()
    if (!session) {
      return httpFailure(401, mapHttpStatusToAuthError(401))
    }
    return httpSuccess(200, { session })
  }

  async postMfa(_body: MfaVerifyRequest): Promise<AuthHttpResponse<MfaHttpData>> {
    await delay(MOCK_AUTH_HTTP_DELAYS.mfa)
    const session = this.store.markMfaVerified()
    if (!session) {
      return httpFailure(403, mapHttpStatusToAuthError(403))
    }
    return httpSuccess(200, { session })
  }

  async postPasswordReset(_body: { email: string }): Promise<AuthHttpResponse<PasswordResetHttpData>> {
    await delay(MOCK_AUTH_HTTP_DELAYS.passwordReset)
    return httpSuccess(202, { accepted: true })
  }
}

export function createAuthHttpClient(store: MockAuthSessionStore): AuthHttpClient {
  return new MockAuthHttpClient(store)
}
