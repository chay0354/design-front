import { useState } from 'react'
import { Check, Copy, Download, Pencil, Plus } from 'lucide-react'
import { apiFetch, downloadFile } from '../../utils/backend'
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

interface Coupon {
  id: string
  code: string
  influencer_id: string | null
  influencer?: { id: string; name: string } | null
  discount_percent: number
  valid_from: string | null
  valid_until: string | null
  max_uses: number | null
  active: boolean
  description: string
  uses?: number
  sales?: number
  discountGiven?: number
}

interface Influencer {
  id: string
  name: string
  email: string
  phone: string
  instagram: string
  notes: string
  referral_slug: string
  referralUrl: string
  commission_percent: number
  active: boolean
  coupons: Coupon[]
  linkVisits: number
  stats: {
    orders: number
    paidOrders: number
    cancelledOrders: number
    sales: number
    viaCoupon: number
    viaLink: number
    commission: number
    commissionPaid: number
    commissionDue: number
  }
}

interface InfluencerForm {
  name: string
  email: string
  phone: string
  instagram: string
  notes: string
  referralSlug: string
  commissionPercent: string
  couponCode: string
  discountPercent: string
  validUntil: string
  maxUses: string
  active: boolean
}

const emptyForm: InfluencerForm = {
  name: '',
  email: '',
  phone: '',
  instagram: '',
  notes: '',
  referralSlug: '',
  commissionPercent: '10',
  couponCode: '',
  discountPercent: '10',
  validUntil: '',
  maxUses: '',
  active: true,
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          window.prompt('העתיקי:', text)
        }
      }}
      className="text-[#8B7340] hover:text-[#4A4A4A]"
      aria-label="העתקה"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  )
}

function CouponEditor({
  coupon,
  onSaved,
  onCancel,
}: {
  coupon: Partial<Coupon> & { influencer_id?: string | null }
  onSaved: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    code: coupon.code || '',
    discountPercent: String(coupon.discount_percent ?? 10),
    validFrom: coupon.valid_from?.slice(0, 10) || '',
    validUntil: coupon.valid_until?.slice(0, 10) || '',
    maxUses: coupon.max_uses ? String(coupon.max_uses) : '',
    description: coupon.description || '',
    active: coupon.active ?? true,
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    setError('')
    const body = {
      ...form,
      validUntil: form.validUntil ? `${form.validUntil}T23:59:59` : null,
      validFrom: form.validFrom || null,
      maxUses: form.maxUses || null,
      influencerId: coupon.influencer_id || undefined,
    }
    try {
      if (coupon.id) await apiFetch(`/api/admin/coupons/${coupon.id}`, { method: 'PATCH', body })
      else await apiFetch('/api/admin/coupons', { body })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שמירה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="קוד">
          <input className={`${inputClass} uppercase`} dir="ltr" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </Field>
        <Field label="אחוז הנחה">
          <input className={inputClass} type="number" min="1" max="100" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} />
        </Field>
        <Field label="מספר שימושים מרבי (ריק = ללא הגבלה)">
          <input className={inputClass} type="number" min="1" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
        </Field>
        <Field label="בתוקף מ־">
          <input className={inputClass} type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
        </Field>
        <Field label="בתוקף עד">
          <input className={inputClass} type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
        </Field>
        <Field label="תיאור פנימי">
          <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-[#C8B6A6]" />
        פעיל
      </label>
      {error && <p className="mt-2 text-sm text-[#A05A5A]">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={save} disabled={saving} className={primaryButton}>
          שמירה
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          ביטול
        </button>
      </div>
    </div>
  )
}

function couponStatus(coupon: Coupon) {
  const now = Date.now()
  if (!coupon.active) return <Badge tone="neutral">מושבת</Badge>
  if (coupon.valid_until && new Date(coupon.valid_until).getTime() < now) return <Badge tone="bad">פג תוקף</Badge>
  if (coupon.valid_from && new Date(coupon.valid_from).getTime() > now) return <Badge tone="warn">עתידי</Badge>
  if (coupon.max_uses && (coupon.uses ?? 0) >= coupon.max_uses) return <Badge tone="bad">נוצל</Badge>
  return <Badge tone="ok">פעיל</Badge>
}

function CouponRow({ coupon, onEdit, onToggle }: { coupon: Coupon; onEdit: () => void; onToggle: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#F1ECE5] py-2 text-sm last:border-0">
      <span dir="ltr" className="font-medium text-[#3C3834]">{coupon.code}</span>
      <span>{Number(coupon.discount_percent)}% הנחה</span>
      {couponStatus(coupon)}
      <span className="text-[#8B8B8B]">
        {coupon.uses ?? 0}
        {coupon.max_uses ? `/${coupon.max_uses}` : ''} שימושים
      </span>
      {coupon.valid_until && <span className="text-[#8B8B8B]">עד {formatDate(coupon.valid_until)}</span>}
      {coupon.influencer && <span className="text-[#8B8B8B]">· {coupon.influencer.name}</span>}
      <span className="ms-auto flex gap-2">
        <button type="button" onClick={onToggle} className="text-xs text-[#8B7340] hover:underline">
          {coupon.active ? 'השבתה' : 'הפעלה'}
        </button>
        <button type="button" onClick={onEdit} className="text-[#8B7340]" aria-label="עריכה">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </span>
    </div>
  )
}

function InfluencerEditor({ influencer, onSaved, onCancel }: { influencer?: Influencer; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<InfluencerForm>(
    influencer
      ? {
          ...emptyForm,
          name: influencer.name,
          email: influencer.email,
          phone: influencer.phone,
          instagram: influencer.instagram,
          notes: influencer.notes,
          referralSlug: influencer.referral_slug,
          commissionPercent: String(influencer.commission_percent),
          active: influencer.active,
        }
      : emptyForm,
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (partial: Partial<InfluencerForm>) => setForm((current) => ({ ...current, ...partial }))

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      if (influencer) {
        await apiFetch(`/api/admin/influencers/${influencer.id}`, {
          method: 'PATCH',
          body: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            instagram: form.instagram,
            notes: form.notes,
            referralSlug: form.referralSlug,
            commissionPercent: form.commissionPercent,
            active: form.active,
          },
        })
      } else {
        await apiFetch('/api/admin/influencers', {
          body: {
            ...form,
            code: form.couponCode,
            validUntil: form.validUntil ? `${form.validUntil}T23:59:59` : null,
            maxUses: form.maxUses || null,
          },
        })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שמירה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cardClass}>
      <h3 className="mb-4 text-lg font-normal text-[#4A4A4A]">{influencer ? `עריכת ${influencer.name}` : 'משפיענית חדשה'}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="שם *">
          <input className={inputClass} value={form.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="אינסטגרם">
          <input className={inputClass} dir="ltr" value={form.instagram} onChange={(e) => set({ instagram: e.target.value })} />
        </Field>
        <Field label="מייל">
          <input className={inputClass} dir="ltr" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="טלפון">
          <input className={inputClass} dir="ltr" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field label="אחוז עמלה מכל רכישה">
          <input className={inputClass} type="number" min="0" max="100" value={form.commissionPercent} onChange={(e) => set({ commissionPercent: e.target.value })} />
        </Field>
        <Field label="כתובת קישור הפניה (באנגלית, למשל maya)">
          <input className={inputClass} dir="ltr" value={form.referralSlug} onChange={(e) => set({ referralSlug: e.target.value })} />
        </Field>
        {!influencer && (
          <>
            <Field label="קוד קופון אישי, למשל MAYA15">
              <input className={`${inputClass} uppercase`} dir="ltr" value={form.couponCode} onChange={(e) => set({ couponCode: e.target.value })} />
            </Field>
            <Field label="אחוז הנחה ללקוחות">
              <input className={inputClass} type="number" min="1" max="100" value={form.discountPercent} onChange={(e) => set({ discountPercent: e.target.value })} />
            </Field>
            <Field label="תוקף הקופון (ריק = ללא)">
              <input className={inputClass} type="date" value={form.validUntil} onChange={(e) => set({ validUntil: e.target.value })} />
            </Field>
            <Field label="מספר שימושים מרבי (ריק = ללא הגבלה)">
              <input className={inputClass} type="number" min="1" value={form.maxUses} onChange={(e) => set({ maxUses: e.target.value })} />
            </Field>
          </>
        )}
        <div className="sm:col-span-2">
          <Field label="הערות">
            <textarea className={`${inputClass} min-h-16`} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </Field>
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.active} onChange={(e) => set({ active: e.target.checked })} className="accent-[#C8B6A6]" />
        פעילה (כשמושבתת — הקופון והקישור שלה מפסיקים לעבוד)
      </label>
      {error && <p className="mt-2 text-sm text-[#A05A5A]">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={save} disabled={saving || !form.name.trim()} className={primaryButton}>
          שמירה
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          ביטול
        </button>
      </div>
    </div>
  )
}

export function InfluencersTab({ onShowOrders }: { onShowOrders: (filter: { influencerId?: string; couponId?: string; label: string }) => void }) {
  const influencers = useAdminData<{ influencers: Influencer[] }>('/api/admin/influencers')
  const coupons = useAdminData<{ coupons: Coupon[] }>('/api/admin/coupons')
  const [editing, setEditing] = useState<Influencer | 'new' | null>(null)
  const [couponDraft, setCouponDraft] = useState<(Partial<Coupon> & { influencer_id?: string | null }) | null>(null)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))

  const reloadAll = () => {
    void influencers.reload()
    void coupons.reload()
  }

  const toggleCoupon = async (coupon: Coupon) => {
    await apiFetch(`/api/admin/coupons/${coupon.id}`, { method: 'PATCH', body: { active: !coupon.active } })
    reloadAll()
  }

  const markPaid = async (influencer: Influencer) => {
    if (!confirm(`לסמן עמלה של ${shekel(influencer.stats.commissionDue)} ל${influencer.name} כשולמה?`)) return
    await apiFetch(`/api/admin/influencers/${influencer.id}/mark-paid`, { body: {} })
    reloadAll()
  }

  const generalCoupons = (coupons.data?.coupons || []).filter((c) => !c.influencer_id)
  const couponsById = new Map((coupons.data?.coupons || []).map((c) => [c.id, c]))

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-light text-[#4A4A4A]">משפיעניות</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={`${inputClass} w-auto`} />
            <button
              type="button"
              className={secondaryButton}
              onClick={() => downloadFile(`/api/admin/influencers/report.csv?month=${month}`, `influencers-${month}.csv`).catch((e) => alert(e.message))}
            >
              <Download className="h-4 w-4" /> דוח חודשי לאקסל
            </button>
            <button type="button" onClick={() => setEditing('new')} className={primaryButton}>
              <Plus className="h-4 w-4" /> משפיענית חדשה
            </button>
          </div>
        </div>

        {editing && (
          <div className="mb-6">
            <InfluencerEditor
              influencer={editing === 'new' ? undefined : editing}
              onCancel={() => setEditing(null)}
              onSaved={() => {
                setEditing(null)
                reloadAll()
              }}
            />
          </div>
        )}

        <LoadingState loading={influencers.loading} error={influencers.error}>
          {influencers.data?.influencers.length === 0 && (
            <p className="rounded-sm border border-dashed border-[#E8DED2] p-8 text-center text-sm text-[#8B8B8B]">
              עדיין אין משפיעניות. הוסיפי את הראשונה — ייווצרו לה קוד קופון וקישור הפניה אישי.
            </p>
          )}
          <div className="space-y-4">
            {influencers.data?.influencers.map((inf) => (
              <article key={inf.id} className={cardClass}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg text-[#3C3834]">
                      {inf.name}
                      {!inf.active && <Badge>מושבתת</Badge>}
                    </h3>
                    <p className="text-xs text-[#8B8B8B]">
                      {[inf.instagram, inf.email, inf.phone].filter(Boolean).join(' · ')} · עמלה {Number(inf.commission_percent)}%
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-[#6B6B6B]" dir="ltr">
                      <span className="truncate">{inf.referralUrl}</span>
                      <CopyButton text={inf.referralUrl} />
                    </p>
                  </div>
                  <button type="button" onClick={() => setEditing(inf)} className={secondaryButton}>
                    <Pencil className="h-3.5 w-3.5" /> עריכה
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Mini label="רכישות ששולמו" value={String(inf.stats.paidOrders)} hint={`${inf.stats.viaCoupon} בקוד · ${inf.stats.viaLink} בקישור`} />
                  <Mini label="סכום מכירות" value={shekel(inf.stats.sales)} hint={inf.stats.cancelledOrders ? `${inf.stats.cancelledOrders} בוטלו` : `${inf.linkVisits} כניסות מהקישור`} />
                  <Mini label="עמלה שנצברה" value={shekel(inf.stats.commission)} hint={`שולם ${shekel(inf.stats.commissionPaid)}`} />
                  <Mini label="יתרה לתשלום" value={shekel(inf.stats.commissionDue)} highlight={inf.stats.commissionDue > 0} />
                </div>

                <div className="mt-4">
                  <p className="mb-1 text-xs text-[#8B8B8B]">קודי קופון</p>
                  {inf.coupons.length === 0 && <p className="text-sm text-[#A39A8F]">אין קוד קופון</p>}
                  {inf.coupons.map((c) => {
                    const full = couponsById.get(c.id) || c
                    return (
                      <CouponRow key={c.id} coupon={full} onEdit={() => setCouponDraft(full)} onToggle={() => toggleCoupon(full)} />
                    )
                  })}
                  {couponDraft && couponDraft.influencer_id === inf.id && (
                    <div className="mt-2">
                      <CouponEditor
                        coupon={couponDraft}
                        onCancel={() => setCouponDraft(null)}
                        onSaved={() => {
                          setCouponDraft(null)
                          reloadAll()
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className={secondaryButton} onClick={() => setCouponDraft({ influencer_id: inf.id, active: true })}>
                    <Plus className="h-3.5 w-3.5" /> קוד נוסף
                  </button>
                  <button type="button" className={secondaryButton} onClick={() => onShowOrders({ influencerId: inf.id, label: `רכישות של ${inf.name}` })}>
                    לרכישות
                  </button>
                  <button
                    type="button"
                    className={secondaryButton}
                    onClick={() => downloadFile(`/api/admin/influencers/report.csv?month=${month}&influencerId=${inf.id}`, `${inf.referral_slug}-${month}.csv`).catch((e) => alert(e.message))}
                  >
                    <Download className="h-3.5 w-3.5" /> דוח {month}
                  </button>
                  {inf.stats.commissionDue > 0 && (
                    <button type="button" className={primaryButton} onClick={() => markPaid(inf)}>
                      סימון עמלה כשולמה
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </LoadingState>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-light text-[#4A4A4A]">קופוני הנחה כלליים</h2>
            <p className="text-xs text-[#8B8B8B]">קופונים שאינם קשורים למשפיענית. קופון אחד לכל הזמנה, ללא כפל הנחות.</p>
          </div>
          <button type="button" onClick={() => setCouponDraft({ influencer_id: null, active: true })} className={primaryButton}>
            <Plus className="h-4 w-4" /> קופון חדש
          </button>
        </div>
        {couponDraft && !couponDraft.influencer_id && (
          <div className="mb-4">
            <CouponEditor
              coupon={couponDraft}
              onCancel={() => setCouponDraft(null)}
              onSaved={() => {
                setCouponDraft(null)
                reloadAll()
              }}
            />
          </div>
        )}
        <LoadingState loading={coupons.loading} error={coupons.error}>
          <div className={cardClass}>
            {generalCoupons.length === 0 ? (
              <p className="text-sm text-[#A39A8F]">אין קופונים כלליים</p>
            ) : (
              generalCoupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <CouponRow coupon={coupon} onEdit={() => setCouponDraft(coupon)} onToggle={() => toggleCoupon(coupon)} />
                  </div>
                  <button
                    type="button"
                    className="text-xs text-[#8B7340] hover:underline"
                    onClick={() => onShowOrders({ couponId: coupon.id, label: `רכישות עם ${coupon.code}` })}
                  >
                    רכישות
                  </button>
                </div>
              ))
            )}
          </div>
        </LoadingState>
      </section>
    </div>
  )
}

function Mini({ label, value, hint, highlight }: { label: string; value: string; hint?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-sm p-3 ${highlight ? 'bg-[#FBF3E3]' : 'bg-[#F9F7F4]'}`}>
      <p className="text-xs text-[#8B8B8B]">{label}</p>
      <p className="text-lg text-[#3C3834]">{value}</p>
      {hint && <p className="text-[11px] text-[#A39A8F]">{hint}</p>}
    </div>
  )
}

