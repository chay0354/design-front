import { useMemo, useState } from 'react'
import { CheckCircle2, ExternalLink, Loader2, Mail, RefreshCw } from 'lucide-react'
import { apiFetch } from '../../utils/backend'
import { Badge, LoadingState, cardClass, formatDate, inputClass, primaryButton, secondaryButton, useAdminData } from './shared'

interface LinkCheck {
  id: string
  package_id: string
  package_name: string
  category: string
  item_name: string
  url: string
  status: 'ok' | 'broken' | 'unverified'
  http_status: number | null
  problem: string
  first_failed_at: string | null
  last_checked_at: string | null
  handled_at: string | null
}

interface Run {
  started_at: string
  finished_at: string | null
  total_links: number
  checked_links: number
  ok_count: number
  broken_count: number
  unverified_count: number
  report_sent_at: string | null
}

interface LinksResponse {
  links: LinkCheck[]
  counts: { ok: number; broken: number; unverified: number; total: number }
  lastRun: Run | null
  activeRun: Run | null
}

const statusInfo = {
  ok: { label: 'תקין', tone: 'ok' },
  broken: { label: 'שבור', tone: 'bad' },
  unverified: { label: 'לא ניתן לאמת', tone: 'warn' },
} as const

function LinkRow({ link, onChanged }: { link: LinkCheck; onChanged: () => void }) {
  const [replacing, setReplacing] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (path: string, body: unknown = {}) => {
    setBusy(true)
    try {
      await apiFetch(`/api/admin/links/${link.id}/${path}`, { body })
      onChanged()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'הפעולה נכשלה')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-b border-[#F1ECE5] py-3 text-sm last:border-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Badge tone={statusInfo[link.status].tone}>{statusInfo[link.status].label}</Badge>
        {link.handled_at && <Badge>סומן כטופל</Badge>}
        <span className="text-[#3C3834]">{link.item_name || 'פריט ללא שם'}</span>
        <span className="text-xs text-[#8B8B8B]">
          {link.package_name} · {link.category}
        </span>
        <a href={link.url} target="_blank" rel="noreferrer" className="text-[#8B7340]" aria-label="פתיחת הקישור">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      {link.status !== 'ok' && (
        <p className="mt-1 text-xs text-[#6B6B6B]">
          {link.problem}
          {link.http_status ? ` (HTTP ${link.http_status})` : ''}
          {link.first_failed_at ? ` · נכשל לראשונה ב־${formatDate(link.first_failed_at)}` : ''}
          {link.last_checked_at ? ` · נבדק ב־${formatDate(link.last_checked_at)}` : ''}
        </p>
      )}
      {link.status !== 'ok' && (
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className={secondaryButton} onClick={() => setReplacing(!replacing)}>
            החלפת קישור
          </button>
          <button type="button" className={secondaryButton} disabled={busy} onClick={() => run('recheck')}>
            בדיקה חוזרת
          </button>
          <button type="button" className={secondaryButton} disabled={busy} onClick={() => run('handled', { handled: !link.handled_at })}>
            <CheckCircle2 className="h-3.5 w-3.5" /> {link.handled_at ? 'ביטול סימון' : 'סימון כטופל'}
          </button>
        </div>
      )}
      {replacing && (
        <div className="mt-2 flex gap-2">
          <input className={inputClass} dir="ltr" placeholder="https://..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
          <button
            type="button"
            className={primaryButton}
            disabled={busy || !newUrl.trim()}
            onClick={() => run('replace', { url: newUrl.trim() }).then(() => setReplacing(false))}
          >
            שמירה
          </button>
        </div>
      )}
    </div>
  )
}

export function LinksTab() {
  const { data, loading, error, reload } = useAdminData<LinksResponse>('/api/admin/links')
  const [filter, setFilter] = useState<'problems' | 'all' | 'broken' | 'unverified'>('problems')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState('')

  const runCheck = async () => {
    setRunning(true)
    try {
      for (let i = 0; i < 50; i += 1) {
        const result = await apiFetch<{ run: Run; remaining: number }>('/api/admin/links/run', { body: {} })
        setProgress(`נבדקו ${result.run.checked_links} מתוך ${result.run.total_links}`)
        if (result.remaining === 0) break
      }
      await reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'הבדיקה נכשלה')
    } finally {
      setRunning(false)
      setProgress('')
    }
  }

  const sendReport = async () => {
    try {
      const result = await apiFetch<{ sent: boolean; reason?: string }>('/api/admin/links/report', { body: {} })
      alert(result.sent ? 'הדוח נשלח' : `הדוח לא נשלח: ${result.reason}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'השליחה נכשלה')
    }
  }

  const links = useMemo(() => {
    const all = data?.links || []
    if (filter === 'all') return all
    if (filter === 'problems') return all.filter((l) => l.status !== 'ok')
    return all.filter((l) => l.status === filter)
  }, [data, filter])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-light text-[#4A4A4A]">ניטור קישורי מוצרים</h2>
          <p className="text-xs text-[#8B8B8B]">
            סריקה אוטומטית פעם בשבוע ודוח במייל. קישור מסומן כשבור רק אחרי בדיקה חוזרת; חסימות של אתר הספק מסומנות "לא ניתן לאמת".
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={runCheck} disabled={running} className={primaryButton}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {running ? progress || 'בודקת...' : 'בדיקה עכשיו'}
          </button>
          <button type="button" onClick={sendReport} className={secondaryButton}>
            <Mail className="h-4 w-4" /> שליחת דוח
          </button>
        </div>
      </div>

      <LoadingState loading={loading} error={error}>
        {data && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Count label="סה״כ קישורים" value={data.counts.total} />
              <Count label="תקינים" value={data.counts.ok} />
              <Count label="שבורים" value={data.counts.broken} highlight />
              <Count label="לא ניתן לאמת" value={data.counts.unverified} />
            </div>
            <p className="text-xs text-[#8B8B8B]">
              בדיקה אחרונה: {data.lastRun ? formatDate(data.lastRun.finished_at) : 'עדיין לא בוצעה'}
              {data.activeRun ? ` · בדיקה בתהליך (${data.activeRun.checked_links}/${data.activeRun.total_links})` : ''}
            </p>
            <div className="flex gap-2 text-sm">
              {(
                [
                  ['problems', 'דורשים טיפול'],
                  ['broken', 'שבורים'],
                  ['unverified', 'לא ניתן לאמת'],
                  ['all', 'הכל'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-3 py-1 ${filter === key ? 'bg-[#3F3A36] text-white' : 'bg-[#F3EEE8] text-[#4A4A4A]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={cardClass}>
              {links.length === 0 ? (
                <p className="text-sm text-[#A39A8F]">{filter === 'problems' ? 'אין קישורים שדורשים טיפול 🎉' : 'אין קישורים'}</p>
              ) : (
                links.map((link) => <LinkRow key={link.id} link={link} onChanged={reload} />)
              )}
            </div>
          </>
        )}
      </LoadingState>
    </div>
  )
}

function Count({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-sm border border-[#E8DED2] p-3 ${highlight && value > 0 ? 'bg-[#FCEDED]' : 'bg-white'}`}>
      <p className="text-xs text-[#8B8B8B]">{label}</p>
      <p className="text-2xl font-light text-[#3C3834]">{value}</p>
    </div>
  )
}
