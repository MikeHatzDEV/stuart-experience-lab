import { useState } from 'react'
import { StuartOrb } from '../StuartOrb'
import { EXPERIENCE_LAB_VERSION } from '../app/version'
import './LandingPage.css'

type LandingPageProps = {
  onAccessStuart: () => void
}

export function LandingPage({ onAccessStuart }: LandingPageProps) {
  const [learnMoreOpen, setLearnMoreOpen] = useState(false)

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
            Stuart is an intelligent operations platform that helps organizations
            observe their systems, understand what matters, and act with confidence.
          </p>
        </section>

        <div className="landing-actions">
          <button
            type="button"
            className="landing-btn landing-btn-secondary"
            onClick={() => setLearnMoreOpen((open) => !open)}
            aria-expanded={learnMoreOpen}
            aria-controls="learn-more-panel"
          >
            Learn More
          </button>
          <button type="button" className="landing-btn landing-btn-primary" onClick={onAccessStuart}>
            Access Stuart
          </button>
        </div>

        {learnMoreOpen && (
          <aside
            id="learn-more-panel"
            className="landing-learn-more"
            aria-label="About Stuart"
          >
            <p className="landing-learn-more-label">About Stuart</p>
            <p>
              Stuart brings continuous observation, contextual understanding, and
              guided action into a single experience for modern operations teams.
              This public site introduces Stuart and directs you into the platform.
            </p>
            <p className="landing-learn-more-note">
              Full documentation and product details will be available in a future release.
            </p>
          </aside>
        )}
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
        <p className="landing-footer-meta">
          © Signal Lab Systems · {EXPERIENCE_LAB_VERSION}
        </p>
      </footer>
    </div>
  )
}
