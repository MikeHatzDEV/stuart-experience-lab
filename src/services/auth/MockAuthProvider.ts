import { isDevSessionBootstrapEnabled } from './authConfig'
import { createAuthHttpClient, type AuthHttpClient } from './authHttpClient'
import {
  createMockSessionRecord,
  MockAuthSessionStore,
} from './mockAuthSessionStore'
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
 * Mock auth provider — all operations route through AuthHttpClient mock transport.
 * AuthService → MockAuthProvider → AuthHttpClient → MockAuthSessionStore
 */
export class MockAuthProvider implements AuthProvider {
  private readonly store: MockAuthSessionStore
  private readonly httpClient: AuthHttpClient

  constructor(httpClient?: AuthHttpClient, store?: MockAuthSessionStore) {
    const bootstrapSession = isDevSessionBootstrapEnabled() ? createMockSessionRecord() : null
    this.store = store ?? new MockAuthSessionStore(bootstrapSession)
    this.httpClient = httpClient ?? createAuthHttpClient(this.store)
  }

  getBootstrapState(): { status: AuthStatus; session: Session | null } {
    return { status: 'initializing', session: null }
  }

  async getCurrentSession(): Promise<Session | null> {
    const response = await this.httpClient.getSession()
    if (!response.ok) return null
    return response.data.session
  }

  async signIn(request: SignInRequest): Promise<SignInResult> {
    const response = await this.httpClient.postLogin(request)
    if (!response.ok) {
      const status = response.error.code === 'MfaRequired' ? 'mfa_required' : 'unauthenticated'
      return { success: false, error: response.error, status }
    }
    return { success: true, session: response.data.session }
  }

  async signOut(): Promise<void> {
    const response = await this.httpClient.postLogout()
    if (!response.ok) {
      throw new Error(response.error.message)
    }
  }

  async refreshSession(): Promise<Session | null> {
    const response = await this.httpClient.postRefresh()
    if (!response.ok) return null
    return response.data.session
  }

  async verifyMfa(request: MfaVerifyRequest): Promise<MfaVerifyResult> {
    const response = await this.httpClient.postMfa(request)
    if (!response.ok) {
      return { success: false, error: response.error }
    }
    return { success: true, session: response.data.session }
  }
}
