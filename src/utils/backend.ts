import { supabase } from '../lib/supabase'
import { apiUrl } from './api'

export class ApiError extends Error {
  status: number
  details: unknown
  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** JSON request to design-back, sending the Supabase session when signed in. */
export async function apiFetch<T>(
  path: string,
  init: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { ...(init.auth === false ? {} : await authHeader()) }
  if (init.body !== undefined) headers['Content-Type'] = 'application/json'
  const res = await fetch(apiUrl(path), {
    method: init.method || (init.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  })
  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    const body = (data && typeof data === 'object' ? data : {}) as { error?: unknown; details?: unknown }
    const message = body.error ? String(body.error) : `שגיאה (${res.status})`
    throw new ApiError(res.status, message, body.details)
  }
  return data as T
}

/** Downloads an authenticated CSV export (e.g. the monthly influencer report). */
export async function downloadFile(path: string, filename: string) {
  const res = await fetch(apiUrl(path), { headers: await authHeader() })
  if (!res.ok) throw new ApiError(res.status, `ההורדה נכשלה (${res.status})`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
