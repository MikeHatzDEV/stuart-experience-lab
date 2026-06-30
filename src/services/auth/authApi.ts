import type {
  MfaVerifyRequest,
  MfaVerifyResult,
  Session,
  SignInRequest,
  SignInResult,
} from './authTypes'

/**
 * Authentication API contract — implemented by providers today, HTTP client in production.
 * See docs/authentication_foundation_v2.md §11 Phase 1.
 */
export interface AuthApi {
  /** Establish operator session (credentials validated in Phase 2). */
  signIn(request: SignInRequest): Promise<SignInResult>

  /** End operator session. */
  signOut(): Promise<void>

  /** Return active session or null. */
  getCurrentSession(): Promise<Session | null>

  /** Extend or validate session activity (Phase 2). */
  refreshSession(): Promise<Session | null>

  /** Complete MFA challenge (Phase 3). */
  verifyMfa(request: MfaVerifyRequest): Promise<MfaVerifyResult>
}
