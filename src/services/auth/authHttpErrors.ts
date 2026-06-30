import type { AuthError, AuthErrorCode } from './authTypes'

const HTTP_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  InvalidCredentials: 'The email, username, or password is incorrect.',
  SessionExpired: 'Your session has expired. Please sign in again.',
  MfaRequired: 'Multi-factor authentication is required to continue.',
  AccountLocked: 'This account is temporarily locked. Contact an administrator.',
  ServerUnavailable: 'Authentication service is unavailable. Try again later.',
}

/**
 * Map HTTP status codes to Stuart authentication errors.
 * Used by AuthHttpClient (mock and production).
 */
export function mapHttpStatusToAuthError(status: number, fallbackMessage?: string): AuthError {
  const code = mapHttpStatusToAuthErrorCode(status)
  return {
    code,
    message: fallbackMessage ?? HTTP_ERROR_MESSAGES[code],
  }
}

export function mapHttpStatusToAuthErrorCode(status: number): AuthErrorCode {
  switch (status) {
    case 401:
      return 'InvalidCredentials'
    case 403:
      return 'MfaRequired'
    case 419:
    case 440:
      return 'SessionExpired'
    case 423:
      return 'AccountLocked'
    default:
      return status >= 500 ? 'ServerUnavailable' : 'InvalidCredentials'
  }
}

export function authErrorFromResponse(status: number, body?: { message?: string }): AuthError {
  return mapHttpStatusToAuthError(status, body?.message)
}
