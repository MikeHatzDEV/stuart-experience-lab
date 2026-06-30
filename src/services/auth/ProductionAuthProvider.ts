import {
  isProductionAuthBackendEnabled,
} from './authConfig'
import { FetchAuthHttpClient } from './fetchAuthHttpClient'
import {
  PRODUCTION_AUTH_NOT_IMPLEMENTED_MESSAGE,
  PRODUCTION_AUTH_UNAVAILABLE_MESSAGE,
} from './authProductionConfig'
import type { AuthHttpClient } from './authHttpClient'
import {
  toMfaVerifyResult,
  toSignInResult,
} from './authHttpResponseParser'
import type { AuthProvider } from './authProvider'
import type {
  AuthError,
  AuthStatus,
  MfaVerifyRequest,
  MfaVerifyResult,
  Session,
  SignInRequest,
  SignInResult,
} from './authTypes'

export type ProductionAuthProviderState = {
  backendEnabled: boolean
  lastError: AuthError | null
}

/**
 * Production auth provider — communicates with Stuart Auth API via FetchAuthHttpClient.
 * When backend is disabled, returns structured unavailable responses without throwing.
 */
export class ProductionAuthProvider implements AuthProvider {
  private readonly httpClient: AuthHttpClient
  private lastError: AuthError | null = null

  constructor(httpClient?: AuthHttpClient) {
    this.httpClient = httpClient ?? new FetchAuthHttpClient()
  }

  getState(): ProductionAuthProviderState {
    return {
      backendEnabled: isProductionAuthBackendEnabled(),
      lastError: this.lastError,
    }
  }

  getLastError(): AuthError | null {
    return this.lastError
  }

  getBootstrapState(): { status: AuthStatus; session: Session | null } {
    return { status: 'initializing', session: null }
  }

  private unavailableError(): AuthError {
    return {
      code: 'ServerUnavailable',
      message: PRODUCTION_AUTH_UNAVAILABLE_MESSAGE,
    }
  }

  private notImplementedError(): AuthError {
    return {
      code: 'ServerUnavailable',
      message: PRODUCTION_AUTH_NOT_IMPLEMENTED_MESSAGE,
    }
  }

  private guardBackend(): AuthError | null {
    if (!isProductionAuthBackendEnabled()) {
      const error = this.unavailableError()
      this.lastError = error
      return error
    }
    return null
  }

  async getCurrentSession(): Promise<Session | null> {
    const blocked = this.guardBackend()
    if (blocked) return null

    try {
      const response = await this.httpClient.getSession()
      if (!response.ok) {
        this.lastError = response.error
        return null
      }
      this.lastError = null
      return response.data.session
    } catch {
      this.lastError = this.unavailableError()
      return null
    }
  }

  async signIn(request: SignInRequest): Promise<SignInResult> {
    const blocked = this.guardBackend()
    if (blocked) {
      return { success: false, error: blocked, status: 'unauthenticated' }
    }

    try {
      const response = await this.httpClient.postLogin(request)
      const result = toSignInResult(response)
      if (!result.success) {
        this.lastError = result.error
      } else {
        this.lastError = null
      }
      return result
    } catch {
      const error = this.unavailableError()
      this.lastError = error
      return { success: false, error, status: 'unauthenticated' }
    }
  }

  async signOut(): Promise<void> {
    const blocked = this.guardBackend()
    if (blocked) return

    try {
      const response = await this.httpClient.postLogout()
      if (!response.ok) {
        this.lastError = response.error
        return
      }
      this.lastError = null
    } catch {
      this.lastError = this.unavailableError()
    }
  }

  async refreshSession(): Promise<Session | null> {
    const blocked = this.guardBackend()
    if (blocked) return null

    try {
      const response = await this.httpClient.postRefresh()
      if (!response.ok) {
        this.lastError = response.error
        return null
      }
      this.lastError = null
      return response.data.session
    } catch {
      this.lastError = this.unavailableError()
      return null
    }
  }

  async verifyMfa(request: MfaVerifyRequest): Promise<MfaVerifyResult> {
    const blocked = this.guardBackend()
    if (blocked) {
      return { success: false, error: blocked }
    }

    try {
      const response = await this.httpClient.postMfa(request)
      const result = toMfaVerifyResult(response)
      if (!result.success) {
        this.lastError = result.error
        return result
      }
      this.lastError = null
      return result
    } catch {
      const error = this.notImplementedError()
      this.lastError = error
      return { success: false, error }
    }
  }

  async requestPasswordReset(email: string): Promise<{ accepted: boolean; error?: AuthError }> {
    const blocked = this.guardBackend()
    if (blocked) {
      return { accepted: false, error: blocked }
    }

    try {
      const response = await this.httpClient.postPasswordReset({ email })
      if (!response.ok) {
        this.lastError = response.error
        return { accepted: false, error: response.error }
      }
      this.lastError = null
      return { accepted: response.data.accepted }
    } catch {
      const error = this.notImplementedError()
      this.lastError = error
      return { accepted: false, error }
    }
  }
}
