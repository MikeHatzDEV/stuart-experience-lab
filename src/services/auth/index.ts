export { authService, AuthService } from './authService'
export type { AuthApi } from './authApi'
export { AUTH_API_BASE_PATH, AUTH_ENDPOINTS } from './authEndpoints'
export type { AuthEndpointKey } from './authEndpoints'
export {
  authErrorFromResponse,
  mapHttpStatusToAuthError,
  mapHttpStatusToAuthErrorCode,
} from './authHttpErrors'
export { createAuthRequestId, logAuthRequestSafe } from './authHttpLogging'
export type { SafeAuthRequestLog } from './authHttpLogging'
export { executeAuthRequest, AuthHttpTransportError } from './authHttpRequestBuilder'
export type { AuthHttpRequestOptions, AuthHttpRawResult } from './authHttpRequestBuilder'
export {
  parseLoginHttpResponse,
  parseLogoutHttpResponse,
  parseMfaHttpResponse,
  parsePasswordResetHttpResponse,
  parseSessionHttpResponse,
  toMfaVerifyResult,
  toSignInResult,
} from './authHttpResponseParser'
export type { AuthenticationResult } from './authHttpResponseParser'
export {
  PRODUCTION_AUTH_CONFIG,
  PRODUCTION_AUTH_NOT_IMPLEMENTED_MESSAGE,
  PRODUCTION_AUTH_UNAVAILABLE_MESSAGE,
} from './authProductionConfig'
export type { ProductionAuthConfig } from './authProductionConfig'
export {
  createAuthHttpClient,
  MockAuthHttpClient,
  MOCK_AUTH_HTTP_DELAYS,
} from './authHttpClient'
export { FetchAuthHttpClient } from './fetchAuthHttpClient'
export type {
  AuthHttpClient,
  AuthHttpResponse,
  LoginHttpData,
  SessionHttpData,
} from './authHttpClient'
export type { AuthProvider, AuthProviderKind } from './authProvider'
export {
  getAuthDeploymentEnvironment,
  getAuthRuntimeEnvironment,
  isDevSessionBootstrapEnabled,
  isProductionAuthBackendEnabled,
  resolveAuthProviderKind,
} from './authConfig'
export type { AuthRuntimeEnvironment } from './authConfig'
export { MockAuthProvider } from './MockAuthProvider'
export { ProductionAuthProvider } from './ProductionAuthProvider'
export type { ProductionAuthProviderState } from './ProductionAuthProvider'
export { createMockSessionRecord, MockAuthSessionStore } from './mockAuthSessionStore'
export type {
  AuthError,
  AuthErrorCode,
  AuthStatus,
  AuthenticationMethod,
  MfaVerifyRequest,
  MfaVerifyResult,
  Session,
  SessionDisplay,
  SignInRequest,
  SignInResult,
  StuartAccountStatus,
  StuartUserStatus,
  StuartMfaStatus,
  StuartRole,
  StuartSessionType,
  StuartUser,
} from './authTypes'
export { toSessionDisplay } from './authTypes'
