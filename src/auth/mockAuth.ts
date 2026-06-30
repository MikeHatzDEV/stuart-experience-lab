/*
 * Stuart User System — mock identity foundation (Experience Lab only).
 *
 * Public Cloudflare preview must remain mock-data only until real authentication exists.
 * Stuart Core data cannot be connected to the public frontend without authenticated
 * session, MFA, and authorization.
 * Stuart's own user system will eventually control access across Organizations and Stuart Cores.
 */

export type StuartRole = 'Owner' | 'Admin' | 'Operator' | 'Viewer'

export type StuartMfaStatus = 'Enabled' | 'Pending' | 'Disabled'

export type StuartAccountStatus = 'Active' | 'Invited' | 'Inactive'

export type StuartSessionType = 'Preview Session' | 'Authenticated Session'

export type StuartUser = {
  id: string
  displayName: string
  username: string
  email: string
  role: StuartRole
  mfaEnabled: boolean
  mfaStatus: StuartMfaStatus
  accountStatus: StuartAccountStatus
}

export type MockSession = {
  sessionType: StuartSessionType
  authenticatedAt: string
  device: string
  location: string
  durationLabel: string
}

export const MOCK_CURRENT_USER: StuartUser = {
  id: 'michael',
  displayName: 'Michael',
  username: 'mhatzopoulos',
  email: 'michael@signallabsystems.com',
  role: 'Owner',
  mfaEnabled: true,
  mfaStatus: 'Enabled',
  accountStatus: 'Active',
}

export const MOCK_PREVIEW_SESSION: MockSession = {
  sessionType: 'Preview Session',
  authenticatedAt: 'Today 07:12',
  device: 'MSI Workstation',
  location: 'Signal Lab',
  durationLabel: '2h 14m',
}

export const MOCK_STUART_USERS: StuartUser[] = [
  MOCK_CURRENT_USER,
  {
    id: 'john',
    displayName: 'John',
    username: 'john',
    email: 'john@signallabsystems.com',
    role: 'Operator',
    mfaEnabled: false,
    mfaStatus: 'Pending',
    accountStatus: 'Invited',
  },
  {
    id: 'matthew',
    displayName: 'Matthew',
    username: 'matthew',
    email: 'matthew@signallabsystems.com',
    role: 'Operator',
    mfaEnabled: false,
    mfaStatus: 'Pending',
    accountStatus: 'Invited',
  },
  {
    id: 'viewer-example',
    displayName: 'Viewer Example',
    username: 'viewer',
    email: 'viewer@example.com',
    role: 'Viewer',
    mfaEnabled: false,
    mfaStatus: 'Disabled',
    accountStatus: 'Inactive',
  },
]

export const MOCK_STUART_ROLES: {
  title: StuartRole
  description: string
  permissions: string[]
}[] = [
  {
    title: 'Owner',
    description: 'Full environment authority across organizations and Stuart Cores.',
    permissions: ['Full control', 'Billing', 'Organizations', 'Security'],
  },
  {
    title: 'Admin',
    description: 'Manage systems, users, and configuration for assigned organizations.',
    permissions: ['Manage systems', 'Users', 'Settings'],
  },
  {
    title: 'Operator',
    description: 'Day-to-day stewardship, briefings, and recommended actions.',
    permissions: ['Review briefings', 'Act on recommendations'],
  },
  {
    title: 'Viewer',
    description: 'Read-only observation without approval or configuration rights.',
    permissions: ['Read-only'],
  },
]

export const MOCK_SECURITY_POLICY = {
  authentication: {
    requireMfa: true,
    sessionTimeoutMinutes: 30,
    passwordPolicy: 'Strong',
    loginAudit: true,
  },
  accessControl: {
    organizationPermissions: 'Planned',
    roleBasedAccess: 'Planned',
    emergencyLockout: 'Planned',
  },
  publicPreviewSafety: {
    liveDataExposure: false,
    mockDataOnly: true,
    publicPreviewMode: true,
  },
} as const

export type UserAuditEvent = {
  id: string
  time: string
  event: string
  actor: string
  detail: string
}

export const MOCK_USER_AUDIT_EVENTS: UserAuditEvent[] = [
  {
    id: 'user-audit-001',
    time: '2026-06-08 07:12:04',
    event: 'User signed in',
    actor: 'mhatzopoulos',
    detail: 'Preview session established from MSI Workstation · Signal Lab',
  },
  {
    id: 'user-audit-002',
    time: '2026-06-08 07:12:18',
    event: 'MFA challenge passed',
    actor: 'mhatzopoulos',
    detail: 'TOTP verification succeeded for Owner role',
  },
  {
    id: 'user-audit-003',
    time: '2026-06-07 16:22:41',
    event: 'User role changed',
    actor: 'mhatzopoulos',
    detail: 'John role updated from Viewer to Operator (invitation pending MFA)',
  },
  {
    id: 'user-audit-004',
    time: '2026-06-06 23:30:00',
    event: 'Session expired',
    actor: 'system',
    detail: 'Matthew preview session ended after 30-minute inactivity timeout',
  },
]

export function userInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return displayName.slice(0, 2).toUpperCase()
}
