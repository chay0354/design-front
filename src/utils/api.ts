function resolveApiBase(): string {
  const configured = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  if (configured) return configured
  // Same-origin /api — proxied by Vite in dev and by vercel.json in production.
  return ''
}

export function apiUrl(path: string): string {
  const base = resolveApiBase()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${normalizedPath}` : normalizedPath
}
