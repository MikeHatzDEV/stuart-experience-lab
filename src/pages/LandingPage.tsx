import { StuartOrb } from '../StuartOrb'
import { EXPERIENCE_LAB_VERSION } from '../app/version'
import './LandingPage.css'

type LandingPageProps = {
  onAccessStuart: () => void
}

export function LandingPage({ onAccessStuart }: LandingPageProps) {
  return (
    <div className="landing">
      <main className="landing-main">
        <header className="landing-header">
          <p className="landing-company">Signal Lab Systems</p>
        </header>

        <section className="landing-hero" aria-labelledby="stuart-title">
          <div className="landing-orb">
            <StuartOrb showStatus={false} />
          </div>
          <h1 id="stuart-title" className="landing-stuart-title">
            STUART
          </h1>
          <p className="landing-mission">
            Observe.
            <br />
            Understand.
            <br />
            Act.
          </p>
          <p className="landing-description">
            Stuart is an intelligent operations platform that continuously observes your
            environment, correlates information across systems, and helps operators
            understand what requires their attention.
          </p>
        </section>

        <div className="landing-actions">
          <button type="button" className="landing-btn" onClick={onAccessStuart}>
            Access Stuart
          </button>
        </div>
      </main>

      <footer className="landing-footer">
        <nav className="landing-footer-nav" aria-label="Future site sections">
          <span className="footer-link footer-link-disabled" title="Coming soon">
            Documentation
          </span>
          <span className="footer-link footer-link-disabled" title="Coming soon">
            Downloads
          </span>
          <span className="footer-link footer-link-disabled" title="Coming soon">
            Support
          </span>
          <span className="footer-link footer-link-disabled" title="Coming soon">
            Contact
          </span>
        </nav>
        <p className="landing-footer-meta">{EXPERIENCE_LAB_VERSION}</p>
      </footer>
    </div>
  )
}
