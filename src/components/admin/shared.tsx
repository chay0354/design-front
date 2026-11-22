import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { apiFetch } from '../../utils/backend'

export const inputClass =
  'w-full rounded-sm border border-[#E8DED2] bg-[#F9F7F4] px-3 py-2 text-sm focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none'
export const labelClass = 'mb-1 block text-xs font-normal text-[#6B6B6B]'
export const cardClass = 'rounded-sm border border-[#E8DED2] bg-white p-5 shadow-sm'
export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-sm bg-[#C8B6A6] px-4 py-2 text-sm text-white transition-colors hover:bg-[#B5A99A] disabled:cursor-not-allowed disabled:opacity-50'
export const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-sm border border-[#E8DED2] bg-white px-3 py-1.5 text-sm text-[#4A4A4A] transition-colors hover:bg-[#F9F7F4] disabled:opacity-50'

export const shekel = (value: number | string | null | undefined) =>
  `₪${Number(value || 0).toLocaleString('he-IL', { maximumFractionDigits: 2 })}`
export const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('he-IL') : '—')
export const toDateInput = (date: Date) => date.toISOString().slice(0, 10)

/** Loads an admin endpoint, with reload and error state. */
export function useAdminData<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!path) return
    setLoading(true)
    setError('')
    try {
      setData(await apiFetch<T>(path))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינה')
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, error, loading, reload, setData }
}

export function LoadingState({ loading, error, children }: { loading: boolean; error: string; children: ReactNode }) {
  if (error) {
    return (
      <div className="rounded-sm border border-[#E8C5C5] bg-[#FCF0F0] p-4 text-sm text-[#A05A5A]">
        {error}
        {/SUPABASE_SERVICE_ROLE_KEY|relation|does not exist/i.test(error) && (
          <p className="mt-1 text-xs">יש להריץ את ה־migration החדשה ולהגדיר את SUPABASE_SERVICE_ROLE_KEY בשרת.</p>
        )}
      </div>
    )
  }
  if (loading) {
    return (
      <p className="flex items-center gap-2 py-8 text-sm text-[#8B8B8B]">
        <Loader2 className="h-4 w-4 animate-spin" /> טוען...
      </p>
    )
  }
  return <>{children}</>
}

export function StatCard({
  label,
  value,
  previous,
  format = (v) => String(v),
  onClick,
}: {
  label: string
  value: number
  previous?: number
  format?: (value: number) => string
  onClick?: () => void
}) {
  const delta = previous === undefined || previous === null ? null : value - previous
  const pct = delta !== null && previous ? Math.round((delta / previous) * 100) : null
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-sm border border-[#E8DED2] bg-white p-4 text-right ${onClick ? 'transition-colors hover:bg-[#F9F7F4]' : ''}`}
    >
      <p className="text-xs text-[#8B8B8B]">{label}</p>
      <p className="mt-1 text-2xl font-light text-[#3C3834]">{format(value)}</p>
      {delta !== null && (
        <p className={`mt-1 text-xs ${delta > 0 ? 'text-[#5C8A45]' : delta < 0 ? 'text-[#A05A5A]' : 'text-[#8B8B8B]'}`}>
          {delta > 0 ? '▲' : delta < 0 ? '▼' : '•'} {format(Math.abs(delta))}
          {pct !== null ? ` (${pct > 0 ? '+' : ''}${pct}%)` : ''} מהתקופה הקודמת
        </p>
      )}
    </Tag>
  )
}

/** Simple horizontal bars — readable on phone and desktop without a chart library. */
export function BarList({ items, format = (v) => String(v), empty = 'אין נתונים' }: {
  items: { name: string; count: number }[]
  format?: (value: number) => string
  empty?: string
}) {
  if (items.length === 0) return <p className="text-sm text-[#A39A8F]">{empty}</p>
  const max = Math.max(...items.map((i) => i.count), 1)
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.name} className="text-sm">
          <div className="mb-0.5 flex justify-between gap-2 text-[#4A4A4A]">
            <span className="truncate">{item.name}</span>
            <span className="shrink-0 tabular-nums">{format(item.count)}</span>
          </div>
          <div className="h-2 rounded-full bg-[#F1ECE5]">
            <div className="h-2 rounded-full bg-[#C8B6A6]" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Vertical bars over time with values on hover/tap. */
export function ColumnChart({ points, valueKey, format = (v) => String(v) }: {
  points: Record<string, number | string>[]
  valueKey: string
  format?: (value: number) => string
}) {
  const values = points.map((p) => Number(p[valueKey]) || 0)
  const max = Math.max(...values, 1)
  const [active, setActive] = useState<number | null>(null)
  if (points.length === 0) return <p className="text-sm text-[#A39A8F]">אין נתונים</p>
  const shown = active ?? values.length - 1
  return (
    <div>
      <p className="mb-2 text-xs text-[#6B6B6B]">
        {String(points[shown].key)}: <span className="text-[#3C3834]">{format(values[shown])}</span>
      </p>
      <div className="flex h-36 items-end gap-[2px]" dir="ltr" onMouseLeave={() => setActive(null)}>
        {values.map((value, index) => (
          <button
            key={String(points[index].key)}
            type="button"
            aria-label={`${points[index].key}: ${format(value)}`}
            onMouseEnter={() => setActive(index)}
            onClick={() => setActive(index)}
            className="flex h-full min-w-[3px] flex-1 items-end"
          >
            <span
              className={`block w-full rounded-t-sm ${index === shown ? 'bg-[#A88A72]' : 'bg-[#D9CBBE]'}`}
              style={{ height: `${Math.max(value > 0 ? 3 : 0, (value / max) * 100)}%` }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-[#A39A8F]" dir="ltr">
        <span>{String(points[0].key)}</span>
        <span>{String(points[points.length - 1].key)}</span>
      </div>
    </div>
  )
}

export function Badge({ tone = 'neutral', children }: { tone?: 'ok' | 'warn' | 'bad' | 'neutral'; children: ReactNode }) {
  const tones = {
    ok: 'bg-[#EEF6EA] text-[#4F7A3A]',
    warn: 'bg-[#FBF3E3] text-[#8B6A2B]',
    bad: 'bg-[#FCEDED] text-[#A05A5A]',
    neutral: 'bg-[#F3EEE8] text-[#6B6B6B]',
  }
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${tones[tone]}`}>{children}</span>
}
