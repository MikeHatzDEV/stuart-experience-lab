import { AUTH_ENDPOINTS } from './authEndpoints'
import { authErrorFromResponse, mapHttpStatusToAuthError } from './authHttpErrors'
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
  return { ok: false, status, error: error ?? authErrorFromResponse(status) }
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
    // Contract only — no email delivery in mock transport.
    return httpSuccess(202, { accepted: true })
  }
}

/**
 * Production HTTP client — reserved for Stuart Auth API (not enabled).
 * Uses fetch + credentials: 'include'. Never stores tokens in browser storage.
 */
export class FetchAuthHttpClient implements AuthHttpClient {
  private async request<T>(
    endpoint: string,
    init?: RequestInit,
  ): Promise<AuthHttpResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        ...init,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers ?? {}),
        },
      })

      if (!response.ok) {
        let message: string | undefined
        try {
          const body = (await response.json()) as { message?: string }
          message = body.message
        } catch {
          message = undefined
        }
        return httpFailure(response.status, authErrorFromResponse(response.status, { message }))
      }

      if (response.status === 204) {
        return httpSuccess(204, null as T)
      }

      const data = (await response.json()) as T
      return httpSuccess(response.status, data)
    } catch {
      return httpFailure(500, mapHttpStatusToAuthError(500))
    }
  }

  getSession(): Promise<AuthHttpResponse<SessionHttpData>> {
    return this.request<SessionHttpData>(AUTH_ENDPOINTS.session, { method: 'GET' })
  }

  postLogin(body: SignInRequest): Promise<AuthHttpResponse<LoginHttpData>> {
    return this.request<LoginHttpData>(AUTH_ENDPOINTS.login, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  postLogout(): Promise<AuthHttpResponse<null>> {
    return this.request<null>(AUTH_ENDPOINTS.logout, { method: 'POST' })
  }

  postRefresh(): Promise<AuthHttpResponse<SessionHttpData>> {
    return this.request<SessionHttpData>(AUTH_ENDPOINTS.refresh, { method: 'POST' })
  }

  postMfa(body: MfaVerifyRequest): Promise<AuthHttpResponse<MfaHttpData>> {
    return this.request<MfaHttpData>(AUTH_ENDPOINTS.mfa, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  postPasswordReset(body: { email: string }): Promise<AuthHttpResponse<PasswordResetHttpData>> {
    return this.request<PasswordResetHttpData>(AUTH_ENDPOINTS.passwordReset, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}

export function createAuthHttpClient(store: MockAuthSessionStore): AuthHttpClient {
  return new MockAuthHttpClient(store)
}
