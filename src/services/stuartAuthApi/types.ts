/** Stuart Authentication Service API types. */

export type RegisterAccountRequest = {
  email: string
  display_name: string
  password: string
}

export type RegisterAccountSuccess = {
  user_id: string
  email: string
  display_name: string
  status: string
}

export type RegisterAccountErrorCode =
  | 'EmailAlreadyExists'
  | 'ValidationError'
  | 'ServerUnavailable'

export type RegisterAccountResult =
  | { ok: true; data: RegisterAccountSuccess }
  | {
      ok: false
      code: RegisterAccountErrorCode
      message: string
      fieldErrors?: Partial<Record<'email' | 'display_name' | 'password', string>>
    }

type PydanticValidationIssue = {
  loc: (string | number)[]
  msg: string
}

type PydanticValidationBody = {
  detail?: PydanticValidationIssue[] | string
}

export type { PydanticValidationBody }
