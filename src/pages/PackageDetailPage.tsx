import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Home,
  Palette,
  Ruler,
  ShoppingBag,
  Sparkles,
  Upload,
} from 'lucide-react'
import { Header } from '../components/Header'
import { PageLoading } from '../components/PageLoading'
import { ProductImage } from '../components/ProductImage'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import {
  getChildrenForPackage,
  hasPurchased,
} from '../utils/auth'

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
    return null
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {allUserChildren.length > 1 && (
          <div className="mb-8 rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1 text-xl font-light text-[#4A4A4A]">
                  {justPurchased ? 'החבילות שלך מוכנות!' : 'בחרי חבילה'}
                </h3>
                <p className="text-sm text-[#6B6B6B]">
                  {justPurchased
                    ? 'עברי בין החבילות של הילדים כדי לראות את כל פרטי העיצוב'
                    : 'עברי בין החבילות של הילדים השונים'}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-sm border border-[#E8DED2] bg-white px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    const currentChildIndex = allUserChildren.findIndex(
                      (c) => c.packageId === packageId && c.name === selectedChild?.name,
                    )
                    const prevIndex =
                      currentChildIndex > 0 ? currentChildIndex - 1 : allUserChildren.length - 1
                    const prevChild = allUserChildren[prevIndex]
                    if (prevChild.packageId !== packageId) {
                      navigate(`/package/${prevChild.packageId}`)
                    } else {
                      const newIndex = allChildren.findIndex((c) => c.name === prevChild.name)
                      setSelectedChildIndex(newIndex)
                    }
                  }}
                  className="text-[#C8B6A6] transition-colors hover:text-[#B5A99A]"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="min-w-[120px] text-center">
                  <div className="text-sm text-[#8B8B8B]">חבילה של</div>
                  <div className="text-lg font-normal text-[#4A4A4A]">
                    {selectedChild?.name || allUserChildren[0]?.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentChildIndex = allUserChildren.findIndex(
                      (c) => c.packageId === packageId && c.name === selectedChild?.name,
                    )
                    const nextIndex =
                      currentChildIndex < allUserChildren.length - 1 ? currentChildIndex + 1 : 0
                    const nextChild = allUserChildren[nextIndex]
                    if (nextChild.packageId !== packageId) {
                      navigate(`/package/${nextChild.packageId}`)
                    } else {
                      const newIndex = allChildren.findIndex((c) => c.name === nextChild.name)
                      setSelectedChildIndex(newIndex)
                    }
                  }}
                  className="text-[#C8B6A6] transition-colors hover:text-[#B5A99A]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {justPurchased && allUserChildren.length === 1 && (
          <div className="mb-8 rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#C8B6A6]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-1 text-2xl font-light text-[#4A4A4A]">החבילה שלך מוכנה!</h3>
                <p className="text-[#6B6B6B]">
                  כל פרטי העיצוב, קישורי הקנייה ומדריכי ההתקנה מוצגים למטה. תמיד תוכלי לגשת לחבילה
                  מהחשבון שלך.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              {content.heroImage ? (
                <div className="mb-4 overflow-hidden rounded-sm border border-[#E8DED2]">
                  <img
                    src={content.heroImage}
                    alt={`תצוגת חבילה ${pkg.name}`}
                    className="aspect-square w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mb-4 flex aspect-square items-center justify-center rounded-sm border border-dashed border-[#E8DED2] bg-[#F9F7F4] px-6 text-center text-sm text-[#B5A99A]">
                  תמונות עיצוב החבילה יתווספו בקרוב
                </div>
              )}
              {content.galleryImages.length > 0 && (
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {content.galleryImages.map((image) => (
                    <img
                      key={image}
                      src={image}
                      alt=""
                      className="aspect-square rounded-sm border border-[#E8DED2] object-cover"
                    />
                  ))}
                </div>
              )}
              <p className="text-center text-sm text-[#8B8B8B]">
                הדמיה תלת-ממדית מלאה תהיה זמינה בקרוב
              </p>
            </div>

            <div>
              <div className="mb-3 inline-block rounded-full border border-[#E8DED2] bg-[#F9F7F4] px-3 py-1 text-sm text-[#7BA05B]">
                ✓ חבילה פעילה
              </div>
              <h1 className="mb-3 text-4xl font-light text-[#4A4A4A]">{pkg.name}</h1>
              <p className="mb-6 text-lg text-[#6B6B6B]">{pkg.description}</p>
              {displayName && (
                <div className="mb-4">
                  <p className="mb-2 text-2xl text-[#C8B6A6]">מותאם אישית עבור: {displayName}</p>
                  {displayTheme && (
                    <p className="text-sm text-[#8B8B8B]">נושא: {displayTheme}</p>
                  )}
                  {displayColors && (
                    <p className="text-sm text-[#8B8B8B]">גוונים: {displayColors}</p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate('/tips')}
                className="flex items-center gap-2 rounded-sm bg-[#C8B6A6] px-6 py-3 text-white transition-colors hover:bg-[#B5A99A]"
              >
                <Sparkles className="h-4 w-4" />
                טיפים לקנייה (באזור האישי)
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm">
          <h2 className="mb-2 flex items-center gap-3 text-2xl font-light text-[#4A4A4A]">
            <Palette className="h-6 w-6 text-[#4A3728]" strokeWidth={1.5} />
            לוח צבעים מדויק
          </h2>
          {displayColors && (
            <p className="mb-6 text-sm text-[#6B6B6B]">
              סקלה נבחרת: <span className="text-[#4A4A4A]">{displayColors}</span>
              {' · '}
              {colorScale.name}
            </p>
          )}
          <div className="flex items-start justify-between gap-1 sm:gap-3">
            {colorScale.colors.map((color) => (
              <div
                key={`${color.roleLabel}-${color.name}`}
                className="flex min-w-0 flex-1 flex-col items-center px-0.5 text-center"
              >
                <div
                  className="mb-2 h-9 w-9 shrink-0 rounded-full border border-[#E8DED2] sm:h-10 sm:w-10"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-[10px] leading-tight font-normal text-[#4A4A4A] sm:text-xs">
                  {color.roleLabel}
                </p>
                <p className="text-[10px] leading-tight text-[#6B6B6B] sm:text-xs">{color.name}</p>
                {color.code && (
                  <p className="font-mono text-[9px] text-[#8B8B8B] sm:text-[10px]">{color.code}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-light text-[#4A4A4A]">
            <ShoppingBag className="h-6 w-6 text-[#4A3728]" />
            רשימת קניות עם קישורים ישירים
          </h2>

          <div className="mb-6 rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-5">
            <p className="text-sm leading-relaxed text-[#4A3728]">
              כל הפריטים שנבחרו עבור {displayName || 'הילד/ה שלך'} נמצאים כאן בקליק אחד.
              במידה ופריט אזל מהמלאי או שתרצו לעשות סקר שוק חכם - מחכה לכם המדריך המלא ב-
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="cursor-pointer font-normal text-[#C8B6A6] underline underline-offset-2 hover:text-[#B5A99A]"
              >
                &apos;ארגז הכלים&apos; באזור האישי
              </button>
              .
            </p>
          </div>

          <div className="space-y-6">
            {content.shoppingCategories.length === 0 ? (
              <div className="rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-8 text-center">
                <p className="text-[#6B6B6B]">
                  רשימת הקנייה לנושא זה תתווסף בקרוב. בינתיים תוכלי לצפות במדריך המיקום וההדמיה.
                </p>
              </div>
            ) : (
              content.shoppingCategories.map((category) => (
                <div key={category.category}>
                  <h3 className="mb-3 border-b border-[#E8DED2] pb-2 text-lg font-normal text-[#4A4A4A]">
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-4 rounded-sm bg-[#F9F7F4] p-4 transition-colors hover:bg-[#F5F1ED]"
                      >
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-20 flex-shrink-0 rounded-sm border border-[#E8DED2] object-cover bg-white"
                        />
                        <div className="flex-1">
                          <p className="mb-1 font-normal text-[#4A4A4A]">{item.name}</p>
                          {item.notes && (
                            <p className="text-sm text-[#8B8B8B]">{item.notes}</p>
                          )}
                        </div>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-shrink-0 items-center gap-2 rounded-sm bg-[#C8B6A6] px-5 py-2.5 text-white transition-colors hover:bg-[#B5A99A]"
                        >
                          קנייה
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {content.placementGuide.length > 0 && (
          <div className="mb-8 rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-light text-[#4A4A4A]">
              <Ruler className="h-6 w-6 text-[#4A3728]" strokeWidth={1.5} />
              מדריך מיקום ותלייה
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9F7F4]">
                  <tr>
                    <th className="px-4 py-3 text-right font-normal text-[#4A4A4A]">אלמנט</th>
                    <th className="px-4 py-3 text-right font-normal text-[#4A4A4A]">קיר</th>
                    <th className="px-4 py-3 text-right font-normal text-[#4A4A4A]">גובה</th>
                    <th className="px-4 py-3 text-right font-normal text-[#4A4A4A]">הערות</th>
                  </tr>
                </thead>
                <tbody>
                  {content.placementGuide.map((item) => (
                    <tr key={item.element} className="border-b border-[#E8DED2]">
                      <td className="px-4 py-3 text-[#4A4A4A]">{item.element}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{item.wall}</td>
                      <td className="px-4 py-3 font-normal text-[#4A4A4A]">{item.height}</td>
                      <td className="px-4 py-3 text-sm text-[#8B8B8B]">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-4">
              <p className="text-sm text-[#6B6B6B]">
                <strong className="text-[#4A4A4A]">📐 טיפ מקצועי:</strong> השתמשי במד מדבקות למיקום
                מושלם. התחילי ממרכז הקיר ועבדי החוצה לסימטריה הטובה ביותר.
              </p>
            </div>
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-[#E8DED2] bg-gradient-to-br from-[#F5F1ED] to-[#EDE5DD] p-8 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70">
                <Home className="h-8 w-8 text-[#4A3728] stroke-[1.5]" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="mb-3 text-2xl font-light text-[#4A4A4A]">מעבר לסטיילינג: יסודות החדר</h2>
              <p className="mb-5 leading-relaxed text-[#6B6B6B]">
                כדי שהעיצוב החדש ייראה במיטבו, חשוב שהתשתית תהיה נכונה. אם אתם שוקלים להחליף את
                המיטה, הארון או שולחן הכתיבה, ריכזתי עבורכם את כל הדגשים המקצועיים שלי לבחירה
                חכמה, ארגונומית ועל-זמנית.
              </p>
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C8B6A6] px-6 py-3 font-normal text-white transition-colors hover:bg-[#B5A99A]"
              >
                אל ה-Furniture Masterclass (באזור האישי)
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-light text-[#4A4A4A]">
            <Upload className="h-6 w-6 text-[#4A3728]" strokeWidth={1.5} />
            שיתוף התוצאות שלך
          </h2>

          {!photosUploaded ? (
            <div>
              <p className="mb-6 text-[#6B6B6B]">
                נשמח לראות את החדר שיצרת! העלי תמונות לפני ואחרי ושתפי את היצירה שלך.
              </p>

              <div className="mb-6 grid gap-6 md:grid-cols-2">
                {[
                  { id: 'before-image', label: 'תמונה לפני 📸', file: beforeImage, setFile: setBeforeImage },
                  { id: 'after-image', label: 'תמונה אחרי ✨', file: afterImage, setFile: setAfterImage },
                ].map(({ id, label, file, setFile }) => (
                  <div key={id}>
                    <label className="mb-3 block text-sm font-normal text-[#4A4A4A]">{label}</label>
                    <div className="cursor-pointer rounded-sm border-2 border-dashed border-[#E8DED2] bg-[#F9F7F4] p-8 text-center transition-colors hover:border-[#C8B6A6]">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={id}
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor={id} className="cursor-pointer">
                        {file ? (
                          <div>
                            <Check className="mx-auto mb-2 h-12 w-12 text-[#7BA05B]" />
                            <p className="font-normal text-[#7BA05B]">{file.name}</p>
                            <p className="mt-1 text-sm text-[#8B8B8B]">לחצי להחלפה</p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="mx-auto mb-2 h-12 w-12 text-[#C8B6A6]" />
                            <p className="text-[#6B6B6B]">לחצי להעלאת תמונה</p>
                            <p className="mt-1 text-sm text-[#8B8B8B]">JPG, PNG עד 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-5">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={allowSocialShare}
                    onChange={(e) => setAllowSocialShare(e.target.checked)}
                    className="mt-1 h-4 w-4 flex-shrink-0 accent-[#C8B6A6]"
                  />
                  <span className="text-sm leading-relaxed text-[#4A4A4A]">
                    אני מאשרת ל-PETITE DREAMS לשתף את התמונות שלי ברשתות החברתיות ובחומרי שיווק.
                    התמונות עשויות לשמש כדוגמאות לעיצובים מוצלחים ולהשראה ללקוחות אחרים.
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (beforeImage && afterImage) {
                    setPhotosUploaded(true)
                  } else {
                    alert('אנא העלי שתי תמונות - לפני ואחרי')
                  }
                }}
                className="w-full rounded-sm bg-[#C8B6A6] py-3 font-normal text-white transition-colors hover:bg-[#B5A99A]"
              >
                שליחת תמונות
              </button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F8F0]">
                <Check className="h-8 w-8 text-[#7BA05B]" />
              </div>
              <h3 className="mb-2 text-xl font-light text-[#4A4A4A]">תודה רבה על השיתוף!</h3>
              <p className="text-[#6B6B6B]">
                התמונות שלך נקלטו בהצלחה.{' '}
                {allowSocialShare
                  ? 'נשמח לשתף את היצירה היפה שלך עם הקהילה שלנו! 🎉'
                  : 'התמונות נשמרו לצפייה אישית בלבד.'}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-sm border border-[#E8DED2] bg-gradient-to-br from-[#F9F7F4] to-[#F5F1ED] p-10 text-center shadow-sm">
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 text-5xl">💝</div>
            <h2 className="mb-4 text-2xl font-light text-[#4A4A4A]">עד הפעם הבאה!</h2>
            <p className="mb-2 text-lg leading-relaxed text-[#6B6B6B]">
              ילדים גדלים, טעמים משתנים, וחדרים צריכים לגדול איתם.
            </p>
            <p className="text-lg leading-relaxed text-[#6B6B6B]">
              נפגש כשהילד יגדל בעוד כמה שנים, כשיגיע הזמן להתאים את החדר מחדש בצורה מושלמת למי
              שהם הפכו להיות. 🌱
            </p>
            <p className="mt-6 text-sm text-[#C8B6A6]">
              נזכיר לך בזמן הנכון - פשוט המשיכי ליהנות מהחדר היפה שלך! ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
