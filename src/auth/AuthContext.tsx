import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  MOCK_CURRENT_USER,
  MOCK_PREVIEW_SESSION,
} from './mockAuth'
import {
  authService,
  PRODUCTION_AUTH_UNAVAILABLE_MESSAGE,
  toSessionDisplay,
  type AuthStatus,
  type Session,
  type SessionDisplay,
  type StuartUser,
} from '../services/auth'

type AuthContextValue = {
  status: AuthStatus
  isAuthenticated: boolean
  currentUser: StuartUser
  session: SessionDisplay
  authNotice: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const FALLBACK_USER = MOCK_CURRENT_USER
const FALLBACK_SESSION_DISPLAY = {
  sessionType: MOCK_PREVIEW_SESSION.sessionType,
  authenticatedAt: MOCK_PREVIEW_SESSION.authenticatedAt,
  device: MOCK_PREVIEW_SESSION.device,
  location: MOCK_PREVIEW_SESSION.location,
  durationLabel: MOCK_PREVIEW_SESSION.durationLabel,
}

function statusFromSession(session: Session | null): AuthStatus {
  if (session?.authenticated) return 'authenticated'
  return 'unauthenticated'
}

/*
 * AuthContext → AuthService → AuthProvider → AuthHttpClient
 * See docs/authentication_foundation_v2.md §18.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('initializing')
  const [session, setSession] = useState<Session | null>(null)
  const [authNotice, setAuthNotice] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    authService.initialize().then((activeSession) => {
      if (cancelled) return
      setSession(activeSession)
      setStatus(statusFromSession(activeSession))
    })

    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async () => {
    setAuthNotice(null)
    const result = await authService.signIn({})
    if (result.success) {
      setSession(result.session)
      setStatus('authenticated')
      return
    }

    if (result.error.code === 'ServerUnavailable') {
      setAuthNotice(result.error.message || PRODUCTION_AUTH_UNAVAILABLE_MESSAGE)
    }

    if (result.status === 'mfa_required') {
      setStatus('mfa_required')
      return
    }

    setStatus('unauthenticated')
  }, [])

  const signOut = useCallback(async () => {
    setAuthNotice(null)
    await authService.signOut()
    setSession(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isAuthenticated: status === 'authenticated',
      currentUser: session?.currentUser ?? FALLBACK_USER,
      session: session ? toSessionDisplay(session) : FALLBACK_SESSION_DISPLAY,
      authNotice,
      signIn,
      signOut,
    }),
    [status, session, authNotice, signIn, signOut],
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

export type { AuthStatus, Session, SessionDisplay, StuartUser } from '../services/auth'
