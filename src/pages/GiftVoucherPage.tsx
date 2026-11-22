import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Copy, Mail, MessageCircle, Minus, Plus, Send } from 'lucide-react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { BrushTitle } from '../components/BrushTitle'
import {
  DEFAULT_GIFT_BLESSING,
  VoucherCard,
  packagesPhrase,
  receivedPackagesLine,
} from '../components/VoucherCard'
import { useAuth } from '../contexts/AuthContext'
import { apiFetch, ApiError } from '../utils/backend'
import { SHOW_PACKAGE_PRICE } from '../utils/questionnaire'

const DRAFT_KEY = 'pd_gift_draft'

type Delivery = 'email' | 'whatsapp' | 'self'

interface GiftDraft {
  packagesCount: number
  recipientNames: string
  recipientEmail: string
  recipientPhone: string
  giverName: string
  personalMessage: string
  deliveryMethod: Delivery
}

export interface PurchasedVoucher {
  id: string
  code: string
  packagesCount: number
  recipientNames: string
  recipientEmail: string
  recipientPhone: string
  giverName: string
  personalMessage: string
  deliveryMethod: Delivery
  status: string
  redeemUrl: string
  shareUrl: string
  whatsappText: string
}

const emptyDraft: GiftDraft = {
  packagesCount: 1,
  recipientNames: '',
  recipientEmail: '',
  recipientPhone: '',
  giverName: '',
  personalMessage: DEFAULT_GIFT_BLESSING,
  deliveryMethod: 'email',
}

function loadDraft(): GiftDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return emptyDraft
    const parsed = JSON.parse(raw) as Partial<GiftDraft>
    return {
      ...emptyDraft,
      ...parsed,
      personalMessage: parsed.personalMessage?.trim() ? parsed.personalMessage : DEFAULT_GIFT_BLESSING,
    }
  } catch {
    return emptyDraft
  }
}

function saveDraft(draft: GiftDraft | null) {
  try {
    if (draft) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    else sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // ignore
  }
}

const inputClass =
  'w-full rounded-xl border border-[#E7E1D8] bg-white px-4 py-3 text-[#3C3834] focus:ring-2 focus:ring-[#D9CBB8] focus:outline-none'

function whatsappHref(voucher: PurchasedVoucher) {
  const phone = voucher.recipientPhone.replace(/\D/g, '').replace(/^0/, '972')
  const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(voucher.whatsappText)}`
}

export function VoucherShareActions({ voucher }: { voucher: PurchasedVoucher }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(voucher.shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('העתיקו את הקישור:', voucher.shareUrl)
    }
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      <a
        href={whatsappHref(voucher)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-white hover:bg-[#1EBE5A]"
      >
        <MessageCircle className="h-4 w-4" />
        שיתוף בוואטסאפ
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E2D8CC] bg-white px-6 py-3 text-[#3C3834] hover:bg-[#F8F4EF]"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'הקישור הועתק' : 'העתקת הקישור'}
      </button>
    </div>
  )
}

type DeliveryStatus = {
  emailed?: boolean
  recipientEmailed?: boolean
  buyerEmailed?: boolean
  emailConfigured?: boolean
  error?: string
}

export function VoucherConfirmation({
  voucher,
  orderNumber,
  delivery,
}: {
  voucher: PurchasedVoucher
  orderNumber?: number
  delivery?: DeliveryStatus | null
}) {
  const [resending, setResending] = useState(false)
  const [resendNote, setResendNote] = useState('')
  const emailFailed = delivery && delivery.emailed === false

  const statusText = (() => {
    if (emailFailed) {
      if (voucher.deliveryMethod === 'whatsapp') {
        return 'השובר מוכן לשיתוף בוואטסאפ. שליחת המייל לא הצליחה כרגע — אפשר לנסות שוב למטה.'
      }
      if (voucher.deliveryMethod === 'email') {
        return `השובר נוצר, אבל המייל אל ${voucher.recipientEmail || 'מקבל המתנה'} עדיין לא נשלח. אפשר לשתף בוואטסאפ בינתיים או לנסות שליחה מחדש.`
      }
      return 'השובר נוצר, אבל שליחת המייל לא הצליחה כרגע. אפשר לנסות שוב למטה.'
    }
    if (voucher.deliveryMethod === 'email') {
      return `שלחנו את השובר במייל אל ${voucher.recipientEmail}, ואישור רכישה אלייך.`
    }
    if (voucher.deliveryMethod === 'whatsapp') {
      return delivery?.buyerEmailed
        ? 'עכשיו נשאר רק לשתף את השובר בוואטסאפ. שלחנו לך גם אישור רכישה במייל.'
        : 'עכשיו נשאר רק לשתף את השובר בוואטסאפ.'
    }
    return delivery?.buyerEmailed || delivery?.recipientEmailed
      ? 'שלחנו את השובר אלייך במייל — אפשר להעביר אותו בכל דרך.'
      : 'השובר מוכן — אפשר להעביר אותו בכל דרך, או לשלוח שוב במייל למטה.'
  })()

  const resendEmail = async () => {
    setResending(true)
    setResendNote('')
    try {
      await apiFetch(`/api/vouchers/purchased/${voucher.id}/resend-email`, { method: 'POST', body: {} })
      setResendNote('המייל נשלח מחדש. בדקי גם בספאם.')
    } catch (err) {
      setResendNote(err instanceof ApiError ? err.message : 'שליחה מחדש נכשלה.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <BrushTitle as="h1">השובר מוכן!</BrushTitle>
      <p className="mt-4 text-sm leading-6 text-[#6F6A64]">
        {statusText}
        {orderNumber ? ` מספר הזמנה: ${orderNumber}.` : ''}
      </p>
      <div className="mt-6">
        <VoucherCard {...voucher} />
      </div>
      <div className="mt-6">
        <VoucherShareActions voucher={voucher} />
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={resendEmail}
          disabled={resending}
          className="text-sm text-[#A88A72] underline hover:text-[#8A6A52] disabled:opacity-60"
        >
          {resending ? 'שולח מייל...' : 'שליחת השובר במייל מחדש'}
        </button>
        {resendNote ? <p className="mt-2 text-xs text-[#6F6A64]">{resendNote}</p> : null}
      </div>
      <p className="mt-6 text-xs text-[#8A847C]">
        החשבונית תונפק על שמך. אפשר לחזור לשובר בכל עת מהקישור:{' '}
        <Link to={`/gift/voucher/${voucher.id}`} className="underline">
          השובר שלי
        </Link>
      </p>
    </div>
  )
}

export function GiftVoucherPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [draft, setDraft] = useState<GiftDraft>(loadDraft)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [maxPackages, setMaxPackages] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{
    voucher: PurchasedVoucher
    orderNumber: number
    delivery?: DeliveryStatus
  } | null>(null)
  const [step, setStep] = useState<'form' | 'summary'>('form')
  const [acceptTerms, setAcceptTerms] = useState(false)

  useEffect(() => {
    document.title = 'שובר מתנה | PETITE DREAMS'
    apiFetch<{ maxPackages: number; prices: Record<string, number> }>('/api/vouchers/prices', { auth: false })
      .then((data) => {
        setPrices(data.prices)
        setMaxPackages(data.maxPackages)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    saveDraft(draft)
  }, [draft])

  const update = (partial: Partial<GiftDraft>) => setDraft((current) => ({ ...current, ...partial }))
  const price = prices[String(draft.packagesCount)]

  const validation = useMemo(() => {
    if (!draft.recipientNames.trim()) return 'יש למלא את שמות מקבלי המתנה'
    if (!draft.giverName.trim()) return 'יש למלא את שם מעניק המתנה'
    if (draft.deliveryMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.recipientEmail.trim())) {
      return 'יש למלא כתובת מייל תקינה של מקבל המתנה'
    }
    return ''
  }, [draft])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (validation) {
      setError(validation)
      return
    }
    if (!user) {
      sessionStorage.setItem('intended_path', '/gift')
      navigate('/login')
      return
    }
    setError('')
    setStep('summary')
    window.scrollTo(0, 0)
  }

  const handlePay = async () => {
    if (!acceptTerms) {
      setError('יש לאשר את תנאי השימוש')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const data = await apiFetch<{
        voucher: PurchasedVoucher
        orderNumber: number
        delivery?: DeliveryStatus
      }>('/api/vouchers', {
        body: draft,
      })
      saveDraft(null)
      setResult(data)
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'התשלום נכשל. נסי שוב.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#F7F4EF]">
        <Header />
        <VoucherConfirmation
          voucher={result.voucher}
          orderNumber={result.orderNumber}
          delivery={result.delivery}
        />
        <Footer />
      </div>
    )
  }

  const deliveryLabel: Record<Delivery, string> = {
    email: `במייל אל ${draft.recipientEmail}`,
    whatsapp: 'שיתוף בוואטסאפ על ידך',
    self: 'למייל שלך, להעברה עצמית',
  }

  if (step === 'summary') {
    return (
      <div className="min-h-screen bg-[#F7F4EF]">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <BrushTitle as="h1">סיכום הזמנה</BrushTitle>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <div className="rounded-2xl border border-[#E7E1D8] bg-[#FBF8F3] p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg text-[#3C3834]">שובר מתנה</h2>
                  {SHOW_PACKAGE_PRICE && price ? <span className="text-xl text-[#3C3834]">₪{price}</span> : null}
                </div>
                <p className="mt-1 text-[#5E5852]">
                  {receivedPackagesLine(draft.recipientNames, draft.packagesCount)}
                </p>
                <dl className="mt-4 space-y-1 text-sm text-[#6F6A64]">
                  <div className="flex gap-2">
                    <dt className="text-[#8A847C]">למי:</dt>
                    <dd>{draft.recipientNames}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[#8A847C]">ממי:</dt>
                    <dd>{draft.giverName}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[#8A847C]">מסירה:</dt>
                    <dd>{deliveryLabel[draft.deliveryMethod]}</dd>
                  </div>
                </dl>
                {SHOW_PACKAGE_PRICE && price ? (
                  <div className="mt-4 flex justify-between border-t border-[#E7E1D8] pt-3 text-[#3C3834]">
                    <span>סה״כ לתשלום</span>
                    <span>₪{price}</span>
                  </div>
                ) : null}
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#E7E1D8] p-4 text-sm text-[#4A4A4A]">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#C8B6A6]"
                />
                <span>
                  אני מסכים/ה ל
                  <Link to="/terms" className="text-[#A88A72] underline">
                    תנאי השימוש
                  </Link>{' '}
                  ול
                  <Link to="/privacy" className="text-[#A88A72] underline">
                    מדיניות הפרטיות
                  </Link>
                  . השובר נוצר ונשלח רק אחרי אישור התשלום, והחשבונית תונפק על שמי.
                </span>
              </label>

              {error && <p className="text-sm text-[#A05A5A]">{error}</p>}

              <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-between">
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={submitting}
                  className="rounded-full bg-[#C4B49A] px-8 py-3.5 text-white hover:bg-[#B3A288] disabled:opacity-60"
                >
                  {submitting ? 'מעבד תשלום...' : 'לתשלום'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form')
                    setError('')
                  }}
                  className="text-sm text-[#8A847C] hover:underline"
                >
                  חזרה לעריכת השובר
                </button>
              </div>
            </section>
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <p className="mb-3 text-center text-sm text-[#8A847C]">כך ייראה השובר</p>
              <VoucherCard {...draft} />
            </aside>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const deliveryOptions: { value: Delivery; label: string; icon: typeof Mail }[] = [
    { value: 'email', label: 'שליחה במייל למקבל המתנה', icon: Mail },
    { value: 'whatsapp', label: 'אשתף בעצמי בוואטסאפ', icon: MessageCircle },
    { value: 'self', label: 'שלחו אליי ואעביר בעצמי', icon: Send },
  ]

  return (
    <div className="min-h-screen bg-[#F7F4EF]">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <BrushTitle as="h1">שובר מתנה</BrushTitle>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-6 text-[#6F6A64]">
          יש מתנות שנשארות הרבה מעבר לרגע שבו מקבלים אותן. העניקו מתנה עיצוב לחדר הילדים, מקום לגדול בו,
          לחלום בו וליצור זיכרונות יפים.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E7E1D8] bg-[#FBF9F6] px-3 py-3">
                <p className="min-w-0 flex-1 text-sm leading-5 text-[#4A4540]">
                  כמה חבילות עיצוב תרצו להעניק במתנה?
                </p>
                <div className="flex shrink-0 items-center gap-2" dir="ltr">
                  <button
                    type="button"
                    aria-label="פחות חבילות"
                    onClick={() => update({ packagesCount: Math.max(1, draft.packagesCount - 1) })}
                    disabled={draft.packagesCount <= 1}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                      draft.packagesCount <= 1
                        ? 'cursor-not-allowed border-[#E8DED2] text-[#C5C5C5]'
                        : 'border-[#D5CBBF] text-[#6F6A64] hover:bg-white'
                    }`}
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <span className="min-w-6 text-center text-lg font-medium text-[#3C3834]">
                    {draft.packagesCount}
                  </span>
                  <button
                    type="button"
                    aria-label="יותר חבילות"
                    onClick={() => update({ packagesCount: Math.min(maxPackages, draft.packagesCount + 1) })}
                    disabled={draft.packagesCount >= maxPackages}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                      draft.packagesCount >= maxPackages
                        ? 'cursor-not-allowed border-[#E8DED2] text-[#C5C5C5]'
                        : 'border-[#D5CBBF] text-[#6F6A64] hover:bg-white'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
              {SHOW_PACKAGE_PRICE && price ? (
                <p className="text-center text-sm text-[#8A847C]">
                  {packagesPhrase(draft.packagesCount)} · ₪{price}
                </p>
              ) : null}
              <div className="flex items-center gap-3 rounded-2xl bg-[#FBF6EE] px-4 py-2.5 text-sm text-[#6F6254]">
                <img src="/assets/gift-icon.png" alt="" className="h-10 w-10 object-contain" />
                <p>
                  <span className="font-medium">מוסיפים חדר נוסף</span>
                  <br />
                  ונהנים מ־20% הנחה
                  <br />
                  על חבילת העיצוב הנוספת!
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg text-[#3C3834]">למי המתנה?</h2>
              <input
                className={inputClass}
                placeholder="שם מקבל המתנה או שמות המקבלים למשל: ליאב, ניר ואלון"
                value={draft.recipientNames}
                onChange={(e) => update({ recipientNames: e.target.value })}
                maxLength={200}
              />
              <input
                className={inputClass}
                type="email"
                dir="ltr"
                placeholder={draft.deliveryMethod === 'email' ? 'מייל מקבל המתנה' : 'מייל מקבל המתנה (לא חובה)'}
                value={draft.recipientEmail}
                onChange={(e) => update({ recipientEmail: e.target.value })}
              />
              {draft.deliveryMethod === 'whatsapp' && (
                <input
                  className={inputClass}
                  type="tel"
                  dir="ltr"
                  placeholder="טלפון מקבל המתנה לוואטסאפ (לא חובה)"
                  value={draft.recipientPhone}
                  onChange={(e) => update({ recipientPhone: e.target.value })}
                />
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-lg text-[#3C3834]">ממי?</h2>
              <input
                className={inputClass}
                placeholder="שם מעניק המתנה, למשל: סבא וסבתא"
                value={draft.giverName}
                onChange={(e) => update({ giverName: e.target.value })}
                maxLength={120}
              />
              <div>
                <label className="mb-1.5 block text-sm text-[#6F6A64]">ברכה אישית</label>
                <textarea
                  className={`${inputClass} min-h-28`}
                  value={draft.personalMessage}
                  onChange={(e) => update({ personalMessage: e.target.value })}
                  maxLength={600}
                />
                <p className="mt-1.5 text-xs text-[#8A847C]">אפשר לערוך את הברכה או להשאיר כמו שהיא.</p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-lg text-[#3C3834]">איך למסור את המתנה?</h2>
              <div className="space-y-2">
                {deliveryOptions.map((option) => {
                  const Icon = option.icon
                  const selected = draft.deliveryMethod === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update({ deliveryMethod: option.value })}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-right ${
                        selected ? 'border-[#E7D9C8] bg-[#F8F3EC]' : 'border-[#E7E1D8] bg-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 text-[#C4B39A]" strokeWidth={1.5} />
                      <span className="flex-1 text-[#3C3834]">{option.label}</span>
                      <span
                        className={`h-5 w-5 rounded-full border ${selected ? 'border-[#C4A574] bg-[#C4A574]' : 'border-[#D5CBBF]'}`}
                      />
                    </button>
                  )
                })}
              </div>
            </section>

            {error && <p className="text-sm text-[#A05A5A]">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-full bg-[#C4B49A] py-3.5 text-white hover:bg-[#B3A288] disabled:opacity-60"
            >
              {user ? 'המשך לתשלום' : 'התחברות והמשך לתשלום'}
            </button>
            <p className="text-center text-xs text-[#8A847C]">
              התשלום מתבצע במערכת התשלום של האתר. השובר נוצר ונשלח רק אחרי אישור התשלום, והחשבונית תונפק על
              שמך.
            </p>
          </form>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <p className="mb-3 text-center text-sm text-[#8A847C]">תצוגה מקדימה</p>
            <VoucherCard {...draft} />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
