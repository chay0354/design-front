import { apiUrl } from './api'

export interface ProductImageResult {
  sourceUrl: string
  imageUrl: string | null
  error?: string
  productUrl?: string | null
}

export type ParsedProductEntry =
  | { kind: 'product'; url: string }
  | { kind: 'image'; url: string }

const URL_IN_TEXT_RE = /https?:\/\/[^\s<>"']+/gi
const DIRECT_IMAGE_RE = /\.alicdn\.com\/.*\.(?:jpg|jpeg|png|webp)(?:_\d+x\d+)?(?:\.jpg)?/i

function normalizeExtractedUrl(raw: string): string {
  return raw.replace(/[.,;:!?)>\]]+$/, '').trim()
}

function isDirectImageUrl(url: string): boolean {
  return DIRECT_IMAGE_RE.test(url)
}

export function parseProductLinks(text: string): string[] {
  return parseProductEntries(text).map((entry) => entry.url)
}

export function parseProductEntries(text: string): ParsedProductEntry[] {
  const seen = new Set<string>()
  const entries: ParsedProductEntry[] = []

  for (const match of text.matchAll(URL_IN_TEXT_RE)) {
    const normalized = normalizeExtractedUrl(match[0])
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    entries.push({
      kind: isDirectImageUrl(normalized) ? 'image' : 'product',
      url: normalized,
    })
  }

  if (entries.length > 0) {
    return entries
  }

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || seen.has(trimmed)) continue
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      seen.add(trimmed)
      entries.push({
        kind: isDirectImageUrl(trimmed) ? 'image' : 'product',
        url: trimmed,
      })
    }
  }

  return entries
}

export async function fetchProductImageUrl(sourceUrl: string): Promise<ProductImageResult> {
  if (isDirectImageUrl(sourceUrl)) {
    return {
      sourceUrl,
      imageUrl: sourceUrl,
    }
  }

  try {
    const response = await fetch(
      apiUrl(`/api/product-image?url=${encodeURIComponent(sourceUrl.trim())}`),
    )

    const raw = await response.text()
    let payload = {} as {
      imageUrl?: string
      error?: string
      productUrl?: string | null
    }
    try {
      payload = JSON.parse(raw) as typeof payload
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
        productUrl: payload.productUrl ?? null,
        error: payload.error ?? 'Failed to fetch image',
      }
    }

    return {
      sourceUrl,
      imageUrl: payload.imageUrl ?? null,
      productUrl: payload.productUrl ?? null,
    }
  } catch {
    return {
      sourceUrl,
      imageUrl: null,
      error: 'Network error — could not reach API',
    }
  }
}

export function proxyImageUrl(imageUrl: string): string {
  return apiUrl(`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`)
}

export const COLLAGE_BOOKMARKLET = `javascript:(function(){var img=document.querySelector('meta[property=\"og:image\"]')?.content||document.querySelector('img[class*=\"product-image\"], img[data-pl=\"product-image\"]')?.src;if(!img){alert('No product image found on this page');return;}if(window.opener){window.opener.postMessage({type:'petite-collage-image',source:location.href,imageUrl:img},'*');alert('Image sent back to Petite Dreams collage tab');}else{prompt('Copy image URL:',img);}})();`
