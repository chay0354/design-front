import { useEffect, useMemo, useState } from 'react'

import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Check, CreditCard, Lock, ShoppingBag } from 'lucide-react'

import { Header } from '../components/Header'

import { PageLoading } from '../components/PageLoading'

import { useAuth } from '../contexts/AuthContext'

import { useData } from '../contexts/DataContext'

import {

  genderLabel,

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



export function CheckoutPage() {

  const { packageId } = useParams()

  const [searchParams] = useSearchParams()

  const navigate = useNavigate()

  const { user, loading, completePurchase } = useAuth()

  const { getPackageById, findMatchingPackages, loading: dataLoading } = useData()

  const childName = searchParams.get('childName') || ''

  const childAge = parseInt(searchParams.get('childAge') || '0', 10)

  const childGender = searchParams.get('gender') || ''

  const childTheme = searchParams.get('theme') || ''

  const childColorPreference = searchParams.get('colorPreference') || ''

  const additionalChildrenParam = searchParams.get('additionalChildren')

  const additionalChildren: QuestionnaireChild[] = additionalChildrenParam

    ? (JSON.parse(additionalChildrenParam) as QuestionnaireChild[])

    : []



  const mainPkg = useMemo(() => {
    if (packageId) {
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

    return undefined
  }, [
    packageId,
    getPackageById,
    findMatchingPackages,
    childGender,
    childAge,
    childTheme,
    childColorPreference,
  ])



  const siblingOrders = useMemo(

    () =>

      additionalChildren.map((child) => {

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

          price: matched ? Math.round(matched.price * 0.8) : 0,

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

  const [paymentOption, setPaymentOption] = useState<'full' | 'installments'>('full')



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

    if (additionalChildrenParam) previewParams.set('additionalChildren', additionalChildrenParam)

    return <Navigate to={`/preview/recommended?${previewParams.toString()}`} replace />

  }



  const total =

    mainPkg.price + siblingOrders.reduce((sum, order) => sum + order.price, 0)



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
      const orders = [
        {
          packageId: mainPkg.id,
          childName,
          childAge,
          gender: childGender,
          theme: childTheme,
          colorPreference: childColorPreference,
        },
        ...siblingOrders
          .filter((order) => order.pkg)
          .map((order) => ({
            packageId: order.pkg.id,
            childName: order.child.name,
            childAge: order.child.age,
            gender: order.child.gender,
            theme: order.child.theme,
            colorPreference: order.child.colorPreference,
          })),
      ]

      await completePurchase(orders)

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

    } catch {

      alert('התשלום נכשל. נסי שוב.')

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

                    : paymentOption === 'installments'

                      ? `שלמי ₪${Math.ceil(total / 6)} × 6 תשלומים`

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

                  <div className="mt-2 flex justify-between">

                    <span className="text-sm text-[#6B6B6B]">חבילה ראשית</span>

                    <span className="font-normal text-[#4A4A4A]">₪{mainPkg.price}</span>

                  </div>

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

                    <div className="mt-2 flex justify-between text-sm">

                      <span className="text-[#7BA05B]">הנחת אחים 20%</span>

                      <span className="font-normal text-[#4A4A4A]">₪{order.price}</span>

                    </div>

                  </div>

                ))}

              </div>



              <div className="mb-4 flex justify-between border-t border-[#E8DED2] pt-4">

                <span className="text-lg font-normal text-[#4A4A4A]">סה״כ</span>

                <span className="text-2xl font-normal text-[#4A4A4A]">₪{total}</span>

              </div>



              <div className="mb-4 space-y-2">

                {(['full', 'installments'] as const).map((option) => (

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

                      <div className="font-normal text-[#4A4A4A]">

                        {option === 'full' ? 'תשלום מלא' : '6 תשלומים'}

                      </div>

                    </div>

                  </label>

                ))}

              </div>



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

