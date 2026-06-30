import { authErrorFromResponse, mapHttpStatusToAuthError } from './authHttpErrors'
import type { AuthHttpResponse } from './authHttpClient'
import type {
  AuthError,
  MfaVerifyResult,
  Session,
  SignInResult,
} from './authTypes'
import type {
  LoginHttpData,
  MfaHttpData,
  PasswordResetHttpData,
  SessionHttpData,
} from './authHttpClient'

/** Unified authentication operation result for sign-in and MFA flows. */
export type AuthenticationResult = SignInResult | MfaVerifyResult

type ErrorBody = {
  message?: string
  code?: string
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.sessionId === 'string' &&
    typeof record.authenticated === 'boolean' &&
    record.currentUser !== null &&
    typeof record.currentUser === 'object'
  )
}

function readErrorMessage(body: ErrorBody | null, status: number): AuthError {
  if (body?.message) {
    return authErrorFromResponse(status, { message: body.message })
  }
  return mapHttpStatusToAuthError(status)
}

async function readJsonBody<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

function httpSuccess<T>(status: number, data: T): AuthHttpResponse<T> {
  return { ok: true, status, data }
}

function httpFailure(status: number, error: AuthError): AuthHttpResponse<never> {
  return { ok: false, status, error }
}

/**
 * Parse GET/POST session responses into Session or null.
 */
export async function parseSessionHttpResponse(
  response: Response,
): Promise<AuthHttpResponse<SessionHttpData>> {
  if (response.status === 204) {
    return httpSuccess(204, { session: null })
  }

  if (!response.ok) {
    const body = await readJsonBody<ErrorBody>(response)
    return httpFailure(response.status, readErrorMessage(body, response.status))
  }

  const body = await readJsonBody<SessionHttpData | Session | null>(response)
  if (!body) {
    return httpSuccess(200, { session: null })
  }

  if ('session' in body) {
    return httpSuccess(response.status, { session: body.session ?? null })
  }

  if (isSession(body)) {
    return httpSuccess(response.status, { session: body })
  }

  return httpSuccess(response.status, { session: null })
}

/**
 * Parse login responses into AuthenticationResult-shaped HTTP data.
 */
export async function parseLoginHttpResponse(
  response: Response,
): Promise<AuthHttpResponse<LoginHttpData>> {
  if (!response.ok) {
    const body = await readJsonBody<ErrorBody>(response)
    return httpFailure(response.status, readErrorMessage(body, response.status))
  }

  const body = await readJsonBody<LoginHttpData | Session>(response)
  if (!body) {
    return httpFailure(500, mapHttpStatusToAuthError(500))
  }

  if ('session' in body && isSession(body.session)) {
    return httpSuccess(response.status, body)
  }

  if (isSession(body)) {
    return httpSuccess(response.status, { session: body })
  }

  return httpFailure(500, mapHttpStatusToAuthError(500))
}

/**
 * Parse MFA responses.
 */
export async function parseMfaHttpResponse(
  response: Response,
): Promise<AuthHttpResponse<MfaHttpData>> {
  if (!response.ok) {
    const body = await readJsonBody<ErrorBody>(response)
    return httpFailure(response.status, readErrorMessage(body, response.status))
  }

  const body = await readJsonBody<MfaHttpData | Session>(response)
  if (!body) {
    return httpFailure(500, mapHttpStatusToAuthError(500))
  }

  if ('session' in body && isSession(body.session)) {
    return httpSuccess(response.status, body)
  }

  if (isSession(body)) {
    return httpSuccess(response.status, { session: body })
  }

  return httpFailure(500, mapHttpStatusToAuthError(500))
}

/**
 * Parse logout responses.
 */
export async function parseLogoutHttpResponse(
  response: Response,
): Promise<AuthHttpResponse<null>> {
  if (!response.ok) {
    const body = await readJsonBody<ErrorBody>(response)
    return httpFailure(response.status, readErrorMessage(body, response.status))
  }
  return httpSuccess(response.status, null)
}

/**
 * Parse password reset contract responses.
 */
export async function parsePasswordResetHttpResponse(
  response: Response,
): Promise<AuthHttpResponse<PasswordResetHttpData>> {
  if (!response.ok) {
    const body = await readJsonBody<ErrorBody>(response)
    return httpFailure(response.status, readErrorMessage(body, response.status))
  }

  const body = await readJsonBody<PasswordResetHttpData>(response)
  return httpSuccess(response.status, body ?? { accepted: true })
}

/**
 * Translate provider HTTP results into SignInResult for AuthContext.
 */
export function toSignInResult(
  response: AuthHttpResponse<LoginHttpData>,
): SignInResult {
  if (!response.ok) {
    const status = response.error.code === 'MfaRequired' ? 'mfa_required' : 'unauthenticated'
    return { success: false, error: response.error, status }
  }
  return { success: true, session: response.data.session }
}

/**
 * Translate provider HTTP results into MfaVerifyResult.
 */
export function toMfaVerifyResult(
  response: AuthHttpResponse<MfaHttpData>,
): MfaVerifyResult {
  if (!response.ok) {
    return { success: false, error: response.error }
  }
  return { success: true, session: response.data.session }
}
