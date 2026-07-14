export interface ProductImageResult {
  sourceUrl: string
  imageUrl: string | null
  error?: string
}

export async function fetchProductImageUrl(sourceUrl: string): Promise<ProductImageResult> {
  try {
    const response = await fetch(
      `/api/product-image?url=${encodeURIComponent(sourceUrl.trim())}`,
    )
    const payload = (await response.json()) as { imageUrl?: string; error?: string }

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
      error: 'Network error',
    }
  }
}

export function parseProductLinks(text: string): string[] {
  const seen = new Set<string>()
  const links: string[] = []

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    links.push(trimmed)
  }

  return links
}

export function proxyImageUrl(imageUrl: string): string {
  return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
}
