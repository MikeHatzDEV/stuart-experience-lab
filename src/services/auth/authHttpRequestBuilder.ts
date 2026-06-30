import { PRODUCTION_AUTH_CONFIG } from './authProductionConfig'
import { createAuthRequestId, logAuthRequestSafe } from './authHttpLogging'

export type AuthHttpRequestOptions = {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  timeoutMs?: number
  /** Reserved for future distributed tracing. */
  correlationId?: string
  /** Reserved for future telemetry hooks. */
  traceContext?: string
}

export type AuthHttpRawResult = {
  response: Response
  durationMs: number
  requestId: string
}

const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
} as const

function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  const base = PRODUCTION_AUTH_CONFIG.apiBaseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  return fetch(url, { ...init, signal: controller.signal }).finally(() => {
    window.clearTimeout(timeout)
  })
}

/**
 * Centralized authentication HTTP request builder.
 * All production auth traffic passes through this helper.
 */
export async function executeAuthRequest(
  options: AuthHttpRequestOptions,
): Promise<AuthHttpRawResult> {
  const requestId = createAuthRequestId()
  const startedAt = performance.now()
  const url = buildUrl(options.path)
  const timeoutMs = options.timeoutMs ?? PRODUCTION_AUTH_CONFIG.requestTimeoutMs

  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS,
  }

  if (options.correlationId) {
    headers['X-Correlation-ID'] = options.correlationId
  }

  if (options.traceContext) {
    headers['X-Trace-Context'] = options.traceContext
  }

  const init: RequestInit = {
    method: options.method,
    credentials: 'include',
    headers,
  }

  if (options.body !== undefined && options.method !== 'GET') {
    init.body = JSON.stringify(options.body)
  }

  let response: Response

  try {
    response = await fetchWithTimeout(url, init, timeoutMs)
  } catch {
    const durationMs = Math.round(performance.now() - startedAt)
    logAuthRequestSafe({
      requestId,
      timestamp: new Date().toISOString(),
      method: options.method,
      endpoint: options.path,
      durationMs,
    })
    throw new AuthHttpTransportError('Network request failed.')
  }

  const durationMs = Math.round(performance.now() - startedAt)
  logAuthRequestSafe({
    requestId,
    timestamp: new Date().toISOString(),
    method: options.method,
    endpoint: options.path,
    durationMs,
    status: response.status,
  })

  return { response, durationMs, requestId }
}

export class AuthHttpTransportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthHttpTransportError'
  }
}
