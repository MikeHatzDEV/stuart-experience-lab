/** Stuart Authentication Service HTTP configuration. */

export function getStuartAuthServiceBaseUrl(): string {
  const configured = import.meta.env.VITE_STUART_AUTH_SERVICE_URL
  if (!configured) {
    throw new Error(
      'VITE_STUART_AUTH_SERVICE_URL is not configured. See .env.example.',
    )
  }
  return configured.replace(/\/$/, '')
}
