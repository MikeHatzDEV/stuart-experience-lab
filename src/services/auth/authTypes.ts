/*
 * Stuart authentication types — shared across UI, service layer, and providers.
 * See docs/authentication_foundation_v2.md
 */

export type StuartRole = 'Owner' | 'Admin' | 'Operator' | 'Viewer'

export type StuartMfaStatus = 'Enabled' | 'Pending' | 'Disabled'

export type StuartAccountStatus = 'Active' | 'Invited' | 'Inactive'

export type StuartSessionType = 'Preview Session' | 'Authenticated Session'

export type AuthenticationMethod = 'preview' | 'password' | 'sso'

/** Operator identity — maps to target API user model (docs §3). */
export type StuartUser = {
  id: string
  displayName: string
  username: string
  email: string
  role: StuartRole
  mfaEnabled: boolean
  mfaStatus: StuartMfaStatus
  accountStatus: StuartAccountStatus
}

/**
 * Authenticated session — replaces frontend boolean auth flag.
 * Display fields (sessionType, device, etc.) are populated by the active provider.
 */
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

/** Legacy display shape — subset of Session for UI compatibility. */
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

export type SignInRequest = {
  usernameOrEmail?: string
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
