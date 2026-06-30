import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { LoginScreen } from './LoginScreen'

/*
 * Mock session gate — renders LoginScreen until signIn() sets authenticated state.
 * Session bootstrap: AuthContext → AuthService → AuthHttpClient (see §17.3).
 * See docs/authentication_foundation_v2.md
 */
export function SessionGate({ children }: { children: ReactNode }) {
  const { status, isAuthenticated } = useAuth()

  if (status === 'initializing') {
    return null
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <>{children}</>
}
