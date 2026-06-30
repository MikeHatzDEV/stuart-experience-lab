import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { LoginScreen } from './LoginScreen'

/*
 * Mock session gate — renders LoginScreen until signIn() sets authenticated state.
 * Replace with server-validated session checks before exposing Stuart Core data.
 *
 * TODO(auth-v2): Handle session loading, expiry redirect, and MFA-pending state.
 * See docs/authentication_foundation_v2.md — §2.2, §5.5, §11 Phase 2.
 */
export function SessionGate({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <>{children}</>
}
