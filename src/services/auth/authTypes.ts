/*
 * Stuart authentication types — shared across UI, service layer, and providers.
 *
 * Identity standards (ADR-001):
 * - Authentication identifies users by email.
 * - Authorization and audit reference immutable userId.
 * - displayName is presentation only.
 *
 * See docs/architecture/ADR-001-Central-Stuart-Authentication.md
 * See docs/authentication_foundation_v2.md
 */

export type StuartRole = 'Owner' | 'Admin' | 'Operator' | 'Viewer'

export type StuartMfaStatus = 'Enabled' | 'Pending' | 'Disabled'

export type StuartUserStatus = 'Active' | 'Invited' | 'Inactive'

/** @deprecated Use StuartUserStatus */
export type StuartAccountStatus = StuartUserStatus

export type StuartSessionType = 'Preview Session' | 'Authenticated Session'

export type AuthenticationMethod = 'preview' | 'password' | 'sso'

/**
 * Operator identity — maps to Central Stuart Authentication user model.
 * userId is immutable; email is the unique login identifier (no separate username).
 */
export type StuartUser = {
  userId: string
  email: string
  displayName: string
  role: StuartRole
  status: StuartUserStatus
  mfaEnabled: boolean
  mfaStatus: StuartMfaStatus
}

export type Session = {
  sessionId: string
  authenticated: boolean
  currentUser: StuartUser
  createdAt: string
  expiresAt: string
  authenticationMethod: AuthenticationMethod
  mfaVerified: boolean
  sessionType: StuartSessionType
  authenticatedAt: string
  device: string
  location: string
  durationLabel: string
}

export type SessionDisplay = Pick<
  Session,
  'sessionType' | 'authenticatedAt' | 'device' | 'location' | 'durationLabel'
>

export type AuthStatus =
  | 'initializing'
  | 'authenticated'
  | 'unauthenticated'
  | 'session_expired'
  | 'mfa_required'

export type AuthErrorCode =
  | 'InvalidCredentials'
  | 'SessionExpired'
  | 'MfaRequired'
  | 'AccountLocked'
  | 'ServerUnavailable'

export type AuthError = {
  code: AuthErrorCode
  message: string
}

/** Sign-in uses email + password only (no username). */
export type SignInRequest = {
  email?: string
  password?: string
}

export type MfaVerifyRequest = {
  challengeId?: string
  code?: string
}

export type SignInResult =
  | { success: true; session: Session }
  | { success: false; error: AuthError; status?: Extract<AuthStatus, 'mfa_required' | 'unauthenticated'> }

export type MfaVerifyResult =
  | { success: true; session: Session }
  | { success: false; error: AuthError }

export function toSessionDisplay(session: Session): SessionDisplay {
  return {
    sessionType: session.sessionType,
    authenticatedAt: session.authenticatedAt,
    device: session.device,
    location: session.location,
    durationLabel: session.durationLabel,
  }
}
