import { apiUrl } from './api'

export interface ProductImageResult {
  sourceUrl: string
  imageUrl: string | null
  error?: string
}

export async function fetchProductImageUrl(sourceUrl: string): Promise<ProductImageResult> {
  try {
    const response = await fetch(
      apiUrl(`/api/product-image?url=${encodeURIComponent(sourceUrl.trim())}`),
    )

    const raw = await response.text()
    let payload: { imageUrl?: string; error?: string } = {}
    try {
      payload = JSON.parse(raw) as { imageUrl?: string; error?: string }
    } catch {
      return {
        sourceUrl,
        imageUrl: null,
        error: response.ok ? 'Invalid API response' : 'API unavailable — check backend deployment',
      }
    }

    if (!response.ok) {
      return {
        sourceUrl,
        imageUrl: null,
        error: payload.error ?? 'Failed to fetch image',
      }
    }

    return {
      sourceUrl,
      imageUrl: payload.imageUrl ?? null,
    }
  } catch {
    return {
      sourceUrl,
      imageUrl: null,
      error: 'Network error — could not reach API',
    }
  }
}

const URL_IN_TEXT_RE = /https?:\/\/[^\s<>"']+/gi

function normalizeExtractedUrl(raw: string): string {
  return raw.replace(/[.,;:!?)>\]]+$/, '').trim()
}

export function parseProductLinks(text: string): string[] {
  const seen = new Set<string>()
  const links: string[] = []

  for (const match of text.matchAll(URL_IN_TEXT_RE)) {
    const normalized = normalizeExtractedUrl(match[0])
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    links.push(normalized)
  }

  if (links.length > 0) {
    return links
  }

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || seen.has(trimmed)) continue
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      seen.add(trimmed)
      links.push(trimmed)
    }
  }

  return links
}

export function proxyImageUrl(imageUrl: string): string {
  return apiUrl(`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`)
}
