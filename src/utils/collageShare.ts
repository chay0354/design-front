import { supabase } from '../lib/supabase'

const COLLAGE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isCollageId(value: string): boolean {
  return COLLAGE_UUID_RE.test(value)
}

export function collageStoragePath(collageId: string): string {
  return `collage/${collageId}.png`
}

export function getCollageImageUrl(collageId: string): string {
  const { data } = supabase.storage
    .from('package-images')
    .getPublicUrl(collageStoragePath(collageId))
  return data.publicUrl
}

export function buildCollageShareUrl(collageId: string): string {
  if (typeof window === 'undefined') {
    return `/collage/${collageId}`
  }
  return `${window.location.origin}/collage/${collageId}`
}
