/**
 * Stuart — Integrated Application Router
 *
 * Architecture (Post-Login Organization Entry Foundation v1):
 *
 * Authentication determines WHO the user is.
 * Organization selection determines WHICH environment the user wishes to access.
 * The Experience Platform operates within the selected organization context.
 *
 * Routes:
 *   /              — Landing (public front door)
 *   /login         — Authentication entry (mock until central Stuart auth)
 *   /organizations — Organization selection (bridge between auth and platform)
 *   /app           — Experience Platform (existing product shell)
 *
 * Future routes may include Downloads, Documentation, Support, and Account.
 */

import { useEffect } from 'react'
import { useAuth } from './auth/AuthContext'
import { SessionGate } from './auth/SessionGate'
import { OrganizationGate } from './app/OrganizationGate'
import { clearSelectedOrganization } from './app/organizationSelection'
import { LoginScreen } from './auth/LoginScreen'
import { LandingPage } from './pages/LandingPage'
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
