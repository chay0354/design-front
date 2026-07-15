const DEFAULT_PRODUCTION_API = 'https://design-back.vercel.app'

function resolveApiBase(): string {
  const configured = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  if (configured) return configured
  if (import.meta.env.PROD) return DEFAULT_PRODUCTION_API
  return ''
}

export function apiUrl(path: string): string {
  const base = resolveApiBase()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${normalizedPath}` : normalizedPath
}
