const DEFAULT_PRODUCTION_API = 'https://design-back.vercel.app'

function resolveApiBase(): string {
  const configured = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  if (configured) return configured
  if (import.meta.env.PROD) return DEFAULT_PRODUCTION_API
  return ''
}

const API_BASE = resolveApiBase()

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath
}
