/**
 * Stuart — Integrated Application Router
 *
 * Architecture (Website Registration Integration Foundation v1):
 *
 * Website owns forms, navigation, and user experience.
 * Stuart Authentication Service owns users, password hashing, validation, and duplicate checks.
 *
 * Routes:
 *   /              — Landing (public front door)
 *   /login         — Sign in (mock session until login integration)
 *   /register      — Real account creation via Authentication Service
 *   /organizations — Organization selection
 *   /app           — Experience Platform (unchanged)
 *
 * Registration does not sign in or enter /app. Future: email verification → MFA → login.
 */

import { useEffect } from 'react'
import { useAuth } from './auth/AuthContext'
import { SessionGate } from './auth/SessionGate'
import { OrganizationGate } from './app/OrganizationGate'
import { clearSelectedOrganization } from './app/organizationSelection'
import { LoginScreen } from './auth/LoginScreen'
import { LandingPage } from './pages/LandingPage'
import { RegisterPage } from './pages/RegisterPage'
import { OrganizationSelectionPage } from './pages/OrganizationSelectionPage'
import { ExperiencePlatform } from './ExperiencePlatform'
import { useAppRoute } from './app/routing'

function App() {
  const { route, navigate } = useAppRoute()
  const { status, isAuthenticated } = useAuth()

  useEffect(() => {
    if (route === '/login' && status === 'unauthenticated') {
      clearSelectedOrganization()
    }
  }, [route, status])

  useEffect(() => {
    if (route === '/login' && status !== 'initializing' && isAuthenticated) {
      navigate('/organizations')
    }
  }, [route, status, isAuthenticated, navigate])

  useEffect(() => {
    if (route === '/organizations' && status !== 'initializing' && !isAuthenticated) {
      navigate('/login')
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
        onSuccess={() => navigate('/organizations')}
        onCreateAccount={() => navigate('/register')}
      />
    )
  }

  if (route === '/register') {
    return (
      <RegisterPage
        onSignIn={() => navigate('/login')}
        onBack={() => navigate('/')}
      />
    )
  }

  if (route === '/organizations') {
    if (status === 'initializing') return null
    if (!isAuthenticated) return null
    return <OrganizationSelectionPage onOpenStuart={() => navigate('/app')} />
  }

  if (route === '/app') {
    return (
      <SessionGate onUnauthenticated={() => navigate('/login')}>
        <OrganizationGate onUnselected={() => navigate('/organizations')}>
          <ExperiencePlatform />
        </OrganizationGate>
      </SessionGate>
    )
  }

  return <LandingPage onAccessStuart={() => navigate('/login')} />
}

export default App
