const DEFAULT_PRODUCTION_API = 'https://design-back.vercel.app'
const COLLAGE_API_OVERRIDE_KEY = 'petite-dreams-collage-api'

function readCollageApiOverride(): string {
  if (typeof window === 'undefined') return ''
  return (localStorage.getItem(COLLAGE_API_OVERRIDE_KEY) || '').replace(/\/$/, '')
}

function resolveApiBase(): string {
  const override = readCollageApiOverride()
  if (override) return override

  const configured = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  if (configured) return configured
  if (import.meta.env.PROD) return DEFAULT_PRODUCTION_API
  return ''
}

export function getCollageApiOverride(): string {
  return readCollageApiOverride()
}

export function setCollageApiOverride(value: string) {
  if (typeof window === 'undefined') return
  const trimmed = value.trim().replace(/\/$/, '')
  if (trimmed) {
    localStorage.setItem(COLLAGE_API_OVERRIDE_KEY, trimmed)
  } else {
    localStorage.removeItem(COLLAGE_API_OVERRIDE_KEY)
  }
}

export function apiUrl(path: string): string {
  const base = resolveApiBase()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${normalizedPath}` : normalizedPath
}
