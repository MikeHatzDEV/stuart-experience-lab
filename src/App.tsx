/**
 * Stuart — Integrated Application Router
 *
 * Architecture (Website Integration Foundation v1):
 *
 * One application serves www.signallabsystems.com and the Stuart Experience Platform.
 * The public website is intentionally lightweight — it introduces Stuart and directs
 * users to Access Stuart. The Experience Platform at /app remains the primary product.
 * Marketing content must never become the focus of development effort.
 *
 * Routes:
 *   /        — Landing (public front door)
 *   /login   — Authentication entry (mock until central Stuart auth)
 *   /app     — Experience Platform (existing product shell)
 *
 * Future routes may include Downloads, Documentation, Support, and Account.
 */

import { useEffect } from 'react'
import { useAuth } from './auth/AuthContext'
import { SessionGate } from './auth/SessionGate'
import { LoginScreen } from './auth/LoginScreen'
import { LandingPage } from './pages/LandingPage'
import { ExperiencePlatform } from './ExperiencePlatform'
import { useAppRoute } from './app/routing'

function App() {
  const { route, navigate } = useAppRoute()
  const { status, isAuthenticated } = useAuth()

  useEffect(() => {
    if (route === '/login' && status !== 'initializing' && isAuthenticated) {
      navigate('/app')
    }
  }, [route, status, isAuthenticated, navigate])

  if (route === '/') {
    return <LandingPage onAccessStuart={() => navigate('/login')} />
  }

  if (route === '/login') {
    if (status === 'initializing') return null
    if (isAuthenticated) return null
    return (
      <LoginScreen
        onBack={() => navigate('/')}
        onSuccess={() => navigate('/app')}
      />
    )
  }

  if (route === '/app') {
    return (
      <SessionGate onUnauthenticated={() => navigate('/login')}>
        <ExperiencePlatform />
      </SessionGate>
    )
  }

  return <LandingPage onAccessStuart={() => navigate('/login')} />
}

export default App
