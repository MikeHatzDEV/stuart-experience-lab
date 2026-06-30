import { useCallback, useEffect, useState } from 'react'

/** Application routes — public entry and platform shell. */
export type AppRoute = '/' | '/login' | '/app'

export function normalizeAppRoute(pathname: string): AppRoute {
  if (pathname === '/login') return '/login'
  if (pathname === '/app' || pathname.startsWith('/app/')) return '/app'
  return '/'
}

export function useAppRoute() {
  const [route, setRoute] = useState<AppRoute>(() => normalizeAppRoute(window.location.pathname))

  useEffect(() => {
    const onPopState = () => setRoute(normalizeAppRoute(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((to: AppRoute) => {
    const next = normalizeAppRoute(to)
    if (next !== normalizeAppRoute(window.location.pathname)) {
      window.history.pushState({}, '', next)
      setRoute(next)
    }
  }, [])

  return { route, navigate }
}
