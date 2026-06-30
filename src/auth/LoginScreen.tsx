import { useState, type FormEvent } from 'react'
import { StuartOrb } from '../StuartOrb'
import { useAuth } from './AuthContext'
import './LoginScreen.css'

export function LoginScreen() {
  const { signIn, authNotice } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')
  const [mfaCode, setMfaCode] = useState('')

  const handleCredentialsSubmit = (event: FormEvent) => {
    event.preventDefault()
    setStep('mfa')
  }

  const handleMfaSubmit = (event: FormEvent) => {
    event.preventDefault()
    signIn()
  }

  return (
    <div className="login-screen">
      <div className="login-panel">
        <div className="login-brand">STUART</div>

        <div className="login-orb">
          <StuartOrb showStatus={false} />
        </div>

        {step === 'credentials' ? (
          <form className="login-form" onSubmit={handleCredentialsSubmit}>
            <label className="login-field">
              <span className="login-field-label">Email</span>
              <input
                className="login-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="michael@signallabsystems.com"
              />
            </label>

            <label className="login-field">
              <span className="login-field-label">Password</span>
              <input
                className="login-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            <button type="submit" className="login-submit">
              Sign In
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleMfaSubmit}>
            <div className="login-mfa-notice">
              <div className="login-mfa-title">Multi-factor authentication</div>
              <p>Enter the verification code from your authenticator app.</p>
            </div>

            <label className="login-field">
              <span className="login-field-label">Verification code</span>
              <input
                className="login-input login-input-mfa"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="000 000"
              />
            </label>

            <button type="submit" className="login-submit">
              Verify &amp; Continue
            </button>

            <button
              type="button"
              className="login-back"
              onClick={() => setStep('credentials')}
            >
              Back to sign in
            </button>
          </form>
        )}

        <div className="login-preview-notice">
          <div className="login-preview-title">Preview access</div>
          <p>
            Experience Lab preview — mock data only. No passwords are stored. Sign In establishes a
            mock session for UI review.
          </p>
        </div>

        {authNotice ? (
          <div className="login-auth-notice" role="alert">
            {authNotice}
          </div>
        ) : null}
      </div>
    </div>
  )
}
