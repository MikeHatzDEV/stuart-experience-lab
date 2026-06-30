/** Selected organization for the current browser session (mock foundation v1). */
const STORAGE_KEY = 'stuart-selected-organization'

export const SIGNAL_LAB_ORGANIZATION_ID = 'signal-lab'

export function getSelectedOrganizationId(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setSelectedOrganizationId(organizationId: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, organizationId)
  } catch {
    // sessionStorage unavailable — selection remains in-memory for this navigation only
  }
}

export function clearSelectedOrganization(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function hasSelectedOrganization(): boolean {
  return getSelectedOrganizationId() === SIGNAL_LAB_ORGANIZATION_ID
}
