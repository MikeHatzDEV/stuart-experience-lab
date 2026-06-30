import { MOCK_SECURITY_POLICY, MOCK_USER_AUDIT_EVENTS } from './mockAuth'

function PolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="security-policy-row">
      <span className="security-policy-label">{label}</span>
      <span className="security-policy-value">{value}</span>
    </div>
  )
}

function PolicyToggle({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="security-policy-row">
      <span className="security-policy-label">{label}</span>
      <span className={`security-policy-badge${enabled ? ' enabled' : ''}`}>
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  )
}

function PolicyPlanned({ label }: { label: string }) {
  return (
    <div className="security-policy-row">
      <span className="security-policy-label">{label}</span>
      <span className="security-policy-badge planned">Planned</span>
    </div>
  )
}

export function SecuritySettings() {
  const { authentication, accessControl, publicPreviewSafety } = MOCK_SECURITY_POLICY

  return (
    <div className="settings-page-content">
      <header className="settings-content-header">
        <h2>Security</h2>
        <p>Authentication, access control, and public preview safety boundaries.</p>
      </header>

      <div className="settings-sections">
        <section className="settings-section-card span-full">
          <header className="settings-section-header">
            <h3>Authentication</h3>
            <p>How operators sign in and how sessions are protected.</p>
          </header>
          <div className="settings-section-body security-policy-body">
            <PolicyToggle label="Require MFA" enabled={authentication.requireMfa} />
            <PolicyRow
              label="Session timeout"
              value={`${authentication.sessionTimeoutMinutes} minutes`}
            />
            <PolicyRow label="Password policy" value={authentication.passwordPolicy} />
            <PolicyToggle label="Login audit" enabled={authentication.loginAudit} />
          </div>
        </section>

        <section className="settings-section-card span-full">
          <header className="settings-section-header">
            <h3>Access Control</h3>
            <p>Organization and role boundaries for Stuart Core access.</p>
          </header>
          <div className="settings-section-body security-policy-body">
            <PolicyPlanned label="Organization-level permissions" />
            <PolicyPlanned label="Role-based access" />
            <PolicyPlanned label="Emergency lockout" />
            <p className="security-policy-note">
              {accessControl.organizationPermissions === 'Planned'
                ? 'Stuart\'s user system will eventually control access across Organizations and Stuart Cores.'
                : null}
            </p>
          </div>
        </section>

        <section className="settings-section-card span-full">
          <header className="settings-section-header">
            <h3>Public Preview Safety</h3>
            <p>Cloudflare preview must remain mock-data only until real authentication exists.</p>
          </header>
          <div className="settings-section-body security-policy-body">
            <PolicyToggle label="Live data exposure" enabled={publicPreviewSafety.liveDataExposure} />
            <PolicyToggle label="Mock data only" enabled={publicPreviewSafety.mockDataOnly} />
            <PolicyToggle label="Public preview mode" enabled={publicPreviewSafety.publicPreviewMode} />
            <p className="security-policy-note security-policy-warning">
              Stuart Core data cannot be connected to the public frontend without authenticated
              session, MFA, and authorization.
            </p>
          </div>
        </section>

        <section className="settings-section-card span-full">
          <header className="settings-section-header">
            <h3>Security Audit Awareness</h3>
            <p>Recent user and session events (mock — no audit backend).</p>
          </header>
          <div className="settings-section-body">
            <table className="data-table settings-sessions-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>Actor</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USER_AUDIT_EVENTS.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.time}</td>
                    <td>{entry.event}</td>
                    <td>{entry.actor}</td>
                    <td>{entry.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
