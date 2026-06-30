/*
 * Stuart User System — mock catalog data (Experience Lab only).
 * Session state is owned by AuthService / MockAuthProvider — not this module.
 *
 * Identity: email for login; userId for authorization and audit (ADR-001).
 * See docs/authentication_foundation_v2.md
 */

import type {
  StuartMfaStatus,
  StuartRole,
  StuartSessionType,
  StuartUser,
  StuartUserStatus,
} from '../services/auth/authTypes'

export type { StuartMfaStatus, StuartRole, StuartSessionType, StuartUser, StuartUserStatus }

/** @deprecated Use StuartUserStatus */
export type StuartAccountStatus = StuartUserStatus

export type MockSession = {
  sessionType: StuartSessionType
  authenticatedAt: string
  device: string
  location: string
  durationLabel: string
}

/** Immutable user IDs — never change, never reused (audit integrity). */
export const MOCK_USER_IDS = {
  michael: 'usr_8f3a2c1e-4b7d-4e9a-9c3d-1a2b3c4d5e6f',
  john: 'usr_2d9e7b41-6c8a-4f1e-b2a0-9e7f3c1d8a4b',
  matthew: 'usr_5a1c9f72-3e4d-4b8a-9f6e-2c7d1a8b5e3f',
  viewer: 'usr_9b4e2a61-7d3c-4e9b-a1f5-8c2e6d9a4b7c',
  system: 'usr_00000000-0000-4000-8000-000000000000',
} as const

export const MOCK_CURRENT_USER: StuartUser = {
  userId: MOCK_USER_IDS.michael,
  email: 'michael@signallabsystems.com',
  displayName: 'Michael',
  role: 'Owner',
  mfaEnabled: true,
  mfaStatus: 'Enabled',
  status: 'Active',
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
    userId: MOCK_USER_IDS.john,
    email: 'john@signallabsystems.com',
    displayName: 'John',
    role: 'Operator',
    mfaEnabled: false,
    mfaStatus: 'Pending',
    status: 'Invited',
  },
  {
    userId: MOCK_USER_IDS.matthew,
    email: 'matthew@signallabsystems.com',
    displayName: 'Matthew',
    role: 'Operator',
    mfaEnabled: false,
    mfaStatus: 'Pending',
    status: 'Invited',
  },
  {
    userId: MOCK_USER_IDS.viewer,
    email: 'viewer@example.com',
    displayName: 'Viewer Example',
    role: 'Viewer',
    mfaEnabled: false,
    mfaStatus: 'Disabled',
    status: 'Inactive',
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

/** Audit actor — userId is authoritative; displayName and email are informational. */
export type UserAuditActor = {
  userId: string
  displayName: string
  role: StuartRole | 'System'
  email?: string
}

export type UserAuditEvent = {
  id: string
  time: string
  event: string
  actor: UserAuditActor
  detail: string
}

export const MOCK_USER_AUDIT_EVENTS: UserAuditEvent[] = [
  {
    id: 'user-audit-001',
    time: '2026-06-08 07:12:04',
    event: 'User signed in',
    actor: {
      userId: MOCK_USER_IDS.michael,
      displayName: 'Michael',
      role: 'Owner',
      email: 'michael@signallabsystems.com',
    },
    detail: 'Preview session established from MSI Workstation · Signal Lab',
  },
  {
    id: 'user-audit-002',
    time: '2026-06-08 07:12:18',
    event: 'MFA challenge passed',
    actor: {
      userId: MOCK_USER_IDS.michael,
      displayName: 'Michael',
      role: 'Owner',
      email: 'michael@signallabsystems.com',
    },
    detail: 'TOTP verification succeeded for Owner role',
  },
  {
    id: 'user-audit-003',
    time: '2026-06-07 16:22:41',
    event: 'User role changed',
    actor: {
      userId: MOCK_USER_IDS.michael,
      displayName: 'Michael',
      role: 'Owner',
      email: 'michael@signallabsystems.com',
    },
    detail: 'John (usr_2d9e7b41-…) role updated from Viewer to Operator (invitation pending MFA)',
  },
  {
    id: 'user-audit-004',
    time: '2026-06-06 23:30:00',
    event: 'Session expired',
    actor: {
      userId: MOCK_USER_IDS.system,
      displayName: 'System',
      role: 'System',
    },
    detail: 'Matthew (usr_5a1c9f72-…) preview session ended after 30-minute inactivity timeout',
  },
]

export function userInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return displayName.slice(0, 2).toUpperCase()
}

export function formatAuditActorLabel(actor: UserAuditActor): string {
  if (actor.role === 'System') return 'System'
  return actor.displayName
}
