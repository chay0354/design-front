import { supabase } from '../lib/supabase'
import { visibleShoppingCategories, type ThemePackage } from '../data/themePackages'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Headphones,
  Heart,
  ShoppingBag,
  Sparkles,
  Upload,
  Wrench,
} from 'lucide-react'
import { Sparkle } from '../components/BrushTitle'
import { Header } from '../components/Header'
import { PageLoading } from '../components/PageLoading'
import { ProductImage } from '../components/ProductImage'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { hasPurchased } from '../utils/auth'
import { formatRoomNames } from '../utils/questionnaire'
import { getAccountRooms, roomKids, type RoomKid } from '../utils/rooms'

const CARD = 'rounded-[22px] border border-[#EFE6DC] bg-white shadow-[0_6px_24px_rgba(120,95,70,0.06)]'

function HeartBowIcon() {
  return (
    <svg viewBox="0 0 64 56" className="mx-auto mb-2 h-14 w-14 text-[#A27A5C]" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
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
    try {
      setChecked(JSON.parse(localStorage.getItem(storageKey) || '[]') as string[])
    } catch {
      setChecked([])
    }
  }, [storageKey])

  const toggle = (name: string) =>
    setChecked((current) => {
      const next = current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })

  return { checked, toggle }
}

export function PackageDetailPage() {
  const { packageId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const {
    packages,
    getPackageById,
    getPackageContent,
    getColorScaleForPreference,
    loading: dataLoading,
  } = useData()
  const [beforeImage, setBeforeImage] = useState<File | null>(null)
  const [afterImage, setAfterImage] = useState<File | null>(null)
  const [allowSocialShare, setAllowSocialShare] = useState(true)
  const [photosUploaded, setPhotosUploaded] = useState(false)

  // Archived packages open with ?item=<order item>: show the package exactly as it was bought.
  const orderItemId = searchParams.get('item')
  const [snapshot, setSnapshot] = useState<ThemePackage | null>(null)
  const [snapshotLoading, setSnapshotLoading] = useState(Boolean(orderItemId))
  useEffect(() => {
    if (!orderItemId) return
    let cancelled = false
    supabase
      .from('order_items')
      .select('package_snapshot')
      .eq('id', orderItemId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setSnapshot((data?.package_snapshot as ThemePackage | null) ?? null)
      })
      .then(
        () => !cancelled && setSnapshotLoading(false),
        () => !cancelled && setSnapshotLoading(false),
      )
    return () => {
      cancelled = true
    }
  }, [orderItemId])

  const currentPkg = packageId ? getPackageById(packageId) : undefined
  const pkg = snapshot && currentPkg ? { ...currentPkg, ...snapshot, id: currentPkg.id } : currentPkg

  // Which room this package page is for: ?room=<key> from the personal area, otherwise the first room with it.
  const roomParam = searchParams.get('room')
  const accountRooms = user ? getAccountRooms(user, packages, getPackageById) : []
  const archivedEntry = orderItemId ? user?.children.find((child) => child.orderItemId === orderItemId) : undefined
  const roomsWithPackage = accountRooms.filter((room) => room.pkg.id === pkg?.id)
  const room = roomsWithPackage.find((candidate) => candidate.key === roomParam) ?? roomsWithPackage[0]
  const entry = archivedEntry ?? room?.entry
  const childName = searchParams.get('childName') || ''
  const kids: RoomKid[] = entry ? roomKids(entry) : childName ? [{ name: childName, age: 0, gender: '' }] : []
  const colorPreference = entry?.colorPreference || searchParams.get('colorPreference') || ''
  const colorScale = getColorScaleForPreference(colorPreference)

  const { checked, toggle } = usePurchasedItems(
    `petite-purchased-items:${user?.id ?? ''}:${packageId ?? ''}:${entry?.name ?? childName}`,
  )

  if (loading || dataLoading || snapshotLoading) {
    return <PageLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!pkg) {
    return <Navigate to="/account" replace />
  }

  const justPurchased = searchParams.get('purchased') === 'true'
  if (!hasPurchased(user, pkg.id) && !justPurchased) {
    return <Navigate to="/account" replace />
  }

  const liveContent = getPackageContent(pkg.id)
  const content =
    liveContent && snapshot
      ? {
          ...liveContent,
          heroImage: snapshot.heroImage || liveContent.heroImage,
          galleryImages: snapshot.galleryImages?.length ? snapshot.galleryImages : liveContent.galleryImages,
          shoppingCategories: visibleShoppingCategories(snapshot.shoppingCategories || []),
        }
      : liveContent

  if (!content) {
    return <PageLoading />
  }

  const title = kids.length > 0 ? `החדר של ${formatRoomNames(kids)}` : pkg.name
  const themeName = entry?.theme || pkg.name
  const paletteColors =
    colorScale.colors.length > 0
      ? colorScale.colors.map((color) => ({ key: `${color.roleLabel}-${color.name}`, hex: color.hex, label: color.name, code: color.code }))
      : pkg.colorPalette.map((hex) => ({ key: hex, hex, label: '', code: '' }))
  const totalItems = content.shoppingCategories.reduce((sum, category) => sum + category.items.length, 0)
  const checkedCount = content.shoppingCategories.reduce(
    (sum, category) => sum + category.items.filter((item) => checked.includes(item.name)).length,
    0,
  )

  return (
    <div className="min-h-screen bg-[#FAF5F0]">
      <Header />

      <main className="mx-auto max-w-[760px] space-y-4 px-4 py-5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/account')}
          className="inline-flex items-center gap-1 text-sm text-[#5F554C] hover:text-[#3B302A]"
        >
          <ChevronRight className="h-4 w-4" />
          חזרה לחדרים שלי
        </button>

        <header className="text-center">
          <h1 className="text-[1.9rem] font-medium leading-tight text-[#3B302A] sm:text-4xl">{title}</h1>
          <p className="mt-1 text-base text-[#5F554C] sm:text-lg">חבילת {themeName}</p>
          {archivedEntry?.archivedAt && (
            <p className="mt-2 inline-block rounded-full bg-[#F1E8DF] px-3 py-1 text-xs text-[#7A6150]">
              חבילה מהארכיון · נרכשה ב־{new Date(archivedEntry.purchaseDate).toLocaleDateString('he-IL')}
            </p>
          )}
        </header>

        <section className={`${CARD} p-2.5`}>
          {content.heroImage ? (
            <img
              src={content.heroImage}
              alt={`תצוגת חבילה ${pkg.name}`}
              className="aspect-[16/10] w-full rounded-[16px] object-cover"
            />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-[16px] bg-[#F7F4F0] px-6 text-center text-sm text-[#B5A99A]">
              תמונות עיצוב החבילה יתווספו בקרוב
            </div>
          )}
          {content.galleryImages.length > 0 && (
            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              {content.galleryImages.map((image) => (
                <img key={image} src={image} alt="" className="aspect-square rounded-xl object-cover" />
              ))}
            </div>
          )}
        </section>

        <section className={`${CARD} px-5 py-5`}>
          <h2 className="mb-2 text-xl font-medium text-[#3B302A]">הקונספט העיצובי</h2>
          <p className="text-[14px] leading-7 text-[#4A4540]">{pkg.description}</p>
          <p className="mt-2 text-[13px] leading-6 text-[#7A7068]">
            ההמחשה מציגה איך הגוונים והפריטים משתלבים לעיצוב שלם. הסידור הוא הצעה אחת ליישום, וניתן להתאים אותו
            למבנה ולמידות החדר שלכם.
          </p>
        </section>

        <section className={`${CARD} px-5 py-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-medium text-[#3B302A]">{colorPreference ? colorScale.name : 'פלטת הגוונים'}</h2>
            <div className="flex flex-wrap gap-2.5">
              {paletteColors.map((color) => (
                <span
                  key={color.key}
                  title={[color.label, color.code].filter(Boolean).join(' · ')}
                  className="h-9 w-9 rounded-full border border-[#EDE6DE] sm:h-10 sm:w-10"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>
          {paletteColors.some((color) => color.label) && (
            <p className="mt-3 text-xs leading-5 text-[#8A7F75]">
              {paletteColors
                .filter((color) => color.label)
                .map((color) => (color.code ? `${color.label} (${color.code})` : color.label))
                .join(' · ')}
            </p>
          )}
        </section>

        <section className={`${CARD} px-4 py-5 sm:px-5`}>
          <div className="mb-4 text-center">
            <h2 className="flex items-center justify-center gap-2 text-xl font-medium text-[#3B302A]">
              רשימת הקניות שלכם
              <ShoppingBag className="h-5 w-5" strokeWidth={1.4} />
            </h2>
            <p className="mt-1 text-[13px] text-[#5F554C]">כל הפריטים לחדר במקום אחד. סמנו את מה שכבר רכשתם.</p>
            {totalItems > 0 && (
              <p className="mt-1 text-xs text-[#A0806A]">
                {checkedCount} מתוך {totalItems} פריטים נרכשו
              </p>
            )}
          </div>

          {content.shoppingCategories.length === 0 ? (
            <p className="text-center text-sm text-[#8B8B8B]">רשימת הקנייה לנושא זה תתווסף בקרוב.</p>
          ) : (
            <div className="space-y-5">
              {content.shoppingCategories.map((category) => (
                <div key={category.category} className="rounded-2xl border border-[#F0E8DF] bg-[#FDFAF7] px-3 py-3">
                  <h3 className="mb-2 rounded-lg bg-[#F3EAE1] px-3 py-1 text-[15px] font-medium text-[#3B302A]">
                    {category.category}
                  </h3>
                  <ul className="divide-y divide-[#F0E8DF]">
                    {category.items.map((item) => {
                      const isChecked = checked.includes(item.name)
                      return (
                        <li key={item.name} className="flex items-center gap-3 py-2">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={isChecked}
                            aria-label={`סימון ${item.name} כנרכש`}
                            onClick={() => toggle(item.name)}
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] ${
                              isChecked ? 'border-[#8A6A52] bg-[#8A6A52] text-white' : 'border-[#BFAE9E] bg-white'
                            }`}
                          >
                            {isChecked && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={`text-[14px] font-medium text-[#3B302A] ${isChecked ? 'line-through opacity-60' : ''}`}>
                              {item.name}
                            </p>
                            {item.notes && <p className="text-[12px] leading-5 text-[#7A7068]">{item.notes}</p>}
                            <div className="mt-0.5 flex flex-wrap gap-x-3">
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`לצפייה באתר: ${item.name}`}
                                  className="inline-flex items-center gap-1 text-[12px] text-[#9C7E66] hover:text-[#5F4B3B]"
                                >
                                  לצפייה באתר
                                  <ArrowLeft className="h-3 w-3" />
                                </a>
                              )}
                              {item.backupLink && (
                                <a
                                  href={item.backupLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[12px] text-[#B5A99A] hover:text-[#5F4B3B]"
                                >
                                  קישור חלופי
                                </a>
                              )}
                            </div>
                          </div>
                          <ProductImage
                            src={item.image}
                            alt={item.name}
                            className="h-14 w-20 shrink-0 rounded-lg bg-white object-cover sm:h-16 sm:w-24"
                          />
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#A39587]">
            <Sparkle className="h-2.5 w-2.5 text-[#C9A991]" />
            חלק מהקישורים למוצרים עשויים לתמוך ב-Petite Dreams, ללא עלות נוספת עבורכם.
          </p>
        </section>

        <p className="text-center text-[11px] tracking-[0.25em] text-[#B5A99A]">PETITE DREAMS · MY ROOM</p>

        <section className={`${CARD} px-4 py-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-medium text-[#3B302A]">
              <Headphones className="h-5 w-5 text-[#8A6A52]" strokeWidth={1.4} />
              צריכים עזרה ביישום?
            </h2>
            <button
              type="button"
              onClick={() => navigate('/account#toolbox')}
              className="inline-flex items-center gap-2 rounded-full bg-[#8A6A52] px-4 py-2 text-[13px] text-white hover:opacity-90"
            >
              <Wrench className="h-4 w-4" strokeWidth={1.5} />
              קבלו הכלים לביצוע מושלם
            </button>
          </div>
          <p className="mt-2 text-[12px] leading-5 text-[#5F554C]">
            הקישור לא עובד או שהפריט אזל? העתיקו את תמונת המוצר והדביקו אותה בחיפוש לפי תמונה ב-AliExpress, כדי למצוא
            את הפריט או חלופה דומה.
          </p>
        </section>

        <section className={`${CARD} px-5 py-5`}>
          <h2 className="mb-1 flex items-center justify-center gap-2 text-xl font-medium text-[#3B302A]">
            שיתוף התוצאות שלכם
            <Upload className="h-5 w-5" strokeWidth={1.4} />
          </h2>
          <p className="mb-4 text-center text-[13px] leading-6 text-[#5F554C]">
            נשמח לראות את החדר שיצרתם! העלו תמונות לפני ואחרי ושתפו את היצירה שלכם.
          </p>
          {!photosUploaded ? (
            <div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                {[
                  { id: 'before-image', label: 'תמונה לפני', icon: Camera, file: beforeImage, setFile: setBeforeImage },
                  { id: 'after-image', label: 'תמונה אחרי', icon: Sparkles, file: afterImage, setFile: setAfterImage },
                ].map(({ id, label, icon: Icon, file, setFile }) => (
                  <div key={id}>
                    <div className="mb-1.5 flex items-center justify-center gap-1.5 text-[13px] text-[#3B302A]">
                      {label}
                      <Icon className="h-4 w-4 text-[#A89888]" strokeWidth={1.3} />
                    </div>
                    <label
                      htmlFor={id}
                      className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#D9C6B5] bg-[#FDFAF7] px-3 py-5 text-center"
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
                          <Check className="mb-2 h-6 w-6 text-[#7BA05B]" />
                          <p className="max-w-full truncate text-xs text-[#7BA05B]">{file.name}</p>
                          <p className="mt-1 text-[11px] text-[#B5B0A8]">לחצו להחלפה</p>
                        </>
                      ) : (
                        <>
                          <Upload className="mb-2 h-6 w-6 text-[#9C7E66]" strokeWidth={1.3} />
                          <p className="text-[13px] text-[#3B302A]">לחצו להעלאת תמונה</p>
                          <p className="mt-0.5 text-[11px] text-[#7A7068]">JPG, PNG עד 10MB</p>
                        </>
                      )}
                    </label>
                  </div>
                ))}
              </div>
              <label className="mb-4 flex cursor-pointer items-start gap-3 text-[12px] leading-5 text-[#4A4540]">
                <input
                  type="checkbox"
                  checked={allowSocialShare}
                  onChange={(e) => setAllowSocialShare(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#8A6A52]"
                />
                <span>
                  אנחנו מאשרים ל-PETITE DREAMS לשתף את התמונות שלנו ברשתות החברתיות ובחומרי שיווק. התמונות עשויות
                  לשמש כדוגמאות לעיצובים מוצלחים ולהשראה ללקוחות אחרים.
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
                className="w-full rounded-full bg-[#9C8068] py-3 text-sm text-white transition-opacity hover:opacity-90"
              >
                שליחת התמונות
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#FDFAF7] py-8 text-center">
              <h3 className="mb-2 text-xl font-light text-[#4A4A4A]">תודה רבה על השיתוף!</h3>
              <p className="text-sm text-[#8B8B8B]">
                {allowSocialShare
                  ? 'נשמח לשתף את היצירה היפה שלכם עם הקהילה שלנו.'
                  : 'התמונות נשמרו לצפייה אישית בלבד.'}
              </p>
            </div>
          )}
        </section>

        <section className={`${CARD} px-5 py-8 text-center`}>
          <HeartBowIcon />
          <h2 className="mb-3 text-2xl font-medium text-[#3B302A]">עד הפעם הבאה.</h2>
          <p className="mx-auto mb-2 max-w-xl text-[14px] leading-7 text-[#4A4540]">
            ילדים גדלים, טעמים משתנים, וחדרים צריכים לגדול איתם.
          </p>
          <p className="mx-auto mb-4 max-w-xl text-[14px] leading-7 text-[#4A4540]">
            נפגש כש{kids.length > 1 ? 'הילדים יגדלו' : 'הילד יגדל'} בעוד כמה שנים, כשיגיע הזמן להתאים את החדר מחדש
            בצורה מושלמת למי שהם הפכו להיות.
          </p>
          <p className="flex items-center justify-center gap-1.5 text-[15px] text-[#B49A84]">
            <Heart className="h-4 w-4" strokeWidth={1.5} />
            נזכיר לכם בזמן הנכון - פשוט המשיכו ליהנות מהחדר היפה שלכם!
          </p>
        </section>
      </main>
    </div>
  )
}
