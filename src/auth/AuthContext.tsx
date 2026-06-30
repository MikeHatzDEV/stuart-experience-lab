import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  MOCK_CURRENT_USER,
  MOCK_PREVIEW_SESSION,
  type MockSession,
  type StuartUser,
} from './mockAuth'

type AuthContextValue = {
  isAuthenticated: boolean
  currentUser: StuartUser
  session: MockSession
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/*
 * Session gate development default: authenticated so reviewers land in the app immediately.
 *
 * Future production path:
 * 1. Validate session token / cookie against Stuart's auth service on load.
 * 2. Require MFA verification for privileged roles before granting shell access.
 * 3. Enforce role-based authorization per organization and Stuart Core connection.
 * 4. Reject public preview requests that attempt live Core data without the above.
 *
 * TODO(auth-v2): Bootstrap from GET /auth/session; remove dev bypass in production.
 * See docs/authentication_foundation_v2.md — §2, §5, §11 Phase 1–2.
 */
const DEFAULT_AUTHENTICATED_FOR_DEV = true

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(DEFAULT_AUTHENTICATED_FOR_DEV)

  const signIn = useCallback(() => {
    setIsAuthenticated(true)
  }, [])

  const signOut = useCallback(() => {
    setIsAuthenticated(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      currentUser: MOCK_CURRENT_USER,
      session: MOCK_PREVIEW_SESSION,
      signIn,
      signOut,
    }),
    [isAuthenticated, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
