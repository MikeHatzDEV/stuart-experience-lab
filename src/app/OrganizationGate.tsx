import { useEffect, type ReactNode } from 'react'
import { hasSelectedOrganization } from './organizationSelection'

type OrganizationGateProps = {
  children: ReactNode
  onUnselected: () => void
}

/*
 * Organization gate for /app — ensures an organization was chosen after login.
 * Authentication determines WHO the user is.
 * Organization selection determines WHICH environment the user wishes to access.
 * The Experience Platform operates within the selected organization context.
 */
export function OrganizationGate({ children, onUnselected }: OrganizationGateProps) {
  const selected = hasSelectedOrganization()

  useEffect(() => {
    if (!selected) {
      onUnselected()
    }
  }, [selected, onUnselected])

  if (!selected) {
    return null
  }

  return <>{children}</>
}
