import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Gift,
  Heart,
  Home,
  Plus,
  Sparkles,
  Upload,
} from 'lucide-react'
import { Header } from '../components/Header'
import { PageLoading } from '../components/PageLoading'
import { ProductImage } from '../components/ProductImage'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { getChildrenForPackage, hasPurchased } from '../utils/auth'

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center justify-center gap-3 text-xl font-light text-[#4A4A4A] sm:text-2xl">
      <Plus className="h-5 w-5 text-[#C4B8A8]" strokeWidth={1.5} />
      {children}
      <Plus className="h-5 w-5 text-[#C4B8A8]" strokeWidth={1.5} />
    </h2>
  )
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
  const childTheme = searchParams.get('theme') || ''
  const childColorPreference = searchParams.get('colorPreference') || ''
  const allUserChildren = user?.children || []
  const allChildren = pkg ? getChildrenForPackage(user, pkg.id) : []
  const selectedChild = allChildren[selectedChildIndex]
  const displayName = selectedChild?.name || childName
  const displayTheme = selectedChild?.theme || childTheme
  const displayColors = selectedChild?.colorPreference || childColorPreference
  const content = pkg ? getPackageContent(pkg.id) : null
  const colorScale = getColorScaleForPreference(displayColors)

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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="inline-flex items-center gap-2 rounded-full bg-[#3F3A36] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#2F2B28]"
          >
            <ChevronRight className="h-4 w-4" />
            חזרה לחשבון
          </button>

          {allUserChildren.length > 1 ? (
            <div className="flex items-center gap-2 text-sm text-[#8B8B8B]">
              <button
                type="button"
                onClick={() => goToSibling(-1)}
                className="rounded-full p-1 text-[#C4B8A8] hover:text-[#4A4A4A]"
                aria-label="חבילה קודמת"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span>עבור בין החבילות של הילדים</span>
              <button
                type="button"
                onClick={() => goToSibling(1)}
                className="rounded-full p-1 text-[#C4B8A8] hover:text-[#4A4A4A]"
                aria-label="חבילה הבאה"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#B5B0A8]">עבור בין החבילות של הילדים</p>
          )}
        </div>

        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#EDE8E1]">
            <Gift className="h-8 w-8 text-[#C4B8A8]" strokeWidth={1.25} />
          </div>
          <h1 className="mb-3 text-3xl font-light text-[#4A4A4A] sm:text-4xl">{pkg.name}</h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#8B8B8B] sm:text-base">
            {pkg.description}
            {displayName ? ` מותאם אישית עבור ${displayName}` : ''}.
            {displayTheme ? ` נושא: ${displayTheme}.` : ''}
          </p>
        </div>

        <div className="mb-12 overflow-hidden rounded-2xl bg-[#F7F4F0]">
          {content.heroImage ? (
            <img
              src={content.heroImage}
              alt={`תצוגת חבילה ${pkg.name}`}
              className="aspect-[16/10] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center px-6 text-center text-sm text-[#B5A99A]">
              תמונות עיצוב החבילה יתווספו בקרוב
            </div>
          )}
        </div>

        {content.galleryImages.length > 0 && (
          <div className="mb-12 grid grid-cols-3 gap-3">
            {content.galleryImages.map((image) => (
              <img
                key={image}
                src={image}
                alt=""
                className="aspect-square rounded-xl object-cover"
              />
            ))}
          </div>
        )}

        <section className="mb-14 text-center">
          <SectionTitle>איך להתאים</SectionTitle>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-[#8B8B8B]">
            הסידור והצבעה ליישום, והפריטים נבחרו כדי להשלים את ההדמיה.
            השתמשו בפלטת הגוונים וברשימת הקניות כדי לשחזר את המראה בחדר.
          </p>
        </section>

        <section className="mb-14">
          <SectionTitle>פלטת {colorScale.name}</SectionTitle>
          <div className="flex items-start justify-center gap-3 sm:gap-8">
            {colorScale.colors.map((color) => (
              <div
                key={`${color.roleLabel}-${color.name}`}
                className="flex min-w-0 flex-1 max-w-[110px] flex-col items-center text-center"
              >
                <div
                  className="mb-3 h-11 w-11 rounded-full border border-[#EDE8E1] sm:h-14 sm:w-14"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-[11px] leading-tight text-[#4A4A4A] sm:text-xs">
                  {color.roleLabel}
                </p>
                <p className="text-[11px] leading-tight text-[#8B8B8B] sm:text-xs">{color.name}</p>
                {color.code && (
                  <p className="mt-0.5 font-mono text-[10px] text-[#B5B0A8]">{color.code}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <SectionTitle>רשימת קניות ישירה</SectionTitle>
          <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-7 text-[#8B8B8B]">
            כל הפריטים שנבחרו עבור {displayName || 'הילד/ה שלך'} נמצאים כאן בקליק אחד.
            במידה ופריט אזל מ-AliExpress, חפשו תמונה זהה או היעזרו במדריך שבאזור האישי.
          </p>

          {content.shoppingCategories.length === 0 ? (
            <p className="text-center text-sm text-[#8B8B8B]">
              רשימת הקנייה לנושא זה תתווסף בקרוב.
            </p>
          ) : (
            <div className="space-y-8">
              {content.shoppingCategories.map((category) => (
                <div key={category.category}>
                  <h3 className="mb-4 text-center text-lg font-light text-[#4A4A4A]">
                    {category.category}
                  </h3>
                  <div className="divide-y divide-[#F0EBE4]">
                    {category.items.map((item) => (
                      <div key={item.name} className="flex items-center gap-4 py-5">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-20 flex-shrink-0 rounded-xl border border-[#EDE8E1] bg-white object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-[#4A4A4A]">{item.name}</p>
                          {item.notes && (
                            <p className="text-sm leading-relaxed text-[#8B8B8B]">{item.notes}</p>
                          )}
                        </div>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`קנייה: ${item.name}`}
                          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#E4DDD3] text-[#6B6B6B] transition-colors hover:border-[#C4B8A8] hover:text-[#4A4A4A]"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-16 border-t border-[#F0EBE4] pt-12">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-right">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-[#EDE8E1]">
              <Home className="h-6 w-6 text-[#C4B8A8]" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-light text-[#4A4A4A]">מעבר לסטיילינג: יסודות החדר</h2>
              <p className="mb-4 text-sm leading-7 text-[#8B8B8B]">
                כדי שהעיצוב החדש ייראה במיטבו, חשוב שהתשתית תהיה נכונה. אם אתם שוקלים להחליף את
                המיטה, הארון או שולחן הכתיבה, כל הדגשים המקצועיים מחכים באזור האישי.
              </p>
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="text-sm text-[#8B7340] hover:underline"
              >
                אל ה-Furniture Masterclass
              </button>
            </div>
          </div>
        </section>

        <section className="mb-6 pt-4">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-light text-[#4A4A4A] sm:text-2xl">
            <Upload className="h-5 w-5 text-[#C4B8A8]" strokeWidth={1.5} />
            שיתוף התוצאות שלך
          </h2>
          <p className="mb-8 text-sm leading-7 text-[#8B8B8B]">
            נשמח לראות את החדר שיצרת! העלי תמונות לפני ואחרי ושתפי את היצירה שלך.
          </p>
          {!photosUploaded ? (
            <div>
              <div className="mb-5 grid gap-4 md:grid-cols-2">
                {[
                  {
                    id: 'before-image',
                    label: 'תמונה לפני',
                    icon: Camera,
                    file: beforeImage,
                    setFile: setBeforeImage,
                  },
                  {
                    id: 'after-image',
                    label: 'תמונה אחרי',
                    icon: Sparkles,
                    file: afterImage,
                    setFile: setAfterImage,
                  },
                ].map(({ id, label, icon: Icon, file, setFile }) => (
                  <div key={id}>
                    <div className="mb-2 flex items-center gap-2 text-sm text-[#8B8B8B]">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                      {label}
                    </div>
                    <label
                      htmlFor={id}
                      className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#E4DDD3] bg-[#FBF9F6] px-6 py-10 text-center"
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
                          <p className="mt-1 text-xs text-[#B5B0A8]">לחצי להחלפה</p>
                        </>
                      ) : (
                        <>
                          <Upload className="mb-3 h-7 w-7 text-[#C4B8A8]" strokeWidth={1.25} />
                          <p className="text-sm text-[#8B8B8B]">לחצי להעלאת תמונה</p>
                          <p className="mt-1 text-xs text-[#B5B0A8]">JPG, PNG עד 10MB</p>
                        </>
                      )}
                    </label>
                  </div>
                ))}
              </div>
              <label className="mb-5 flex cursor-pointer items-center gap-3 rounded-2xl bg-[#F7F4F0] px-5 py-4 text-sm leading-6 text-[#8B8B8B]">
                <input
                  type="checkbox"
                  checked={allowSocialShare}
                  onChange={(e) => setAllowSocialShare(e.target.checked)}
                  className="h-4 w-4 flex-shrink-0 accent-[#C4B8A8]"
                />
                <span>
                  אני מאשרת ל-PETITE DREAMS לשתף את התמונות שלי ברשתות החברתיות ובחומרי שיווק.
                  התמונות עשויות לשמש כדוגמאות לעיצובים מוצלחים ולהשראה ללקוחות אחרים.
                </span>
              </label>
              <button
                type="button"
                onClick={() => {
                  if (beforeImage && afterImage) {
                    setPhotosUploaded(true)
                  } else {
                    alert('אנא העלי שתי תמונות - לפני ואחרי')
                  }
                }}
                className="w-full rounded-full bg-[#C4B8A8] py-3.5 text-sm text-white transition-colors hover:bg-[#B5A99A]"
              >
                שליחת תמונות
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#F7F4F0] py-10 text-center">
              <h3 className="mb-2 text-xl font-light text-[#4A4A4A]">תודה רבה על השיתוף!</h3>
              <p className="text-sm text-[#8B8B8B]">
                {allowSocialShare
                  ? 'נשמח לשתף את היצירה היפה שלך עם הקהילה שלנו.'
                  : 'התמונות נשמרו לצפייה אישית בלבד.'}
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="bg-[#F7F4F0] px-4 py-16 text-center">
        <Heart className="mx-auto mb-5 h-9 w-9 text-[#C4B8A8]" strokeWidth={1.25} />
        <h2 className="mb-4 text-2xl font-light text-[#4A4A4A] sm:text-3xl">עד הפעם הבאה!</h2>
        <p className="mx-auto mb-2 max-w-xl text-sm leading-7 text-[#8B8B8B] sm:text-base">
          ילדים גדלים, טעמים משתנים, וחדרים צריכים לגדול איתם.
        </p>
        <p className="mx-auto mb-6 max-w-xl text-sm leading-7 text-[#8B8B8B] sm:text-base">
          נפגש כשהילד יגדל בעוד כמה שנים, כשיגיע הזמן להתאים את החדר מחדש בצורה מושלמת למי שהם
          הפכו להיות.
        </p>
        <p className="text-sm text-[#C4B8A8]">
          נזכיר לך בזמן הנכון - פשוט המשיכי ליהנות מהחדר היפה שלך!
        </p>
      </section>
    </div>
  )
}
