import { useEffect, useState } from 'react'
import { ExternalLink, Mail, X } from 'lucide-react'
import { apiFetch } from '../../utils/backend'
import { VoucherCard } from '../VoucherCard'
import {
  Badge,
  LoadingState,
  cardClass,
  formatDate,
  inputClass,
  labelClass,
  primaryButton,
  secondaryButton,
  shekel,
  useAdminData,
} from './shared'

interface AdminVoucher {
  id: string
  code: string
  packagesCount: number
  packagesRedeemed: number
  packagesRemaining: number
  recipientNames: string
  recipientEmail: string
  recipientPhone: string
  giverName: string
  personalMessage: string
  deliveryMethod: 'email' | 'whatsapp' | 'self'
  status: 'pending_send' | 'sent' | 'partially_redeemed' | 'redeemed' | 'cancelled'
  redeemUrl: string
  buyerName: string
  buyerEmail: string
  pricePaid: number
  createdAt: string
  sentAt: string | null
  redemptions: { orderId: string; packagesUsed: number; createdAt: string }[]
}

const statusInfo = {
  pending_send: { label: 'ממתין לשליחה', tone: 'warn' },
  sent: { label: 'נשלח', tone: 'ok' },
  partially_redeemed: { label: 'מומש חלקית', tone: 'warn' },
  redeemed: { label: 'מומש במלואו', tone: 'neutral' },
  cancelled: { label: 'בוטל', tone: 'bad' },
} as const

const deliveryLabel = { email: 'מייל למקבל', whatsapp: 'וואטסאפ', self: 'לרוכש' }

interface Settings {
  roomPrice: number
  giftVoucherPrices: Record<string, number>
  giftVoucherEmail: Record<string, string>
  guideVideos: GuideVideo[]
  emailConfigured: boolean
  paymentProvider: string
}

export interface GuideVideo {
  id: string
  title: string
  description: string
  image: string
  videoUrl: string
}

export const DEFAULT_GUIDE_VIDEOS: GuideVideo[] = [
  { id: 'corner', title: 'הפינה המושלמת', description: 'איך לבחור מיטה ושידה שלא תופסות את כל החדר.', image: '/assets/masterclass-corner.png', videoUrl: '' },
  { id: 'cabinet', title: 'אחסון חכם', description: 'איך לתכנן ארונות ומדפים שנשארים מסודרים גם כשהילד גדל.', image: '/assets/masterclass-storage.png', videoUrl: '' },
  { id: 'play', title: 'משחקים או למידה?', description: 'פינה אחת שאפשר לשחק בה וגם להכין בה שיעורים.', image: '/assets/masterclass-play.png', videoUrl: '' },
]

const emailFields: { key: string; label: string; multiline?: boolean }[] = [
  { key: 'subject', label: 'נושא המייל' },
  { key: 'intro', label: 'שורת פתיחה' },
  { key: 'body', label: 'גוף המייל', multiline: true },
  { key: 'defaultBlessing', label: 'ברכה קבועה (כשהרוכש לא כתב ברכה)' },
  { key: 'signature', label: 'חתימה' },
]

export function SettingsPanel() {
  const { data, loading, error, reload } = useAdminData<Settings>('/api/admin/settings')
  const [draft, setDraft] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (data) setDraft({ ...data, guideVideos: data.guideVideos?.length ? data.guideVideos : DEFAULT_GUIDE_VIDEOS })
  }, [data])

  const save = async () => {
    if (!draft) return
    setSaving(true)
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: {
          roomPrice: draft.roomPrice,
          giftVoucherPrices: draft.giftVoucherPrices,
          giftVoucherEmail: draft.giftVoucherEmail,
          guideVideos: draft.guideVideos,
        },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      await reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'שמירה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  return (
    <LoadingState loading={loading} error={error}>
      {draft && (
        <div className="space-y-5">
          {(!draft.emailConfigured || draft.paymentProvider === 'demo') && (
            <div className="rounded-sm border border-[#F0DFC0] bg-[#FBF3E3] p-4 text-sm text-[#8B6A2B]">
              {draft.paymentProvider === 'demo' && <p>מצב תשלום: דמו — כל רכישה מאושרת בלי חיוב. יש לחבר ספק סליקה לפני ההשקה.</p>}
              {!draft.emailConfigured && <p>שליחת מיילים לא הוגדרה בשרת (RESEND_API_KEY) — שוברים ודוחות לא יישלחו במייל.</p>}
            </div>
          )}

          <div className={cardClass}>
            <h3 className="mb-3 text-lg font-normal text-[#4A4A4A]">מחירים</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <label>
                <span className={labelClass}>מחיר חבילה לחדר (חדר נוסף: 20% הנחה)</span>
                <input className={inputClass} type="number" min="1" value={draft.roomPrice} onChange={(e) => setDraft({ ...draft, roomPrice: Number(e.target.value) })} />
              </label>
              {Object.keys(draft.giftVoucherPrices).sort().map((count) => (
                <label key={count}>
                  <span className={labelClass}>שובר מתנה — {count === '1' ? 'חבילה אחת' : `${count} חבילות`}</span>
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    value={draft.giftVoucherPrices[count]}
                    onChange={(e) => setDraft({ ...draft, giftVoucherPrices: { ...draft.giftVoucherPrices, [count]: Number(e.target.value) } })}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="mb-3 text-lg font-normal text-[#4A4A4A]">תוכן המייל לשובר מתנה</h3>
            <p className="mb-3 text-xs text-[#8B8B8B]">שמות המקבלים, מספר החבילות, שם הנותן והקוד מתמלאים אוטומטית. הסכום לא מוצג במייל.</p>
            <div className="space-y-3">
              {emailFields.map((field) => (
                <label key={field.key} className="block">
                  <span className={labelClass}>{field.label}</span>
                  {field.multiline ? (
                    <textarea
                      className={`${inputClass} min-h-20`}
                      value={draft.giftVoucherEmail[field.key] || ''}
                      onChange={(e) => setDraft({ ...draft, giftVoucherEmail: { ...draft.giftVoucherEmail, [field.key]: e.target.value } })}
                    />
                  ) : (
                    <input
                      className={inputClass}
                      value={draft.giftVoucherEmail[field.key] || ''}
                      onChange={(e) => setDraft({ ...draft, giftVoucherEmail: { ...draft.giftVoucherEmail, [field.key]: e.target.value } })}
                    />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="mb-1 text-lg font-normal text-[#4A4A4A]">סרטוני הדרכה באזור האישי</h3>
            <p className="mb-3 text-xs text-[#8B8B8B]">קישור YouTube, Vimeo או קובץ וידאו (https). בלי קישור יוצג "בקרוב".</p>
            <div className="space-y-4">
              {draft.guideVideos.map((video, index) => {
                const set = (partial: Partial<GuideVideo>) => {
                  const next = [...draft.guideVideos]
                  next[index] = { ...video, ...partial }
                  setDraft({ ...draft, guideVideos: next })
                }
                return (
                  <div key={video.id} className="grid gap-2 rounded-sm bg-[#F9F7F4] p-3 sm:grid-cols-2">
                    <input className={inputClass} placeholder="כותרת" value={video.title} onChange={(e) => set({ title: e.target.value })} />
                    <input className={inputClass} dir="ltr" placeholder="https://youtube.com/..." value={video.videoUrl} onChange={(e) => set({ videoUrl: e.target.value })} />
                    <input className={inputClass} placeholder="תיאור" value={video.description} onChange={(e) => set({ description: e.target.value })} />
                    <input className={inputClass} dir="ltr" placeholder="תמונה" value={video.image} onChange={(e) => set({ image: e.target.value })} />
                  </div>
                )
              })}
            </div>
          </div>

          <button type="button" onClick={save} disabled={saving} className={primaryButton}>
            {saved ? 'נשמר ✓' : 'שמירת ההגדרות'}
          </button>
        </div>
      )}
    </LoadingState>
  )
}

export function VouchersTab() {
  const { data, loading, error, reload } = useAdminData<{ vouchers: AdminVoucher[] }>('/api/admin/vouchers')
  const [viewing, setViewing] = useState<AdminVoucher | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  const act = async (voucher: AdminVoucher, action: 'resend' | 'cancel') => {
    if (action === 'cancel' && !confirm(`לבטל את השובר ${voucher.code}? הוא לא יהיה ניתן למימוש.`)) return
    const refundOrder = action === 'cancel' && confirm('לסמן גם את עסקת הרכישה כהחזר כספי?')
    setBusy(voucher.id)
    try {
      await apiFetch(`/api/admin/vouchers/${voucher.id}/${action}`, { body: { refundOrder } })
      if (action === 'resend') alert('המייל נשלח שוב')
      await reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'הפעולה נכשלה')
    } finally {
      setBusy(null)
    }
  }

  const vouchers = (data?.vouchers || []).filter((v) => !filter || v.status === filter)

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-light text-[#4A4A4A]">שוברי מתנה</h2>
          <select className={`${inputClass} w-auto`} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">כל הסטטוסים</option>
            {Object.entries(statusInfo).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label}
              </option>
            ))}
          </select>
        </div>

        {viewing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setViewing(null)}>
            <div className="max-h-full w-full max-w-md overflow-auto rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setViewing(null)} className="mb-2 text-[#8B8B8B]" aria-label="סגירה">
                <X className="h-5 w-5" />
              </button>
              <VoucherCard {...viewing} />
            </div>
          </div>
        )}

        <LoadingState loading={loading} error={error}>
          {vouchers.length === 0 && <p className="text-sm text-[#A39A8F]">אין שוברים</p>}
          <div className="space-y-2">
            {vouchers.map((v) => (
              <article key={v.id} className={`${cardClass} text-sm`}>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span dir="ltr" className="font-medium text-[#3C3834]">{v.code}</span>
                  <Badge tone={statusInfo[v.status].tone}>{statusInfo[v.status].label}</Badge>
                  <span>{formatDate(v.createdAt)}</span>
                  <span>
                    {v.packagesCount} חבילות · נותרו {v.packagesRemaining}
                  </span>
                  <span className="ms-auto">{shekel(v.pricePaid)}</span>
                </div>
                <div className="mt-2 grid gap-1 text-xs text-[#6B6B6B] sm:grid-cols-2">
                  <p>רוכש: {v.buyerName || '—'} · {v.buyerEmail}</p>
                  <p>
                    מקבל: {v.recipientNames} · {v.recipientEmail || v.recipientPhone || '—'} · {deliveryLabel[v.deliveryMethod]}
                  </p>
                  {v.redemptions.length > 0 && (
                    <p>מימושים: {v.redemptions.map((r) => `${r.packagesUsed} ב־${formatDate(r.createdAt)}`).join(', ')}</p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className={secondaryButton} onClick={() => setViewing(v)}>
                    צפייה בשובר
                  </button>
                  <a className={secondaryButton} href={v.redeemUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" /> עמוד המימוש
                  </a>
                  {v.status !== 'cancelled' && (
                    <>
                      <button type="button" className={secondaryButton} disabled={busy === v.id} onClick={() => act(v, 'resend')}>
                        <Mail className="h-3.5 w-3.5" /> שליחה חוזרת
                      </button>
                      <button type="button" className={secondaryButton} disabled={busy === v.id} onClick={() => act(v, 'cancel')}>
                        ביטול שובר
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </LoadingState>
      </section>
    </div>
  )
}
