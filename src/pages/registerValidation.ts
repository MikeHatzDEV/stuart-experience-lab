/** Client-side registration form validation (pre-submit). */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type RegisterFormValues = {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

export type RegisterFieldErrors = Partial<
  Record<'displayName' | 'email' | 'password' | 'confirmPassword', string>
>

export function validateRegisterForm(values: RegisterFormValues): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {}
  const displayName = values.displayName.trim()
  const email = values.email.trim()

  if (!displayName) {
    errors.displayName = 'Display name is required.'
  } else if (displayName.length < 2) {
    errors.displayName = 'Display name must be at least 2 characters.'
  } else if (displayName.length > 100) {
    errors.displayName = 'Display name must be at most 100 characters.'
  }

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 10) {
    errors.password = 'Password must be at least 10 characters.'
  } else if (values.password.length > 128) {
    errors.password = 'Password must be at most 128 characters.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export function hasRegisterFieldErrors(errors: RegisterFieldErrors): boolean {
  return Object.keys(errors).length > 0
}
