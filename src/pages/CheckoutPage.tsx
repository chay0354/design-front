import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { OrderRoomRequest } from '../contexts/AuthContext'
import { apiFetch, ApiError } from '../utils/backend'
import { getActiveReferral, getPendingVoucher, peekQuestionnaireSessionId, setPendingVoucher, trackQuestionnaire } from '../utils/tracking'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheck,
  CreditCard,
  Gift,
  House,
  Infinity as InfinityIcon,
  Lock,
  Mail,
  ReceiptText,
  Ticket,
  UserRound,
  X,
} from 'lucide-react'
import { Header } from '../components/Header'
import { PageLoading } from '../components/PageLoading'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { displayColorScaleName } from '../data/colorScales'
import { packagePreviewImage } from '../utils/rooms'
import {
  formatRoomNames,
  parseRoomsParam,
  INSTALLMENT_COUNT,
  ROOM_PACKAGE_PRICE,
  installmentAmount,
  roomDesignProfile,
  roomOrderMeta,
  roomPackagePrice,
  getAgeGroupIdForAge,
  type QuestionnaireChild,
} from '../utils/questionnaire'

const SAGE = '#8A917D'
const CARD = 'rounded-[18px] border border-[#EEE6DC] bg-white'
const INPUT =
  'w-full rounded-[10px] border border-[#E4DBD0] bg-white px-3.5 py-3 text-[15px] text-[#3B342E] placeholder:text-[#B3A99D] focus:border-[#B9AC9C] focus:outline-none'

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function validPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 9 && digits.length <= 12
}

interface CheckoutQuote {
  roomPrice: number
  lines: { index: number; listPrice: number; discountType: string; discountAmount: number; price: number; paidByVoucher: boolean }[]
  subtotal: number
  discountTotal: number
  total: number
  couponApplied: boolean
  couponSavings: number
  voucherPackagesUsed: number
  coupon: { code: string; discountPercent: number } | null
  couponError: { code: string; message: string } | null
  voucher: { code: string; packagesRemaining: number; packagesCount: number } | null
  voucherError: { code: string; message: string } | null
}

type Step = 1 | 2 | 3

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: 'פרטי קשר' },
  { id: 2, label: 'פרטי תשלום' },
  { id: 3, label: 'סיכום הזמנה' },
]

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="mx-auto flex max-w-sm items-start justify-between px-2">
      {STEPS.map((item, index) => {
        const done = item.id < step
        const active = item.id === step
        return (
          <li key={item.id} className="relative flex flex-1 flex-col items-center">
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute top-[15px] right-1/2 h-px w-full"
                style={{ backgroundColor: done ? SAGE : '#DCD3C8' }}
              />
            )}
            <span
              className="relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border text-[14px] font-medium"
              style={
                done || active
                  ? { backgroundColor: SAGE, borderColor: SAGE, color: '#fff' }
                  : { backgroundColor: '#fff', borderColor: '#CFC5B9', color: '#6F665D' }
              }
            >
              {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : item.id}
            </span>
            <span className={`mt-1.5 text-[12px] ${active ? 'text-[#3B342E]' : 'text-[#7C746B]'}`}>{item.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

function SectionHeading({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 text-[20px] font-semibold text-[#2F2A26]">
        <span className="text-[#6F665D]">{icon}</span>
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-[14px] leading-6 text-[#5F574F]">{subtitle}</p>}
    </div>
  )
}

function PrimaryButton({ children, onClick, disabled, type = 'button' }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-[12px] py-3.5 text-[16px] font-medium text-white shadow-[0_2px_8px_rgba(80,85,70,0.18)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      style={{ backgroundColor: SAGE }}
    >
      {children}
    </button>
  )
}

function CardBrands() {
  return (
    <span dir="ltr" className="flex items-center gap-1.5">
      <span className="rounded-[3px] border border-[#E3E3E3] bg-white px-1 text-[10px] font-extrabold italic leading-4 text-[#1A1F71]">VISA</span>
      <span className="relative flex h-4 w-6 items-center" aria-label="Mastercard">
        <span className="absolute left-0 h-4 w-4 rounded-full bg-[#EB001B]" />
        <span className="absolute right-0 h-4 w-4 rounded-full bg-[#F79E1B] opacity-90" />
      </span>
      <CreditCard className="h-4 w-4 text-[#6F8FB7]" />
    </span>
  )
}

function CodeToggle({
  icon,
  label,
  placeholder,
  value,
  onChange,
  applied,
  appliedText,
  error,
  note,
  loading,
  onApply,
  onRemove,
}: {
  icon: ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  applied: boolean
  appliedText: string
  error?: string
  note?: string
  loading: boolean
  onApply: () => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(Boolean(value) || applied)
  return (
    <div className={`${CARD} px-3.5 py-3`}>
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between gap-2 text-[15px] text-[#3B342E]">
        <span className="flex items-center gap-2">
          <span className="text-[#8A7B6B]">{icon}</span>
          {label}
        </span>
        <ChevronDown className={`h-4 w-4 text-[#8A8178] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-3">
          {applied ? (
            <div className="flex items-center gap-2 rounded-[10px] border border-[#E4DBD0] bg-[#FBF8F4] px-3 py-2.5">
              <Check className="h-4 w-4 shrink-0" style={{ color: SAGE }} strokeWidth={2.5} />
              <span dir="ltr" className="flex-1 text-right text-[15px] text-[#3B342E]">
                {appliedText}
              </span>
              <button type="button" onClick={onRemove} aria-label="הסרת הקוד" className="text-[#8B8178] hover:text-[#3B342E]">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    if (value.trim()) onApply()
                  }
                }}
                placeholder={placeholder}
                dir="ltr"
                className={`${INPUT} min-w-0 flex-1 py-2.5 text-left uppercase`}
              />
              <button
                type="button"
                onClick={onApply}
                disabled={!value.trim() || loading}
                className="shrink-0 rounded-[10px] px-4 text-[14px] text-white disabled:opacity-50"
                style={{ backgroundColor: SAGE }}
              >
                {loading ? 'בודקים…' : 'החל'}
              </button>
            </div>
          )}
          {error && <p className="mt-2 text-[13px] text-[#A05A5A]">{error}</p>}
          {note && <p className="mt-2 text-[12px] leading-5 text-[#6F665D]">{note}</p>}
        </div>
      )}
    </div>
  )
}

function SummaryRows({ rows, total, installments }: { rows: { label: string; value: string }[]; total: number; installments: string }) {
  return (
    <div className="space-y-3">
      {rows.length > 1 && (
        <div className="space-y-1.5 px-1 text-[14px] text-[#4A433C]">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span>{row.label}</span>
              <span dir="ltr">{row.value}</span>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-[12px] bg-[#F4EDE4] px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-medium text-[#2F2A26]">סה״כ לתשלום</span>
          <span className="text-[24px] font-semibold text-[#2F2A26]">₪{total}</span>
        </div>
        {installments && <p className="mt-0.5 text-[13px] text-[#6F665D]">{installments}</p>}
      </div>
    </div>
  )
}

export function CheckoutPage() {
  const { packageId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading, submitOrder } = useAuth()
  const { getPackageById, getPackageContent, findMatchingPackages, loading: dataLoading } = useData()

  const rooms = parseRoomsParam(searchParams.get('rooms'))

  const legacyChildren: QuestionnaireChild[] = (() => {
    const raw = searchParams.get('additionalChildren')
    if (!raw) return []
    try {
      return JSON.parse(raw) as QuestionnaireChild[]
    } catch {
      return []
    }
  })()

  const roomProfiles = rooms
    ? rooms.map((room) => {
        const profile = roomDesignProfile(room)
        return {
          name: formatRoomNames(room.children),
          age: profile.age,
          gender: profile.gender,
          theme: room.theme,
          colorPreference: room.colorPreference,
          wallDesignOption: room.wallDesignOption,
        }
      })
    : null

  const primary = roomProfiles?.[0]
  const childName = primary?.name || searchParams.get('childName') || ''
  const childAge = primary?.age ?? parseInt(searchParams.get('childAge') || '0', 10)
  const childGender = primary?.gender || searchParams.get('gender') || ''
  const childTheme = primary?.theme || searchParams.get('theme') || ''
  const childColorPreference = primary?.colorPreference || searchParams.get('colorPreference') || ''

  const additionalChildren: QuestionnaireChild[] = roomProfiles
    ? roomProfiles.slice(1).map((room) => ({
        name: room.name,
        age: room.age,
        gender: room.gender,
        theme: room.theme,
        colorPreference: room.colorPreference,
        wallDesignOption: room.wallDesignOption,
      }))
    : legacyChildren

  const mainPkg = useMemo(() => {
    if (packageId && !rooms) {
      const fromId = getPackageById(packageId)
      if (fromId) return fromId
    }
    if (childGender && childAge && childTheme) {
      return findMatchingPackages(childGender as 'boy' | 'girl' | 'unisex', childAge, childTheme, childColorPreference)[0]
    }
    if (packageId) return getPackageById(packageId)
    return undefined
  }, [packageId, rooms, getPackageById, findMatchingPackages, childGender, childAge, childTheme, childColorPreference])

  const siblingOrders = useMemo(
    () =>
      additionalChildren.map((child, index) => {
        const matched = findMatchingPackages(child.gender, child.age, child.theme, child.colorPreference)[0] || mainPkg
        return {
          child,
          pkg: matched!,
          price: roomPackagePrice(ROOM_PACKAGE_PRICE, index + 1),
        }
      }),
    [additionalChildren, findMatchingPackages, mainPkg],
  )

  const [step, setStep] = useState<Step>(1)
  const [completed, setCompleted] = useState<{ orderNumber: number } | null>(null)
  const [phone, setPhone] = useState('')
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [contactError, setContactError] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [acceptDesignModel, setAcceptDesignModel] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [termsError, setTermsError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [paymentOption, setPaymentOption] = useState<'full' | 'installments'>('installments')
  const [couponInput, setCouponInput] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [voucherInput, setVoucherInput] = useState(() => getPendingVoucher() || '')
  const [voucherCode, setVoucherCode] = useState(() => getPendingVoucher() || '')
  const [quote, setQuote] = useState<CheckoutQuote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const roomCount = 1 + additionalChildren.length
  const roomIdsKey = (rooms ?? []).map((room) => room.roomId ?? '').join(',')

  useEffect(() => {
    trackQuestionnaire('cart')
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step, completed])

  useEffect(() => {
    let cancelled = false
    setQuoteLoading(true)
    apiFetch<CheckoutQuote>('/api/checkout/quote', {
      body: {
        roomCount,
        roomIds: roomIdsKey ? roomIdsKey.split(',') : undefined,
        couponCode: couponCode || undefined,
        voucherCode: voucherCode || undefined,
      },
    })
      .then((result) => {
        if (!cancelled) setQuote(result)
      })
      .catch(() => {
        if (!cancelled) setQuote(null)
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [roomCount, roomIdsKey, couponCode, voucherCode])

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('intended_package', packageId || '')
      sessionStorage.setItem('intended_checkout_query', searchParams.toString())
    }
  }, [user, loading, packageId, searchParams])

  if (loading || dataLoading) return <PageLoading />
  if (!user) return <Navigate to="/login" replace />

  if (completed) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <Header />
        <main className="mx-auto max-w-md px-4 py-12 text-center">
          <CircleCheck className="mx-auto h-16 w-16" style={{ color: '#6F7564' }} strokeWidth={1.3} />
          <h1 className="mt-4 text-[26px] font-semibold text-[#2F2A26]">ההזמנה בוצעה בהצלחה!</h1>
          <p className="mt-2 text-[15px] text-[#5F574F]">מספר הזמנה: #{completed.orderNumber}</p>
          <div className={`${CARD} mt-8 flex items-center gap-3 px-4 py-4 text-right`}>
            <Mail className="h-6 w-6 shrink-0 text-[#6F665D]" strokeWidth={1.4} />
            <p className="min-w-0 flex-1 text-[14px] leading-6 text-[#3B342E]">
              פרטי ההזמנה נשלחו למייל:
              <span dir="ltr" className="block truncate text-[#5F574F]">
                {user.email}
              </span>
            </p>
          </div>
          <div className="mt-8">
            <PrimaryButton onClick={() => navigate('/account')}>
              <House className="h-5 w-5" strokeWidth={1.6} />
              כניסה לאזור האישי
            </PrimaryButton>
          </div>
        </main>
      </div>
    )
  }

  if (!mainPkg) {
    const previewParams = new URLSearchParams()
    if (childName) previewParams.set('childName', childName)
    if (childGender) previewParams.set('gender', childGender)
    if (childAge) previewParams.set('age', childAge.toString())
    if (childTheme) previewParams.set('theme', childTheme)
    if (childColorPreference) previewParams.set('colorPreference', childColorPreference)
    const roomsParam = searchParams.get('rooms')
    if (roomsParam) previewParams.set('rooms', roomsParam)
    const extraChildren = searchParams.get('additionalChildren')
    if (extraChildren) previewParams.set('additionalChildren', extraChildren)
    return <Navigate to={`/preview/recommended?${previewParams.toString()}`} replace />
  }

  const localTotal = ROOM_PACKAGE_PRICE + siblingOrders.reduce((sum, order) => sum + order.price, 0)
  const total = quote ? quote.total : localTotal
  const subtotal = quote ? quote.subtotal : localTotal
  const paidInFull = Boolean(quote && quote.total === 0)
  const monthlyPayment = installmentAmount(total)
  const installmentsText =
    !paidInFull && paymentOption === 'installments' ? `(${INSTALLMENT_COUNT} תשלומים של ₪${monthlyPayment})` : ''

  const couponError = couponCode ? quote?.couponError?.message : undefined
  const voucherError = voucherCode ? quote?.voucherError?.message : undefined

  const discountRows: { label: string; value: string }[] = []
  if (quote) {
    const discountOf = (type: string) =>
      quote.lines.filter((line) => line.discountType === type).reduce((sum, line) => sum + line.discountAmount, 0)
    const siblingDiscount = discountOf('sibling')
    if (siblingDiscount > 0) discountRows.push({ label: 'הנחת חדר נוסף (20%)', value: `−₪${siblingDiscount}` })
    const upgradeDiscount = discountOf('upgrade')
    if (upgradeDiscount > 0) discountRows.push({ label: 'עיצוב מחדש לחדר קיים (20%)', value: `−₪${upgradeDiscount}` })
    if (quote.couponApplied && quote.coupon) {
      discountRows.push({ label: `הנחת קופון (${quote.coupon.discountPercent}%)`, value: `−₪${quote.couponSavings}` })
    }
    const voucherDiscount = quote.lines
      .filter((line) => line.paidByVoucher)
      .reduce((sum, line) => sum + line.discountAmount, 0)
    if (voucherDiscount > 0) discountRows.push({ label: 'שובר מתנה', value: `−₪${voucherDiscount}` })
  }
  const summaryRows = [{ label: roomCount > 1 ? 'מחיר החבילות' : 'מחיר החבילה', value: `₪${subtotal}` }, ...discountRows]

  const orderLines = [
    { name: childName, theme: childTheme, colorPreference: childColorPreference, pkg: mainPkg },
    ...siblingOrders.map((order) => ({ name: order.child.name, theme: order.child.theme, colorPreference: order.child.colorPreference, pkg: order.pkg })),
  ]

  const goToPayment = () => {
    if (!validPhone(phone)) {
      setContactError('יש להזין מספר טלפון תקין')
      return
    }
    setContactError('')
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!acceptDesignModel || !acceptTerms) {
      setTermsError('יש לסמן את שני האישורים כדי להשלים את ההזמנה')
      return
    }
    setTermsError('')
    setProcessing(true)

    try {
      const orderRooms: OrderRoomRequest[] = rooms
        ? rooms.map((room, index) => {
            const pkg = index === 0 ? mainPkg : siblingOrders[index - 1]?.pkg || mainPkg
            return {
              roomId: room.roomId,
              displayName: formatRoomNames(room.children),
              children: room.children.map((child) => ({ name: child.name, age: child.age, gender: child.gender })),
              ...roomOrderMeta(room),
              ageChoice: room.ageChoice,
              packageId: pkg.id,
              packageName: pkg.name,
              packageSnapshot: pkg,
              theme: room.theme,
              colorPreference: room.colorPreference,
              wallDesignOption: room.wallDesignOption,
            }
          })
        : [
            { name: childName, age: childAge, gender: childGender, theme: childTheme, colorPreference: childColorPreference, wallDesignOption: searchParams.get('wallDesignOption') || '', pkg: mainPkg },
            ...siblingOrders.map((order) => ({ ...order.child, pkg: order.pkg })),
          ].map((entry) => ({
            displayName: entry.name,
            children: [{ name: entry.name, age: entry.age, gender: entry.gender }],
            designGender: entry.gender,
            designAge: entry.age,
            ageChoice: null,
            ageGroup: getAgeGroupIdForAge(entry.age),
            ageTrack: 'child' as const,
            packageId: entry.pkg.id,
            packageName: entry.pkg.name,
            packageSnapshot: entry.pkg,
            theme: entry.theme,
            colorPreference: entry.colorPreference,
            wallDesignOption: entry.wallDesignOption,
          }))

      const result = await submitOrder({
        rooms: orderRooms,
        couponCode: quote?.coupon ? couponCode : undefined,
        voucherCode: quote?.voucher ? voucherCode : undefined,
        referral: getActiveReferral(),
        paymentOption,
        sessionId: peekQuestionnaireSessionId(),
        phone: phone.trim(),
        marketingOptIn,
      })
      if (quote?.voucher) setPendingVoucher(null)
      setCompleted({ orderNumber: result.order.orderNumber })
    } catch (err) {
      alert(err instanceof ApiError && err.status === 409 ? err.message : 'התשלום נכשל. נסו שוב.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Header />

      <main className="mx-auto max-w-md px-4 pt-6 pb-12">
        <Stepper step={step} />

        {step === 1 && (
          <section className="mt-7">
            <SectionHeading icon={<UserRound className="h-5 w-5" strokeWidth={1.6} />} title="פרטי קשר" subtitle="נשמח לעדכן אותך לגבי ההזמנה ולשלוח עדכונים חשובים." />
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[14px] font-medium text-[#3B342E]">
                  כתובת אימייל <span className="text-[#B4544F]">*</span>
                </span>
                <input type="email" value={user.email} readOnly dir="ltr" className={`${INPUT} bg-[#FBF8F4] text-left`} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[14px] font-medium text-[#3B342E]">
                  מספר טלפון <span className="text-[#B4544F]">*</span>
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="050-1234567"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  className={`${INPUT} text-left`}
                />
              </label>
              {contactError && <p className="text-[13px] text-[#A05A5A]">{contactError}</p>}
              <label className="flex cursor-pointer items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(event) => setMarketingOptIn(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#8A917D]"
                />
                <span className="text-[14px] leading-6 text-[#4A433C]">אשמח לקבל עדכונים, הטבות והשראה לעיצוב חדרי ילדים.</span>
              </label>
            </div>
            <div className="mt-10">
              <PrimaryButton onClick={goToPayment}>
                המשך לתשלום
                <ArrowLeft className="h-5 w-5" />
              </PrimaryButton>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="mt-7 space-y-4">
            <SectionHeading icon={<CreditCard className="h-5 w-5" strokeWidth={1.6} />} title="פרטי תשלום" subtitle={paidInFull ? undefined : 'בחרו את אופן התשלום'} />

            {!paidInFull && (
              <div className="grid grid-cols-2 gap-3">
                {(['full', 'installments'] as const).map((option) => {
                  const selected = paymentOption === option
                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-start gap-2 rounded-[14px] border px-3 py-3 transition-colors ${
                        selected ? 'border-[#BFB09E] bg-[#F3EDE5]' : 'border-[#E4DBD0] bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentOption"
                        checked={selected}
                        onChange={() => setPaymentOption(option)}
                        className="mt-1 h-4 w-4 shrink-0 accent-[#6F665D]"
                      />
                      <span className="min-w-0">
                        <span className="block text-[13px] text-[#4A433C]">
                          {option === 'full' ? 'תשלום מלא של' : `${INSTALLMENT_COUNT} תשלומים של`}
                        </span>
                        <span className="block text-[20px] font-semibold leading-tight text-[#2F2A26]">
                          {option === 'full' ? `₪${total}` : `₪${monthlyPayment}`}
                          {option === 'installments' && <span className="ms-1 text-[13px] font-normal text-[#5F574F]">לחודש</span>}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            )}

            <CodeToggle
              icon={<Ticket className="h-4 w-4" />}
              label="יש לכם קוד קופון?"
              placeholder="קוד קופון"
              value={couponInput}
              onChange={setCouponInput}
              applied={Boolean(quote?.coupon && couponCode)}
              appliedText={quote?.coupon?.code ?? couponCode}
              error={couponError}
              loading={quoteLoading && couponInput.trim().toUpperCase() === couponCode}
              onApply={() => setCouponCode(couponInput.trim().toUpperCase())}
              onRemove={() => {
                setCouponCode('')
                setCouponInput('')
              }}
              note={
                quote?.coupon && couponCode && !quote.couponApplied
                  ? 'ההנחה הקיימת בהזמנה גבוהה יותר, לכן הקופון לא שינה את המחיר (אין כפל הנחות).'
                  : ''
              }
            />

            <CodeToggle
              icon={<Gift className="h-4 w-4" />}
              label="יש לכם שובר מתנה?"
              placeholder="PD-XXXXXXXX"
              value={voucherInput}
              onChange={setVoucherInput}
              applied={Boolean(quote?.voucher && voucherCode)}
              appliedText={quote?.voucher?.code ?? voucherCode}
              error={voucherError}
              loading={quoteLoading && voucherInput.trim().toUpperCase() === voucherCode}
              onApply={() => setVoucherCode(voucherInput.trim().toUpperCase())}
              onRemove={() => {
                setVoucherCode('')
                setVoucherInput('')
                setPendingVoucher(null)
              }}
              note={
                quote?.voucher && voucherCode
                  ? `השובר מכסה ${quote.voucherPackagesUsed} ${quote.voucherPackagesUsed === 1 ? 'חבילה' : 'חבילות'} בהזמנה הזו (נותרו בו ${quote.voucher.packagesRemaining})`
                  : ''
              }
            />

            {discountRows.length ? (
              <div className={`${CARD} p-4`}>
                <h3 className="mb-3 flex items-center gap-2 text-[16px] font-medium text-[#2F2A26]">
                  <ReceiptText className="h-4 w-4 text-[#6F665D]" />
                  סיכום לתשלום
                </h3>
                <SummaryRows rows={summaryRows} total={total} installments={installmentsText} />
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-[14px] border border-[#E9DFD3] bg-[#F4EDE4] px-4 py-3.5">
                <ReceiptText className="mt-1 h-5 w-5 shrink-0 text-[#6F665D]" strokeWidth={1.5} />
                <div>
                  <p className="text-[15px] text-[#3B342E]">סה״כ לתשלום</p>
                  <p className="text-[26px] font-semibold leading-tight text-[#2F2A26]">₪{total}</p>
                  {installmentsText && <p className="text-[13px] text-[#6F665D]">{installmentsText}</p>}
                </div>
              </div>
            )}

            {!paidInFull && (
              <div className={`${CARD} p-4`}>
                <h3 className="mb-3 flex items-center gap-2 text-[16px] font-medium text-[#2F2A26]">
                  <CreditCard className="h-4 w-4 text-[#6F665D]" />
                  פרטי כרטיס אשראי
                </h3>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      dir="ltr"
                      className={`${INPUT} pe-24 text-left`}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                      <CardBrands />
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cvv}
                      onChange={(event) => setCvv(event.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="CVV"
                      maxLength={4}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      dir="ltr"
                      className={`${INPUT} text-center`}
                    />
                    <input
                      type="text"
                      value={expiry}
                      onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      dir="ltr"
                      className={`${INPUT} text-center`}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <PrimaryButton onClick={() => setStep(3)} disabled={quoteLoading && !quote}>
                המשך לסיכום הזמנה
                <ArrowLeft className="h-5 w-5" />
              </PrimaryButton>
              <button type="button" onClick={() => setStep(1)} className="mx-auto mt-3 flex items-center gap-1 text-[14px] text-[#5F574F] hover:text-[#2F2A26]">
                <ArrowRight className="h-4 w-4" />
                חזרה לפרטי קשר
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="mt-7 space-y-4">
            <SectionHeading icon={<Lock className="h-5 w-5" strokeWidth={1.6} />} title="סיכום הזמנה" />

            <div className={`${CARD} divide-y divide-[#F0E9E0]`}>
              {orderLines.map((line, index) => (
                <div key={`${line.name}-${index}`} className="flex items-center gap-3 p-3">
                  <img src={packagePreviewImage(getPackageContent(line.pkg.id))} alt="" className="h-14 w-14 shrink-0 rounded-[10px] object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-[#2F2A26]">{line.theme ? `חבילת ${line.theme}` : line.pkg.name}</p>
                    <p className="truncate text-[13px] text-[#6F665D]">
                      {[line.name ? `החדר של ${line.name}` : '', displayColorScaleName(line.colorPreference)].filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-[13px] text-[#6F665D]">כמות 1</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`${CARD} p-4`}>
              <h3 className="mb-3 flex items-center gap-2 text-[16px] font-medium text-[#2F2A26]">
                <ReceiptText className="h-4 w-4 text-[#6F665D]" />
                סיכום לתשלום
              </h3>
              <SummaryRows rows={summaryRows} total={total} installments={installmentsText} />
            </div>

            <div className={`${CARD} divide-y divide-[#F0E9E0]`}>
              <p className="flex items-center gap-3 px-4 py-3 text-[14px] leading-6 text-[#3B342E]">
                <Mail className="h-5 w-5 shrink-0 text-[#6F665D]" strokeWidth={1.5} />
                פרטי ההזמנה ישלחו למייל לאחר השלמת הרכישה
              </p>
              <p className="flex items-center gap-3 px-4 py-3 text-[14px] leading-6 text-[#3B342E]">
                <InfinityIcon className="h-5 w-5 shrink-0 text-[#6F665D]" strokeWidth={1.5} />
                החבילה זמינה ללא הגבלת זמן באזור האישי שלכם.
              </p>
            </div>

            <div className="px-1">
              <h3 className="text-[16px] font-medium text-[#2F2A26]">רגע לפני השלמת הרכישה</h3>
              <p className="mt-1 text-[13px] leading-6 text-[#5F574F]">
                למידע נוסף מומלץ לעיין בעמוד{' '}
                <Link to="/faq" className="underline">
                  לפני שרוכשים
                </Link>
                .
              </p>
              <label className="mt-3 flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={acceptDesignModel}
                  onChange={(event) => setAcceptDesignModel(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#8A917D]"
                />
                <span className="text-[13px] leading-6 text-[#4A433C]">
                  החבילה כוללת הדמיות, הנחיות וקישורים לרכישה, ליישום עצמאי ללא ליווי אישי. הפריטים אינם כלולים במחיר,
                  והשירות בנוגע למוצרים ולהזמנות ניתן ישירות על ידי הספקים.
                </span>
              </label>
              <label className="mt-3 flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#8A917D]"
                />
                <span className="text-[13px] leading-6 text-[#4A433C]">
                  החבילה מוגנת בזכויות יוצרים ומיועדת לשימוש אישי בלבד, ללא העברה, הפצה או שימוש מסחרי. אני מסכים/ה ל
                  <Link to="/terms" className="underline">
                    תנאי השימוש
                  </Link>{' '}
                  ול
                  <Link to="/privacy" className="underline">
                    מדיניות הפרטיות
                  </Link>
                  .
                </span>
              </label>
            </div>
            {termsError && <p className="px-1 text-[13px] text-[#A05A5A]">{termsError}</p>}

            <div className="pt-1">
              <PrimaryButton onClick={handleSubmit} disabled={processing}>
                <Lock className="h-4 w-4" />
                {processing ? 'מעבדים את ההזמנה…' : paidInFull ? 'מימוש השובר ואישור ההזמנה' : 'לתשלום ואישור ההזמנה'}
              </PrimaryButton>
              <button type="button" onClick={() => setStep(2)} className="mx-auto mt-3 flex items-center gap-1 text-[14px] text-[#5F574F] hover:text-[#2F2A26]">
                <ArrowRight className="h-4 w-4" />
                חזרה לפרטי תשלום
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
