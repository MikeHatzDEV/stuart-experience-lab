/** Registration API — real Stuart Authentication Service integration. */

import { stuartAuthRequest } from './client'
import type {
  PydanticValidationBody,
  RegisterAccountRequest,
  RegisterAccountResult,
  RegisterAccountSuccess,
} from './types'

function mapValidationErrors(
  body: PydanticValidationBody,
): RegisterAccountResult {
  const fieldErrors: NonNullable<Extract<RegisterAccountResult, { ok: false }>['fieldErrors']> =
    {}

  if (Array.isArray(body.detail)) {
    for (const issue of body.detail) {
      const field = issue.loc[issue.loc.length - 1]
      if (field === 'email' || field === 'display_name' || field === 'password') {
        fieldErrors[field] = issue.msg
      }
    }
  }

  return {
    ok: false,
    code: 'ValidationError',
    message: 'Please correct the highlighted fields and try again.',
    fieldErrors,
  }
}

export async function registerAccount(
  request: RegisterAccountRequest,
): Promise<RegisterAccountResult> {
  try {
    const response = await stuartAuthRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(request),
    })

    if (response.status === 201) {
      const data = (await response.json()) as RegisterAccountSuccess
      return { ok: true, data }
    }

    if (response.status === 409) {
      return {
        ok: false,
        code: 'EmailAlreadyExists',
        message: 'An account with this email already exists. Sign in or use a different email.',
        fieldErrors: { email: 'This email is already registered.' },
      }
    }

    if (response.status === 422) {
      const body = (await response.json()) as PydanticValidationBody
      return mapValidationErrors(body)
    }

    return {
      ok: false,
      code: 'ServerUnavailable',
      message: 'The authentication service is temporarily unavailable. Please try again later.',
    }
  } catch {
    return {
      ok: false,
      code: 'ServerUnavailable',
      message:
        'Unable to reach the authentication service. Check your connection and try again.',
    }
  }
}
