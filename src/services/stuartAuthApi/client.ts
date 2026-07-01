/** Low-level HTTP client for Stuart Authentication Service. */

import { getStuartAuthServiceBaseUrl } from './config'

export async function stuartAuthRequest(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const baseUrl = getStuartAuthServiceBaseUrl()
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  })
}
