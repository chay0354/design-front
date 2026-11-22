import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface GuideVideo {
  id: string
  title: string
  description: string
  image: string
  videoUrl: string
}

/** Admin-edited masterclass lessons; null until loaded or when none were saved. */
export function useGuideVideos(): GuideVideo[] | null {
  const [videos, setVideos] = useState<GuideVideo[] | null>(null)
  useEffect(() => {
    let cancelled = false
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'guide_videos')
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && Array.isArray(data?.value) && data.value.length > 0) setVideos(data.value as GuideVideo[])
      })
    return () => {
      cancelled = true
    }
  }, [])
  return videos
}

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
