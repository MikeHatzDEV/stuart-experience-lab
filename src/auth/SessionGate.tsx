import { useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'

type SessionGateProps = {
  children: ReactNode
  onUnauthenticated: () => void
}

/*
 * Session gate for /app — redirects to /login when unauthenticated.
 * Session bootstrap: AuthContext → AuthService → AuthHttpClient (see §17.3).
 * Dev preview may auto-authenticate via VITE_AUTH_DEV_BOOTSTRAP.
 * See docs/authentication_foundation_v2.md
 */
export function SessionGate({ children, onUnauthenticated }: SessionGateProps) {
  const { status, isAuthenticated } = useAuth()

  useEffect(() => {
    if (status !== 'initializing' && !isAuthenticated) {
      onUnauthenticated()
    }
  }, [status, isAuthenticated, onUnauthenticated])

  if (status === 'initializing') {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
