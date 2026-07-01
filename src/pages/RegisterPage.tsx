import { useState, type FormEvent } from 'react'
import { StuartOrb } from '../StuartOrb'
import { registerAccount } from '../services/stuartAuthApi'
import {
  hasRegisterFieldErrors,
  validateRegisterForm,
  type RegisterFieldErrors,
} from './registerValidation'
import '../auth/LoginScreen.css'
import './RegisterPage.css'

type RegisterPageProps = {
  onSignIn: () => void
  onBack: () => void
}

export function RegisterPage({ onSignIn, onBack }: RegisterPageProps) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const clientErrors = validateRegisterForm({
      displayName,
      email,
      password,
      confirmPassword,
    })
    setFieldErrors(clientErrors)
    if (hasRegisterFieldErrors(clientErrors)) {
      return
    }

    setIsSubmitting(true)
    const result = await registerAccount({
      email: email.trim(),
      display_name: displayName.trim(),
      password,
    })
    setIsSubmitting(false)

    if (result.ok) {
      setIsSuccess(true)
      return
    }

    if (result.fieldErrors) {
      setFieldErrors((current) => ({
        ...current,
        displayName: result.fieldErrors?.display_name ?? current.displayName,
        email: result.fieldErrors?.email ?? current.email,
        password: result.fieldErrors?.password ?? current.password,
      }))
    }

    setFormError(result.message)
  }

  if (isSuccess) {
    return (
      <div className="login-screen">
        <div className="login-panel">
          <div className="login-brand">Signal Lab Systems</div>
          <div className="login-orb">
            <StuartOrb showStatus={false} />
          </div>
          <h1 className="login-title">STUART</h1>
          <div className="register-success" role="status">
            <p className="register-success-title">Account successfully created.</p>
            <p>We&apos;ve created your Stuart account.</p>
            <p>
              Next we&apos;ll verify your email before you can access Stuart.
            </p>
          </div>
          <button type="button" className="login-submit" onClick={onSignIn}>
            Sign In
          </button>
          <button type="button" className="login-home" onClick={onBack}>
            ← Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-screen">
      <div className="login-panel">
        <div className="login-brand">Signal Lab Systems</div>

        <div className="login-orb">
          <StuartOrb showStatus={false} />
        </div>

        <h1 className="login-title">STUART</h1>
        <p className="login-subtitle">Create your account</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-field">
            <span className="login-field-label">Display Name</span>
            <input
              className="login-input"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              aria-invalid={fieldErrors.displayName ? true : undefined}
            />
            {fieldErrors.displayName ? (
              <span className="register-field-error" role="alert">
                {fieldErrors.displayName}
              </span>
            ) : null}
          </label>

          <label className="login-field">
            <span className="login-field-label">Email</span>
            <input
              className="login-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={fieldErrors.email ? true : undefined}
            />
            {fieldErrors.email ? (
              <span className="register-field-error" role="alert">
                {fieldErrors.email}
              </span>
            ) : null}
          </label>

          <label className="login-field">
            <span className="login-field-label">Password</span>
            <input
              className="login-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={fieldErrors.password ? true : undefined}
            />
            {fieldErrors.password ? (
              <span className="register-field-error" role="alert">
                {fieldErrors.password}
              </span>
            ) : null}
          </label>

          <label className="login-field">
            <span className="login-field-label">Confirm Password</span>
            <input
              className="login-input"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={fieldErrors.confirmPassword ? true : undefined}
            />
            {fieldErrors.confirmPassword ? (
              <span className="register-field-error" role="alert">
                {fieldErrors.confirmPassword}
              </span>
            ) : null}
          </label>

          <button type="submit" className="login-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {formError ? (
          <div className="login-auth-notice" role="alert">
            {formError}
          </div>
        ) : null}

        <button type="button" className="login-forgot" onClick={onSignIn}>
          Already have an account? Sign In
        </button>

        <button type="button" className="login-home" onClick={onBack}>
          ← Back to home
        </button>
      </div>
    </div>
  )
}
