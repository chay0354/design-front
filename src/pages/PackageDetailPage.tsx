import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Gift,
  Palette,
  ShoppingBag,
  Sparkles,
  Upload,
} from 'lucide-react'
import { Sparkle } from '../components/BrushTitle'
import { Header } from '../components/Header'
import { PageLoading } from '../components/PageLoading'
import { ProductImage } from '../components/ProductImage'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { getChildrenForPackage, hasPurchased } from '../utils/auth'

const GENDER_LABELS: Record<string, string> = { boy: 'בנים', girl: 'בנות', unisex: 'יוניסקס' }

function HeartBowIcon() {
  return (
    <svg viewBox="0 0 64 56" className="mx-auto mb-3 h-16 w-16 text-[#A27A5C]" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M32 52S5 36 5 18C5 10 11 4 18.5 4 24.5 4 29 8 32 13c3-5 7.5-9 13.5-9C53 4 59 10 59 18c0 18-27 34-27 34z" />
      <path d="M6 24h52M6 28h52" />
      <path d="M32 26c-4-6-11-8-12-4s7 5 12 4zm0 0c4-6 11-8 12-4s-7 5-12 4zm0 0l-6 10m6-10l6 10" />
    </svg>
  )
}

function usePurchasedItems(storageKey: string) {
  const [checked, setChecked] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]') as string[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked))
  }, [checked, storageKey])

  const toggle = (name: string) =>
    setChecked((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    )

  return { checked, toggle }
}

export function PackageDetailPage() {
  const { packageId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const {
    getPackageById,
    getPackageContent,
    getColorScaleForPreference,
    loading: dataLoading,
  } = useData()
  const [beforeImage, setBeforeImage] = useState<File | null>(null)
  const [afterImage, setAfterImage] = useState<File | null>(null)
  const [allowSocialShare, setAllowSocialShare] = useState(true)
  const [photosUploaded, setPhotosUploaded] = useState(false)
  const [selectedChildIndex, setSelectedChildIndex] = useState(0)

  const pkg = packageId ? getPackageById(packageId) : undefined
  const isPurchased = pkg ? hasPurchased(user, pkg.id) : false
  const justPurchased = searchParams.get('purchased') === 'true'
  const childName = searchParams.get('childName') || ''
  const childColorPreference = searchParams.get('colorPreference') || ''
  const allUserChildren = user?.children || []
  const allChildren = pkg ? getChildrenForPackage(user, pkg.id) : []
  const selectedChild = allChildren[selectedChildIndex]
  const displayName = selectedChild?.name || childName
  const displayColors = selectedChild?.colorPreference || childColorPreference
  const content = pkg ? getPackageContent(pkg.id) : null
  const colorScale = getColorScaleForPreference(displayColors)
  const { checked, toggle } = usePurchasedItems(
    `petite-purchased-items:${user?.id ?? ''}:${packageId ?? ''}:${displayName}`,
  )

  useEffect(() => {
    setSelectedChildIndex(0)
  }, [packageId])

  if (loading || dataLoading) {
    return <PageLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!pkg) {
    return <Navigate to="/account" replace />
  }

  if (!isPurchased && !justPurchased) {
    return <Navigate to="/account" replace />
  }

  if (!content) {
    return <PageLoading />
  }

  const goToSibling = (direction: -1 | 1) => {
    const currentChildIndex = allUserChildren.findIndex(
      (c) => c.packageId === packageId && c.name === selectedChild?.name,
    )
    const nextIndex =
      direction === -1
        ? currentChildIndex > 0
          ? currentChildIndex - 1
          : allUserChildren.length - 1
        : currentChildIndex < allUserChildren.length - 1
          ? currentChildIndex + 1
          : 0
    const nextChild = allUserChildren[nextIndex]
    if (!nextChild) return
    if (nextChild.packageId !== packageId) {
      navigate(`/package/${nextChild.packageId}`)
      return
    }
    const newIndex = allChildren.findIndex((c) => c.name === nextChild.name)
    setSelectedChildIndex(newIndex)
  }

  const hasSiblings = allUserChildren.length > 1
  const titleParts = [
    selectedChild?.theme ? `חבילת ${selectedChild.theme}` : pkg.name,
    selectedChild?.gender ? GENDER_LABELS[selectedChild.gender] : '',
    displayColors ? colorScale.name : '',
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-[#FBFAF8]">
      <Header />

      <div className="mx-auto max-w-[820px] space-y-5 px-4 py-6 sm:px-6">
        <section className="flex items-center justify-between gap-4 rounded-md border border-[#EEE8E1] bg-[#F7F4F0] px-5 py-3">
          <div>
            <h2 className="text-lg font-normal text-[#2F2B28]">בחרי חבילה</h2>
            <p className="text-[12px] text-[#5A544E]">עברי בין החבילות של הילדים השונים</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[#93603A] px-3 py-1.5 text-white shadow-[0_2px_6px_rgba(90,55,30,0.25)]">
            {hasSiblings && (
              <button type="button" onClick={() => goToSibling(-1)} aria-label="חבילה קודמת" className="p-0.5 hover:opacity-80">
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <span className="px-3 text-center leading-tight">
              <span className="block text-[11px] text-white/85">החבילה של</span>
              <span className="block text-base">{displayName || 'הילד/ה'}</span>
            </span>
            {hasSiblings && (
              <button type="button" onClick={() => goToSibling(1)} aria-label="חבילה הבאה" className="p-0.5 hover:opacity-80">
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        <section className="flex items-center justify-between gap-5 rounded-md bg-[#F3EEE9] px-5 py-6 sm:px-8">
          <div className="min-w-0">
            <h1 className="mb-2 flex flex-wrap items-center gap-2 text-xl font-normal text-[#2F2B28] sm:text-2xl">
              {titleParts.map((part, index) => (
                <span key={part} className="flex items-center gap-2">
                  {index > 0 && <Sparkle className="h-3 w-3 text-[#C9A991]" />}
                  {part}
                </span>
              ))}
            </h1>
            <p className="mb-1.5 text-[13px] text-[#3C3834]">{pkg.description}</p>
            {displayName && (
              <p className="text-lg text-[#B39A86]">מותאם אישית עבור: {displayName}</p>
            )}
          </div>
          <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white sm:h-28 sm:w-28">
            <Gift className="h-12 w-12 text-[#8A6A50]" strokeWidth={1} />
          </span>
        </section>

        <section className="rounded-md border border-[#9C9288] bg-white p-3">
          {content.heroImage ? (
            <img
              src={content.heroImage}
              alt={`תצוגת חבילה ${pkg.name}`}
              className="aspect-[16/10] w-full rounded-sm object-cover"
            />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center bg-[#F7F4F0] px-6 text-center text-sm text-[#B5A99A]">
              תמונות עיצוב החבילה יתווספו בקרוב
            </div>
          )}
          {content.galleryImages.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {content.galleryImages.map((image) => (
                <img key={image} src={image} alt="" className="aspect-square rounded-sm object-cover" />
              ))}
            </div>
          )}
          <div className="px-2 pb-2 pt-3">
            <h2 className="mb-1 flex items-center gap-2 text-xl font-normal text-[#2F2B28]">
              <Sparkle className="h-3.5 w-3.5 text-[#C9A991]" />
              כך הכל מתחבר יחד
            </h2>
            <p className="text-[13px] leading-6 text-[#3C3834]">
              ההמחשה מציגה איך הגוונים והפריטים שבחבילה משתלבים לעיצוב שלם. הסידור הוא הצעה אחת
              ליישום, וניתן להתאים אותו למבנה ולמידות החדר שלכם בקלות. בהמשך תמצאו גם טיפים שיעזרו
              לכם בהתאמה.
            </p>
          </div>
        </section>

        <section className="rounded-md bg-white px-4 py-5 sm:px-6">
          <h2 className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xl font-medium text-[#2F2B28]">
            <span className="flex items-center gap-2">
              <Palette className="h-5 w-5" strokeWidth={1.4} />
              פלטת גוונים
            </span>
            <span className="flex items-center gap-1.5 text-[15px] font-normal text-[#3C3834]">
              סקלה נבחרת
              <Sparkle className="h-3 w-3 text-[#C9A991]" />
              {colorScale.name}
            </span>
          </h2>
          <div className="grid grid-cols-3 gap-y-6 sm:grid-cols-6">
            {colorScale.colors.map((color) => (
              <div key={`${color.roleLabel}-${color.name}`} className="flex flex-col items-center text-center">
                <div
                  className="mb-3 h-14 w-14 rounded-full sm:h-16 sm:w-16"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-[13px] leading-tight text-[#2F2B28]">{color.roleLabel}</p>
                <p className="text-[13px] leading-tight text-[#2F2B28]">{color.name}</p>
                {color.code && <p className="mt-0.5 text-[11px] text-[#8B8B8B]">{color.code}</p>}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-normal text-[#2F2B28]">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.4} />
            רשימת קניות עם קישורים ישירים
          </h2>
          <p className="mb-6 rounded-md border border-[#E7E0D8] bg-[#F5F2EE] px-4 py-3 text-[12px] leading-6 text-[#3C3834]">
            לינק לא זמין? העתיקו את תמונת המוצר מהרשימה והדביקו אותה בחיפוש לפי תמונה ב-AliExpress - כדי
            למצוא את הפריט או חלופה דומה.
          </p>

          {content.shoppingCategories.length === 0 ? (
            <p className="text-center text-sm text-[#8B8B8B]">רשימת הקנייה לנושא זה תתווסף בקרוב.</p>
          ) : (
            <div className="space-y-8">
              {content.shoppingCategories.map((category, categoryIndex) => (
                <div key={category.category}>
                  <h3 className="mb-3 flex flex-wrap items-baseline gap-x-3 text-2xl font-normal text-[#2F2B28]">
                    {category.category}
                    {categoryIndex === 0 && (
                      <span className="text-sm text-[#5A544E]">סמנו V לצד הפריטים שרכשתם למעקב נוח</span>
                    )}
                  </h3>
                  <div className="space-y-3">
                    {category.items.map((item) => {
                      const isChecked = checked.includes(item.name)
                      return (
                        <div key={item.name} className="flex items-center gap-3">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={isChecked}
                            aria-label={`סימון ${item.name} כנרכש`}
                            onClick={() => toggle(item.name)}
                            className={`flex h-5 w-5 shrink-0 items-center justify-center border-[1.5px] ${
                              isChecked ? 'border-[#93603A] bg-[#93603A] text-white' : 'border-[#93603A] bg-white'
                            }`}
                          >
                            {isChecked && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                          </button>
                          <div className="flex min-w-0 flex-1 items-center gap-4 rounded-md bg-[#F5F2EE] p-3 sm:p-4">
                            <ProductImage
                              src={item.image}
                              alt={item.name}
                              className="h-20 w-20 shrink-0 rounded-sm bg-white object-cover sm:h-24 sm:w-24"
                            />
                            <div className="min-w-0 flex-1">
                              <p className={`mb-1 text-[15px] font-medium text-[#2F2B28] ${isChecked ? 'line-through opacity-60' : ''}`}>
                                {item.name}
                              </p>
                              {item.notes && <p className="text-[13px] leading-relaxed text-[#5A544E]">{item.notes}</p>}
                            </div>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`קנייה: ${item.name}`}
                              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[#C4AE9C] px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#B39A86] sm:px-7"
                            >
                              קנייה
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-6 flex items-center gap-1.5 rounded-md border border-[#EEE5DC] bg-[#FBF7F3] px-4 py-2.5 text-[12px] text-[#3C3834]">
            <span className="text-[#B39A86]">כדאי לדעת</span>
            <Sparkle className="h-2.5 w-2.5 text-[#C9A991]" />
            חלק מהקישורים למוצרים עשויים לתמוך ב-Petite Dreams, ללא עלות נוספת עבורכם.
          </p>
        </section>

        <section className="rounded-md border border-[#ECE6DF] bg-white px-5 py-6 sm:px-6">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-normal text-[#2F2B28]">
            <Upload className="h-5 w-5" strokeWidth={1.4} />
            שיתוף התוצאות שלכם
          </h2>
          <p className="mb-6 text-[13px] leading-7 text-[#3C3834]">
            נשמח לראות את החדר שיצרתם! העלו תמונות לפני ואחרי ושתפו את היצירה שלכם.
          </p>
          {!photosUploaded ? (
            <div>
              <div className="mb-5 grid gap-4 md:grid-cols-2">
                {[
                  { id: 'before-image', label: 'תמונה לפני', icon: Camera, file: beforeImage, setFile: setBeforeImage },
                  { id: 'after-image', label: 'תמונה אחרי', icon: Sparkles, file: afterImage, setFile: setAfterImage },
                ].map(({ id, label, icon: Icon, file, setFile }) => (
                  <div key={id}>
                    <div className="mb-2 flex items-center gap-2 text-[12px] text-[#3C3834]">
                      {label}
                      <Icon className="h-5 w-5 text-[#A89888]" strokeWidth={1.3} />
                    </div>
                    <label
                      htmlFor={id}
                      className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-[#D9C6B5] bg-[#F8F5F2] px-6 py-8 text-center"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={id}
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      {file ? (
                        <>
                          <Check className="mb-3 h-7 w-7 text-[#7BA05B]" />
                          <p className="text-sm text-[#7BA05B]">{file.name}</p>
                          <p className="mt-1 text-xs text-[#B5B0A8]">לחצו להחלפה</p>
                        </>
                      ) : (
                        <>
                          <Upload className="mb-3 h-8 w-8 text-[#B39A86]" strokeWidth={1.3} />
                          <p className="text-[13px] text-[#3C3834]">לחצו להעלאת תמונה</p>
                          <p className="mt-1 text-[11px] text-[#5A544E]">JPG, PNG עד 10MB</p>
                        </>
                      )}
                    </label>
                  </div>
                ))}
              </div>
              <label className="mb-5 flex cursor-pointer items-center gap-3 rounded-md border border-[#EEE8E1] bg-[#F8F5F2] px-5 py-4 text-[12px] leading-6 text-[#3C3834]">
                <input
                  type="checkbox"
                  checked={allowSocialShare}
                  onChange={(e) => setAllowSocialShare(e.target.checked)}
                  className="h-4 w-4 flex-shrink-0 accent-[#8A6A50]"
                />
                <span>
                  אנחנו מאשרים ל-PETITE DREAMS לשתף את התמונות שלנו ברשתות החברתיות ובחומרי שיווק. התמונות
                  עשויות לשמש כדוגמאות לעיצובים מוצלחים ולהשראה ללקוחות אחרים.
                </span>
              </label>
              <button
                type="button"
                onClick={() => {
                  if (beforeImage && afterImage) {
                    setPhotosUploaded(true)
                  } else {
                    alert('אנא העלו שתי תמונות - לפני ואחרי')
                  }
                }}
                className="w-full rounded-md bg-[#C4AE9C] py-3 text-sm text-white transition-colors hover:bg-[#B39A86]"
              >
                שליחת תמונות
              </button>
            </div>
          ) : (
            <div className="rounded-md bg-[#F7F4F0] py-10 text-center">
              <h3 className="mb-2 text-xl font-light text-[#4A4A4A]">תודה רבה על השיתוף!</h3>
              <p className="text-sm text-[#8B8B8B]">
                {allowSocialShare
                  ? 'נשמח לשתף את היצירה היפה שלכם עם הקהילה שלנו.'
                  : 'התמונות נשמרו לצפייה אישית בלבד.'}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-md border border-[#E7E0D8] bg-[#F3F0ED] px-4 py-10 text-center">
          <HeartBowIcon />
          <h2 className="mb-4 text-2xl font-normal text-[#2F2B28]">עד הפעם הבאה!</h2>
          <p className="mx-auto mb-3 max-w-xl text-[15px] leading-7 text-[#3C3834]">
            ילדים גדלים, טעמים משתנים, וחדרים צריכים לגדול איתם.
          </p>
          <p className="mx-auto mb-6 max-w-xl text-[15px] leading-7 text-[#3C3834]">
            נפגש כשהילד יגדל בעוד כמה שנים, כשיגיע הזמן להתאים את החדר מחדש בצורה מושלמת למי שהם הפכו
            להיות.
          </p>
          <p className="text-lg text-[#C9B5A3]">נזכיר לכם בזמן הנכון - פשוט המשיכו ליהנות מהחדר היפה שלכם!</p>
        </section>
      </div>
    </div>
  )
}
