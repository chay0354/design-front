import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface GuideVideo {
  id: string
  title: string
  description: string
  image: string
  videoUrl: string
}

export interface ApplicationGuide {
  id: string
  title: string
  subtitle: string
  summary: string
  /** Full guide text; blank lines separate paragraphs, lines starting with "- " become bullets. */
  body: string
}

/**
 * Reads an admin-edited, publicly readable setting.
 * undefined while loading, null when nothing was saved (callers then use their defaults).
 */
export function usePublicSetting<T>(key: 'guide_videos' | 'application_guides'): T[] | null | undefined {
  const [value, setValue] = useState<T[] | null | undefined>(undefined)
  useEffect(() => {
    let cancelled = false
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()
      .then(
        ({ data }) => {
          if (cancelled) return
          setValue(Array.isArray(data?.value) && data.value.length > 0 ? (data.value as T[]) : null)
        },
        () => !cancelled && setValue(null),
      )
    return () => {
      cancelled = true
    }
  }, [key])
  return value
}

export const useGuideVideos = () => usePublicSetting<GuideVideo>('guide_videos')
export const useApplicationGuides = () => usePublicSetting<ApplicationGuide>('application_guides')

/** Default toolbox guides, shown until the admin edits them. */
export const DEFAULT_APPLICATION_GUIDES: ApplicationGuide[] = [
  {
    id: 'checklist',
    title: 'צ׳ק ליסט לביצוע מדויק',
    subtitle: 'כל מה שכדאי להכין לפני שמתחילים',
    summary: 'שלבים וטיפים ליישום נקי ומדויק של צבע או חיפוי קיר דקורטיבי, בהתאם לחבילה שבחרתם.',
    body: '',
  },
  {
    id: 'corners',
    title: 'יוצרים פינות מעוצבות',
    subtitle: 'מתאימים את העיצוב לחלל שלכם',
    summary: 'איך למקם ולשלב את האלמנטים בחדר ליצירת פינות הרמוניות ונעימות.',
    body: '',
  },
  {
    id: 'center-wall',
    title: 'הקיר המרכזי',
    subtitle: 'בוחרים את מוקד העיצוב בחדר',
    summary: 'איך לבחור את הקיר הנכון לצבע, חיפוי ותמונות וליצור מוקד עיצובי בחדר.',
    body: '',
  },
]

/** YouTube / Vimeo page links become embeddable player URLs; other https links play as files. */
export function videoEmbed(url: string): { kind: 'iframe' | 'video'; src: string } | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') return { kind: 'iframe', src: `https://www.youtube.com/embed/${parsed.pathname.slice(1)}` }
    if (host.endsWith('youtube.com')) {
      const id = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop()
      return id ? { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` } : null
    }
    if (host.endsWith('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      return id ? { kind: 'iframe', src: `https://player.vimeo.com/video/${id}` } : null
    }
    return { kind: 'video', src: url }
  } catch {
    return null
  }
}
