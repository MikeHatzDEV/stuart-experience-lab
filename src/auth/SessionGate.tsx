import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { LoginScreen } from './LoginScreen'

/*
 * Mock session gate — renders LoginScreen until signIn() sets authenticated state.
 * Replace with server-validated session checks before exposing Stuart Core data.
 */
export function SessionGate({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <>{children}</>
}
