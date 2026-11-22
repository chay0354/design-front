import { useEffect, useMemo, useState } from 'react'
import type { OrderRoomRequest } from '../contexts/AuthContext'
import { apiFetch, ApiError } from '../utils/backend'
import { getActiveReferral, getPendingVoucher, peekQuestionnaireSessionId, setPendingVoucher, trackQuestionnaire } from '../utils/tracking'

import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Check, CreditCard, Gift, Lock, ShoppingBag, Tag, X } from 'lucide-react'

import { Header } from '../components/Header'

import { PageLoading } from '../components/PageLoading'

import { useAuth } from '../contexts/AuthContext'

import { useData } from '../contexts/DataContext'

import {

  formatRoomNames,

  genderLabel,

  parseRoomsParam,

  INSTALLMENT_COUNT,
  ROOM_PACKAGE_PRICE,
  SHOW_PACKAGE_PRICE,
  installmentAmount,
  roomDesignProfile,
  roomOrderMeta,
  roomPackagePrice,
  getAgeGroupIdForAge,

  type QuestionnaireChild,

  wallDesignLabel,

} from '../utils/questionnaire'

function packageEmoji(theme: string) {

  if (theme.includes('חיות')) return '🦁'

  if (theme.includes('הרפתקאות')) return '⛺'

  if (theme.includes('ים')) return '🚢'

  if (theme.includes('תחבורה')) return '🚗'

  return '✨'

}



function formatCardNumber(value: string) {

  const digits = value.replace(/\s+/g, '').replace(/\D/g, '').slice(0, 16)

  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()

}



function formatExpiry(value: string) {

  const digits = value.replace(/\D/g, '').slice(0, 4)

  if (digits.length <= 2) return digits

  return `${digits.slice(0, 2)}/${digits.slice(2)}`

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

function CodeField({
  icon,
  label,
  placeholder,
  value,
  onChange,
  applied,
  error,
  note,
  loading,
  onApply,
  onRemove,
}: {
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  applied: string
  error?: string
  note?: string
  loading: boolean
  onApply: () => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(Boolean(value))
  if (!open && !applied) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-[#8B7340] hover:underline"
      >
        {icon}
        {label}
      </button>
    )
  }
  return (
    <div className="rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-4">
      <p className="mb-2 flex items-center gap-2 text-sm text-[#4A4A4A]">
        {icon}
        {label}
      </p>
      {applied ? (
        <div className="flex items-center justify-between gap-2 rounded-sm bg-[#F0F8F0] px-3 py-2 text-sm text-[#4F7A3A]">
          <span>{applied}</span>
          <button type="button" onClick={onRemove} aria-label="הסרת הקוד" className="text-[#8B8B8B] hover:text-[#4A4A4A]">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (value.trim()) onApply()
              }
            }}
            placeholder={placeholder}
            dir="ltr"
            className="min-w-0 flex-1 rounded-sm border border-[#E8DED2] bg-white px-3 py-2 text-left uppercase focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none"
          />
          <button
            type="button"
            onClick={onApply}
            disabled={!value.trim() || loading}
            className="rounded-sm bg-[#3F3A36] px-4 py-2 text-sm text-white hover:bg-[#2F2B28] disabled:opacity-50"
          >
            {loading ? 'בודקת...' : 'הפעלת הקוד'}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-[#A05A5A]">{error}</p>}
      {note && <p className="mt-2 text-xs text-[#6B6B6B]">{note}</p>}
    </div>
  )
}

export function CheckoutPage() {

  const { packageId } = useParams()

  const [searchParams] = useSearchParams()

  const navigate = useNavigate()

  const { user, loading, submitOrder } = useAuth()

  const { getPackageById, findMatchingPackages, loading: dataLoading } = useData()

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
      return findMatchingPackages(
        childGender as 'boy' | 'girl' | 'unisex',
        childAge,
        childTheme,
        childColorPreference,
      )[0]
    }

    if (packageId) return getPackageById(packageId)
    return undefined
  }, [
    packageId,
    rooms,
    getPackageById,
    findMatchingPackages,
    childGender,
    childAge,
    childTheme,
    childColorPreference,
  ])

  const siblingOrders = useMemo(
    () =>
      additionalChildren.map((child, index) => {
        const matched =
          findMatchingPackages(
            child.gender,
            child.age,
            child.theme,
            child.colorPreference,
          )[0] || mainPkg
        return {
          child,
          pkg: matched!,
          price: roomPackagePrice(ROOM_PACKAGE_PRICE, index + 1),
        }
      }),
    [additionalChildren, findMatchingPackages, mainPkg],
  )

  const [cardNumber, setCardNumber] = useState('')

  const [expiry, setExpiry] = useState('')

  const [cvv, setCvv] = useState('')

  const [fullName, setFullName] = useState('')

  const [acceptTerms, setAcceptTerms] = useState(false)

  const [acceptPersonalUseOnly, setAcceptPersonalUseOnly] = useState(false)

  const [acceptDesignModel, setAcceptDesignModel] = useState(false)

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

  const couponError = couponCode ? quote?.couponError?.message : undefined
  const voucherError = voucherCode ? quote?.voucherError?.message : undefined



  useEffect(() => {

    if (!loading && !user) {

      sessionStorage.setItem('intended_package', packageId || '')

      sessionStorage.setItem('intended_checkout_query', searchParams.toString())

    }

  }, [user, loading, packageId, searchParams])



  if (loading || dataLoading) {

    return <PageLoading />

  }



  if (!user) {

    return <Navigate to="/login" replace />

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



  const localTotal =
    ROOM_PACKAGE_PRICE + siblingOrders.reduce((sum, order) => sum + order.price, 0)
  const total = quote ? quote.total : localTotal
  const linePrice = (index: number, fallback: number) => quote?.lines[index]?.price ?? fallback
  const lineLabel = (index: number) => {
    const type = quote?.lines[index]?.discountType
    if (type === 'voucher') return 'שובר מתנה'
    if (type === 'coupon') return `קופון ${quote?.coupon?.code ?? ''}`
    if (type === 'sibling') return searchParams.get('rooms') ? 'הנחת חדר נוסף 20%' : 'הנחת אחים 20%'
    if (type === 'upgrade') return 'עיצוב מחדש לחדר קיים 20%'
    return ''
  }

  const monthlyPayment = installmentAmount(total)



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    if (!acceptTerms) {

      alert('יש לאשר את התנאים וההגבלות')

      return

    }

    if (!acceptPersonalUseOnly) {

      alert('יש לאשר שהחבילה לשימוש אישי בלבד')

      return

    }

    if (!acceptDesignModel) {

      alert('יש לאשר שהחבילה כוללת מודל עיצוב')

      return

    }



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

      await submitOrder({
        rooms: orderRooms,
        couponCode: quote?.coupon ? couponCode : undefined,
        voucherCode: quote?.voucher ? voucherCode : undefined,
        referral: getActiveReferral(),
        paymentOption,
        sessionId: peekQuestionnaireSessionId(),
      })
      if (quote?.voucher) setPendingVoucher(null)

      if (siblingOrders.length > 0) {

        navigate('/account')

      } else {

        const params = new URLSearchParams({

          purchased: 'true',

          childName,

          childAge: childAge.toString(),

          gender: childGender,

          theme: childTheme,

          colorPreference: childColorPreference,

        })

        navigate(`/package/${mainPkg.id}?${params.toString()}`)

      }

    } catch (err) {
      alert(err instanceof ApiError && err.status === 409 ? err.message : 'התשלום נכשל. נסי שוב.')
      setProcessing(false)
    }

  }



  return (

    <div className="min-h-screen bg-[#FDFCFB]">

      <Header />



      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="mb-8 text-center">

          <h1 className="mb-2 text-4xl font-light text-[#4A4A4A]">תשלום מאובטח</h1>

          <p className="text-[#6B6B6B]">השלימי את הרכישה כדי לפתוח את חבילות העיצוב</p>

        </div>



        <div className="grid gap-8 lg:grid-cols-3">

          <div className="lg:col-span-2">

            <div className="rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-2">

                <Lock className="h-5 w-5 text-[#C8B6A6]" />

                <span className="text-sm text-[#6B6B6B]">תשלום מאובטח עם הצפנת SSL</span>

              </div>



              <form onSubmit={handleSubmit}>

                <div className="mb-8">

                  <h3 className="mb-4 text-xl font-normal text-[#4A4A4A]">פרטי קשר</h3>

                  <input

                    type="email"

                    value={user.email}

                    disabled

                    className="w-full rounded-sm border border-[#E8DED2] bg-[#F9F7F4] px-4 py-3"

                  />

                </div>



                <div className="mb-8">

                  <h3 className="mb-4 flex items-center gap-2 text-xl font-normal text-[#4A4A4A]">

                    <CreditCard className="h-5 w-5" />

                    פרטי תשלום

                  </h3>

                  <p className="mb-4 text-sm text-[#6B6B6B]">

                    תשלום דמו — ניתן להשלים רכישה גם בלי למלא פרטי כרטיס אשראי.

                  </p>

                  <div className="space-y-4">

                    <input

                      type="text"

                      value={fullName}

                      onChange={(e) => setFullName(e.target.value)}

                      placeholder="שם בעל הכרטיס"

                      className="w-full rounded-sm border border-[#E8DED2] bg-[#F9F7F4] px-4 py-3 focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none"

                    />

                    <input

                      type="text"

                      value={cardNumber}

                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}

                      placeholder="1234 5678 9012 3456"

                      maxLength={19}

                      inputMode="numeric"

                      autoComplete="cc-number"

                      dir="ltr"

                      className="w-full rounded-sm border border-[#E8DED2] bg-[#F9F7F4] px-4 py-3 text-left focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none"

                    />

                    <div className="grid grid-cols-2 gap-4">

                      <input

                        type="text"

                        value={expiry}

                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}

                        placeholder="MM/YY"

                        maxLength={5}

                        inputMode="numeric"

                        autoComplete="cc-exp"

                        dir="ltr"

                        className="w-full rounded-sm border border-[#E8DED2] bg-[#F9F7F4] px-4 py-3 text-left focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none"

                      />

                      <input

                        type="text"

                        value={cvv}

                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}

                        placeholder="CVV"

                        maxLength={3}

                        inputMode="numeric"

                        autoComplete="cc-csc"

                        dir="ltr"

                        className="w-full rounded-sm border border-[#E8DED2] bg-[#F9F7F4] px-4 py-3 text-left focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none"

                      />

                    </div>

                  </div>

                </div>



                <div className="mb-8 space-y-4">
                  <CodeField
                    icon={<Tag className="h-4 w-4" />}
                    label="יש לך קוד קופון?"
                    placeholder="קוד קופון"
                    value={couponInput}
                    onChange={setCouponInput}
                    applied={quote?.coupon && couponCode ? `קוד ${quote.coupon.code} הוחל — ${quote.coupon.discountPercent}% הנחה` : ''}
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
                        : SHOW_PACKAGE_PRICE && quote?.couponApplied
                          ? `חסכת ₪${quote.couponSavings} — מחיר מעודכן ₪${quote.total}`
                          : ''
                    }
                  />
                  <CodeField
                    icon={<Gift className="h-4 w-4" />}
                    label="יש לך שובר מתנה?"
                    placeholder="קוד שובר, למשל PD-XXXXXXXX"
                    value={voucherInput}
                    onChange={setVoucherInput}
                    applied={
                      quote?.voucher && voucherCode
                        ? `השובר מכסה ${quote.voucherPackagesUsed} ${quote.voucherPackagesUsed === 1 ? 'חבילה' : 'חבילות'} בהזמנה הזו (נותרו בו ${quote.voucher.packagesRemaining})`
                        : ''
                    }
                    error={voucherError}
                    loading={quoteLoading && voucherInput.trim().toUpperCase() === voucherCode}
                    onApply={() => setVoucherCode(voucherInput.trim().toUpperCase())}
                    onRemove={() => {
                      setVoucherCode('')
                      setVoucherInput('')
                      setPendingVoucher(null)
                    }}
                    note={quote?.voucher && voucherCode && quote.total === 0 ? 'ההזמנה משולמת במלואה בשובר — ללא חיוב נוסף.' : ''}
                  />
                </div>

                <div className="mb-6 space-y-4">

                  {[

                    {

                      checked: acceptDesignModel,

                      onChange: setAcceptDesignModel,

                      text: (

                        <>

                          <strong>אני מאשר/ת את מודל העיצוב של PETITE DREAMS:</strong> החבילה

                          מעניקה את הנוסחה המקצועית לביצוע עצמאי — הדמיות, פלטות צבעים והנחיות

                          מיקום. הרכישה מתבצעת מול ספקים חיצוניים ובאחריותי.

                        </>

                      ),

                    },

                    {

                      checked: acceptPersonalUseOnly,

                      onChange: setAcceptPersonalUseOnly,

                      text: 'ידוע לי שחבילה זו לשימוש אישי בלבד ואינה ניתנת להעברה או שימוש מסחרי.',

                    },

                    {

                      checked: acceptTerms,

                      onChange: setAcceptTerms,

                      text: (

                        <>

                          אני מסכים/ה ל{' '}

                          <Link to="/terms" className="text-[#C8B6A6] hover:underline">

                            תנאי השימוש

                          </Link>{' '}

                          ול{' '}

                          <Link to="/privacy" className="text-[#C8B6A6] hover:underline">

                            מדיניות הפרטיות

                          </Link>

                        </>

                      ),

                    },

                  ].map((item, index) => (

                    <div

                      key={index}

                      className="rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-5"

                    >

                      <label className="flex cursor-pointer items-start gap-3">

                        <input

                          type="checkbox"

                          checked={item.checked}

                          onChange={(e) => item.onChange(e.target.checked)}

                          className="mt-1 h-4 w-4 flex-shrink-0 accent-[#C8B6A6]"

                          required

                        />

                        <span className="text-sm leading-relaxed text-[#4A4A4A]">{item.text}</span>

                      </label>

                    </div>

                  ))}

                </div>



                <button

                  type="submit"

                  disabled={processing}

                  className={`w-full rounded-sm py-4 text-lg font-normal transition-all ${

                    processing

                      ? 'cursor-not-allowed bg-[#E8DED2] text-[#C5C5C5]'

                      : 'bg-[#C8B6A6] text-white shadow-sm hover:bg-[#B5A99A]'

                  }`}

                >

                  {processing

                    ? 'מעבד תשלום...'

                    : quote && quote.total === 0
                      ? 'מימוש השובר והשלמת ההזמנה'
                    : !SHOW_PACKAGE_PRICE
                      ? 'השלימי רכישה'

                    : paymentOption === 'installments'

                      ? `שלמי ₪${monthlyPayment} × ${INSTALLMENT_COUNT} תשלומים`

                      : `שלמי ₪${total} עכשיו`}

                </button>

              </form>

            </div>

          </div>



          <div>

            <div className="sticky top-6 rounded-sm border border-[#E8DED2] bg-white p-6 shadow-sm">

              <h3 className="mb-4 text-xl font-normal text-[#4A4A4A]">סיכום הזמנה</h3>



              <div className="mb-4 space-y-4">

                <div className="rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-4">

                  <div className="mb-2 flex items-center gap-2">

                    <span className="text-2xl">{packageEmoji(childTheme)}</span>

                    <div>

                      <p className="font-normal text-[#4A4A4A]">{childName}</p>

                      <p className="text-xs text-[#6B6B6B]">

                        {genderLabel(childGender)} • גיל {childAge} • {childTheme}

                      </p>

                    </div>

                  </div>

                  <p className="text-xs text-[#8B8B8B]">{mainPkg.name}</p>

                  {SHOW_PACKAGE_PRICE && (
                    <div className="mt-2 flex justify-between">

                      <span className="text-sm text-[#6B6B6B]">{lineLabel(0) || 'חבילה ראשית'}</span>

                      <span className="font-normal text-[#4A4A4A]">₪{linePrice(0, ROOM_PACKAGE_PRICE)}</span>

                    </div>
                  )}

                </div>



                {siblingOrders.map((order, index) => (

                  <div

                    key={index}

                    className="rounded-sm border border-[#D4E7D4] bg-[#F0F8F0] p-4"

                  >

                    <div className="mb-2 flex items-center gap-2">

                      <span className="text-2xl">{packageEmoji(order.child.theme)}</span>

                      <div>

                        <p className="font-normal text-[#4A4A4A]">{order.child.name}</p>

                        <p className="text-xs text-[#6B6B6B]">

                          {genderLabel(order.child.gender)} • גיל {order.child.age} •{' '}

                          {order.child.theme}

                        </p>

                      </div>

                    </div>

                    <p className="text-xs text-[#8B8B8B]">{order.pkg?.name}</p>

                    <p className="mt-1 text-xs text-[#6B6B6B]">

                      קיר: {wallDesignLabel(order.child.wallDesignOption)}

                    </p>

                    {SHOW_PACKAGE_PRICE && (
                      <div className="mt-2 flex justify-between text-sm">

                        <span className="text-[#7BA05B]">{lineLabel(index + 1)}</span>

                        <span className="font-normal text-[#4A4A4A]">₪{linePrice(index + 1, order.price)}</span>

                      </div>
                    )}

                  </div>

                ))}

              </div>



              {SHOW_PACKAGE_PRICE && (
                <div className="mb-4 flex justify-between border-t border-[#E8DED2] pt-4">

                  <span className="text-lg font-normal text-[#4A4A4A]">סה״כ</span>

                  <span className="text-2xl font-normal text-[#4A4A4A]">₪{total}</span>

                </div>
              )}



              {SHOW_PACKAGE_PRICE && (
              <div className="mb-4 space-y-2">

                {(['installments', 'full'] as const).map((option) => (

                  <label key={option} className="block cursor-pointer">

                    <input

                      type="radio"

                      name="paymentOption"

                      value={option}

                      checked={paymentOption === option}

                      onChange={() => setPaymentOption(option)}

                      className="sr-only"

                    />

                    <div

                      className={`rounded-sm border-2 p-3 transition-all ${

                        paymentOption === option

                          ? 'border-[#C8B6A6] bg-[#F9F7F4]'

                          : 'border-[#E8DED2] hover:border-[#D4C4B0]'

                      }`}

                    >

                      {option === 'installments' ? (

                        <div>

                          <div className="text-sm text-[#6B6B6B]">{INSTALLMENT_COUNT} תשלומים</div>

                          <div className="text-3xl font-normal leading-tight text-[#4A4A4A]">

                            ₪{monthlyPayment}

                            <span className="ms-1 text-base text-[#6B6B6B]">לחודש</span>

                          </div>

                          {paymentOption === 'installments' && (

                            <p className="mt-2 text-sm leading-6 text-[#4A4A4A]">

                              תזכורת: {INSTALLMENT_COUNT} תשלומים של ₪{monthlyPayment} בכל חודש, סה״כ ₪{total}.

                            </p>

                          )}

                        </div>

                      ) : (

                        <div className="flex items-baseline justify-between">

                          <span className="text-sm text-[#6B6B6B]">תשלום אחד</span>

                          <span className="text-base text-[#4A4A4A]">₪{total}</span>

                        </div>

                      )}

                    </div>

                  </label>

                ))}

              </div>
              )}



              <div className="space-y-2 text-xs text-[#6B6B6B]">

                <div className="flex items-center gap-2">

                  <ShoppingBag className="h-4 w-4" />

                  <span>משלוח דיגיטלי מיידי</span>

                </div>

                <div className="flex items-center gap-2">

                  <Lock className="h-4 w-4" />

                  <span>גישה לכל החיים בחשבון שלך</span>

                </div>

                <div className="flex items-center gap-2">

                  <Check className="h-4 w-4" />

                  <span>כל קישורי הקניות כלולים</span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}

