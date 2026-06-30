import { PRODUCTION_AUTH_CONFIG } from './authProductionConfig'
import type {
  AuthHttpClient,
  AuthHttpResponse,
  LoginHttpData,
  MfaHttpData,
  PasswordResetHttpData,
  SessionHttpData,
} from './authHttpClient'
import { AuthHttpTransportError, executeAuthRequest } from './authHttpRequestBuilder'
import {
  parseLoginHttpResponse,
  parseLogoutHttpResponse,
  parseMfaHttpResponse,
  parsePasswordResetHttpResponse,
  parseSessionHttpResponse,
} from './authHttpResponseParser'
import { mapHttpStatusToAuthError } from './authHttpErrors'
import type { MfaVerifyRequest, SignInRequest } from './authTypes'

function transportFailure<T>(): AuthHttpResponse<T> {
  return {
    ok: false,
    status: 500,
    error: mapHttpStatusToAuthError(500),
  }
}

/**
 * Production HTTP client — uses centralized request builder and response parser.
 * Session transport: HttpOnly cookies via credentials: 'include'.
 * Never uses bearer tokens, localStorage, sessionStorage, or URL tokens.
 */
export class FetchAuthHttpClient implements AuthHttpClient {
  private async runWithRetry<T>(
    operation: () => Promise<AuthHttpResponse<T>>,
  ): Promise<AuthHttpResponse<T>> {
    const { maxAttempts, backoffMs } = PRODUCTION_AUTH_CONFIG.retryPolicy
    let lastResult: AuthHttpResponse<T> | null = null

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const result = await operation()
        lastResult = result
        if (result.ok || result.status < 500) {
          return result
        }
      } catch {
        lastResult = transportFailure()
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => window.setTimeout(resolve, backoffMs))
      }
    }

    return lastResult ?? transportFailure()
  }

  async getSession(): Promise<AuthHttpResponse<SessionHttpData>> {
    return this.runWithRetry(async () => {
      try {
        const { response } = await executeAuthRequest({
          path: PRODUCTION_AUTH_CONFIG.endpoints.session,
          method: 'GET',
        })
        return parseSessionHttpResponse(response)
      } catch {
        return transportFailure()
      }
    })
  }

  async postLogin(body: SignInRequest): Promise<AuthHttpResponse<LoginHttpData>> {
    return this.runWithRetry(async () => {
      try {
        const { response } = await executeAuthRequest({
          path: PRODUCTION_AUTH_CONFIG.endpoints.login,
          method: 'POST',
          body,
        })
        return parseLoginHttpResponse(response)
      } catch {
        return transportFailure()
      }
    })
  }

  async postLogout(): Promise<AuthHttpResponse<null>> {
    return this.runWithRetry(async () => {
      try {
        const { response } = await executeAuthRequest({
          path: PRODUCTION_AUTH_CONFIG.endpoints.logout,
          method: 'POST',
        })
        return parseLogoutHttpResponse(response)
      } catch {
        return transportFailure()
      }
    })
  }

  async postRefresh(): Promise<AuthHttpResponse<SessionHttpData>> {
    return this.runWithRetry(async () => {
      try {
        const { response } = await executeAuthRequest({
          path: PRODUCTION_AUTH_CONFIG.endpoints.refresh,
          method: 'POST',
        })
        return parseSessionHttpResponse(response)
      } catch {
        return transportFailure()
      }
    })
  }

  async postMfa(body: MfaVerifyRequest): Promise<AuthHttpResponse<MfaHttpData>> {
    return this.runWithRetry(async () => {
      try {
        const { response } = await executeAuthRequest({
          path: PRODUCTION_AUTH_CONFIG.endpoints.mfa,
          method: 'POST',
          body,
        })
        return parseMfaHttpResponse(response)
      } catch {
        return transportFailure()
      }
    })
  }

  async postPasswordReset(body: {
    email: string
  }): Promise<AuthHttpResponse<PasswordResetHttpData>> {
    return this.runWithRetry(async () => {
      try {
        const { response } = await executeAuthRequest({
          path: PRODUCTION_AUTH_CONFIG.endpoints.passwordReset,
          method: 'POST',
          body,
        })
        return parsePasswordResetHttpResponse(response)
      } catch {
        return transportFailure()
      }
    })
  }
}

export { AuthHttpTransportError }
