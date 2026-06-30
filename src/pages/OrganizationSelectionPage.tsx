import { SIGNAL_LAB_ORGANIZATION_ID, setSelectedOrganizationId } from '../app/organizationSelection'
import './OrganizationSelectionPage.css'

type OrganizationSelectionPageProps = {
  onOpenStuart: () => void
}

export function OrganizationSelectionPage({ onOpenStuart }: OrganizationSelectionPageProps) {
  const handleOpenStuart = () => {
    setSelectedOrganizationId(SIGNAL_LAB_ORGANIZATION_ID)
    onOpenStuart()
  }

  return (
    <div className="org-selection-screen">
      <div className="org-selection-panel">
        <header className="org-selection-header">
          <p className="org-selection-brand">Signal Lab Systems</p>
          <h1 className="org-selection-title">Choose an Organization</h1>
          <p className="org-selection-subtitle">
            Select the organization you would like to work with.
          </p>
        </header>

        <article className="org-card" aria-labelledby="org-signal-lab-name">
          <div className="org-card-header">
            <h2 id="org-signal-lab-name" className="org-card-name">
              Signal Lab
            </h2>
            <span className="org-card-status org-card-status-healthy">Healthy</span>
          </div>

          <p className="org-card-description">
            Primary development and testing environment for Stuart.
          </p>

          <dl className="org-card-meta">
            <div className="org-card-meta-row">
              <dt>Role</dt>
              <dd>Owner</dd>
            </div>
            <div className="org-card-meta-row">
              <dt>Primary Stuart Core</dt>
              <dd>COMMS-01 (Planned)</dd>
            </div>
          </dl>

          <button type="button" className="org-card-action" onClick={handleOpenStuart}>
            Open Stuart
          </button>
        </article>

        <p className="org-selection-future-note">
          Additional organizations will appear here as they are created or assigned to your
          account.
        </p>
      </div>
    </div>
  )
}
