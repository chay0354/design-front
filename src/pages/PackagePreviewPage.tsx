import { useEffect, useLayoutEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CirclePlay, Gift, Infinity as InfinityIcon, ShoppingBag, Sofa, Tag, Wallet } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkle } from '../components/BrushTitle'
import { Header } from '../components/Header'
import { ProductImage } from '../components/ProductImage'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { colorScaleDescription, displayColorScaleName } from '../data/colorScales'
import { previewRoomImage, resolveDesignPackageImagesForSelection } from '../data/designPackageImages'
import { getAgeGroup, getAgeGroupIdForAge, type CatalogGender } from '../data/packageCatalog'
import { visibleShoppingCategories, type ThemePackage } from '../data/themePackages'
import { apiFetch } from '../utils/backend'
import {
  INSTALLMENT_COUNT,
  ROOM_PACKAGE_PRICE,
  buildQuestionnaireSteps,
  formatRoomNames,
  isCrossAgeRoom,
  parseRoomsParam,
  roomDesignProfile,
  roomPackagePrice,
  type QuestionnaireChild,
} from '../utils/questionnaire'

const PLACEHOLDER = '/assets/lock-preview.png'

/** The teaser is one 3×3 collage image; each tile shows its own cell so the grid gets rounded tiles and gaps. */
function TeaserTiles({ src }: { src: string }) {
  return (
    <div className="grid grid-cols-3 gap-1.5" dir="ltr">
      {Array.from({ length: 9 }, (_, index) => (
        <div
          key={index}
          role="presentation"
          className="aspect-square rounded-lg bg-[#F3EEE8] shadow-[0_1px_3px_rgba(90,60,30,0.08)]"
          style={{
            backgroundImage: `url("${src}")`,
            backgroundSize: '300% 300%',
            backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%`,
          }}
        />
      ))}
    </div>
  )
}

function collectCollageImages(
  heroImage: string,
  galleryImages: string[],
  shoppingCategories: ThemePackage['shoppingCategories'],
): string[] {
  const seen = new Set<string>()
  const images: string[] = []
  const add = (url?: string) => {
    if (url && !seen.has(url)) {
      seen.add(url)
      images.push(url)
    }
  }
  for (const url of [heroImage, ...galleryImages]) add(url)
  for (const category of shoppingCategories) {
    for (const item of category.items) if (item.image?.startsWith('http')) add(item.image)
  }
  while (images.length < 8) images.push(PLACEHOLDER)
  return images.slice(0, 8)
}

/** Without a designed teaser: package photos around a center tile with the theme name. */
function CollageTiles({ images, theme }: { images: string[]; theme: string }) {
  const tiles: (string | null)[] = [...images.slice(0, 4), null, ...images.slice(4, 8)]
  return (
    <div className="grid grid-cols-3 gap-1.5" dir="ltr">
      {tiles.map((src, index) =>
        src === null ? (
          <div
            key="center"
            className="flex aspect-square flex-col items-center justify-center rounded-lg border border-[#EFE5DA] bg-[#FBF7F2] px-2 text-center"
            dir="rtl"
          >
            <Sparkle className="h-3 w-3 text-[#C9A27E]" />
            <p className="mt-1 text-[15px] leading-tight font-semibold text-[#2F3A4A]">{theme}</p>
            <p className="mt-1 text-[10px] text-[#8A7A6B]">טעימה מהסגנון שלכם</p>
          </div>
        ) : (
          <div key={`${src}-${index}`} className="aspect-square overflow-hidden rounded-lg bg-[#F3EEE8]">
            {src.startsWith('http') ? (
              <ProductImage src={src} alt="" className="h-full w-full object-cover" />
            ) : (
              <img src={src} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        ),
      )}
    </div>
  )
}

interface RoomCard {
  name: string
  gender: CatalogGender
  age: number
  ageLabel: string
  theme: string
  colorPreference: string
  package: ThemePackage
  index: number
}

function RoomPreview({ card }: { card: RoomCard }) {
  const { getPackageContent, getColorScaleForPreference } = useData()
  const content = getPackageContent(card.package.id)
  const colorScale = getColorScaleForPreference(card.colorPreference)
  const design = resolveDesignPackageImagesForSelection(card.gender, card.age, card.theme, colorScale.id)
  const themeName = card.theme || card.package.theme || card.package.name
  const description = colorScaleDescription(colorScale)
  const scaleName = displayColorScaleName(card.colorPreference) || colorScale.name
  const roomImage = previewRoomImage(design) || content?.heroImage || card.package.heroImage

  return (
    <section className="text-center">
      <h1 className="flex items-center justify-center gap-3 text-[26px] leading-tight font-bold text-[#2A2522] sm:text-[30px]">
        <Sparkle className="h-5 w-5 text-[#D9A06C]" />
        חבילת העיצוב של {card.name || 'הילד/ה'}
        <Sparkle className="h-5 w-5 text-[#D9A06C]" />
      </h1>
      <p className="mx-auto mt-3 inline-block rounded-full bg-[#F4E7DB] px-6 py-1.5 text-[16px] font-medium text-[#6B4A35]">
        חבילת {themeName} {card.ageLabel}
      </p>
      {card.index > 0 && <p className="mt-1.5 text-sm text-[#7BA05B]">20% הנחה על חדר נוסף</p>}
      <p className="mt-3 mb-3 text-[17px] text-[#6B4A35]">הצצה לסגנון החבילה שלכם</p>

      {design.teaser ? (
        <TeaserTiles src={design.teaser} />
      ) : roomImage ? (
        <img src={roomImage} alt={`הדמיית ${themeName}`} className="aspect-square w-full rounded-xl object-cover" />
      ) : (
        <CollageTiles
          theme={themeName}
          images={collectCollageImages(
            content?.heroImage || card.package.heroImage,
            content?.galleryImages || card.package.galleryImages,
            content?.shoppingCategories || visibleShoppingCategories(card.package.shoppingCategories),
          )}
        />
      )}

      <div className="mt-3 rounded-2xl bg-[#F4EFEA] px-4 py-3">
        <p className="text-[20px] font-bold text-[#2A2522]">{scaleName}</p>
        {description && <p className="mt-0.5 text-[13px] text-[#4A4540]">{description}</p>}
        <div className="mt-2.5 flex justify-center gap-2" dir="ltr">
          {colorScale.colors.slice(0, 6).map((color) => (
            <span
              key={`${color.roleLabel}-${color.hex}`}
              title={color.name}
              className="h-10 w-14 rounded-lg shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const FEATURES = [
  { icon: ShoppingBag, label: <>מותאם<br />לגיל<br />ולהעדפות</> },
  { icon: InfinityIcon, label: <>גישה ללא<br />הגבלת<br />זמן</> },
  { icon: CirclePlay, label: <>סרטוני<br />הדרכה<br />מקצועיים</> },
  { icon: Sofa, label: <>משתלב<br />בריהוט<br />קיים</> },
  { icon: Wallet, label: <>עיצוב<br />בתקציב<br />נגיש</> },
]

export function PackagePreviewPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { packages, findMatchingPackages, loading } = useData()
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [searchParams])

  const rooms = parseRoomsParam(searchParams.get('rooms'))
  const childName = searchParams.get('childName') || ''
  const gender = (searchParams.get('gender') as CatalogGender) || 'unisex'
  const age = parseInt(searchParams.get('age') || '5', 10)
  const theme = searchParams.get('theme') || ''
  const colorPreference = searchParams.get('colorPreference') || ''
  const wallDesignOption = searchParams.get('wallDesignOption') || ''
  const additionalChildrenParam = searchParams.get('additionalChildren')
  const additionalChildren: QuestionnaireChild[] = (() => {
    try {
      return additionalChildrenParam ? (JSON.parse(additionalChildrenParam) as QuestionnaireChild[]) : []
    } catch {
      return []
    }
  })()

  const ageLabelFor = (designAge: number, single: boolean, crossAge: boolean) => {
    if (single && !crossAge) return `לגיל ${designAge}`
    const group = getAgeGroup(getAgeGroupIdForAge(designAge))
    return `לגילאי ${group.range[0]}–${group.range[1]}`
  }

  const baseCards = rooms
    ? rooms.map((room) => {
        const profile = roomDesignProfile(room)
        return {
          name: formatRoomNames(room.children),
          gender: profile.gender,
          age: profile.age,
          ageLabel: ageLabelFor(profile.age, room.children.length === 1, isCrossAgeRoom(room)),
          theme: room.theme,
          colorPreference: room.colorPreference,
        }
      })
    : [
        { name: childName, gender, age, ageLabel: `לגיל ${age}`, theme, colorPreference },
        ...additionalChildren.map((child) => ({
          name: child.name,
          gender: child.gender,
          age: child.age,
          ageLabel: `לגיל ${child.age}`,
          theme: child.theme,
          colorPreference: child.colorPreference,
        })),
      ]

  const roomCards: RoomCard[] = baseCards
    .map((card, index) => ({
      ...card,
      index,
      package: findMatchingPackages(card.gender, card.age, card.theme, card.colorPreference)[0] || packages[0],
    }))
    .filter((card) => Boolean(card.package))

  // Prices come from the server (admin settings); the constants are only a fallback.
  const [serverTotal, setServerTotal] = useState<number | null>(null)
  const roomCount = roomCards.length
  useEffect(() => {
    if (roomCount === 0) return
    let cancelled = false
    apiFetch<{ total: number }>('/api/checkout/quote', { body: { roomCount }, auth: false })
      .then((quote) => !cancelled && setServerTotal(quote.total))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [roomCount])

  const mainPackage = roomCards[0]?.package

  if (loading || !mainPackage) {
    return (
      <div className="min-h-screen bg-[#FBF8F5]">
        <Header />
        <div className="mx-auto max-w-xl px-4 py-24 text-center text-[#8B8B8B]">טוען...</div>
      </div>
    )
  }

  const total =
    serverTotal ?? roomCards.reduce((sum, _card, index) => sum + roomPackagePrice(ROOM_PACKAGE_PRICE, index), 0)
  const monthly = Math.round(total / INSTALLMENT_COUNT)

  // Progress: every questionnaire step is done; this screen and payment remain.
  const questionnaireSteps = rooms ? buildQuestionnaireSteps(rooms).length : 6
  const currentStep = questionnaireSteps + 1
  const totalSteps = questionnaireSteps + 2
  const percent = Math.round((currentStep / totalSteps) * 100)

  const handlePurchase = () => {
    const queryParams = rooms
      ? new URLSearchParams({ rooms: JSON.stringify(rooms) })
      : new URLSearchParams({
          childName,
          childAge: age.toString(),
          gender,
          theme,
          colorPreference,
          wallDesignOption,
          additionalChildren: JSON.stringify(additionalChildren),
        })

    if (!user) {
      sessionStorage.setItem('intended_package', mainPackage.id)
      sessionStorage.setItem('intended_checkout_query', queryParams.toString())
      navigate('/login')
    } else {
      navigate(`/checkout/${mainPackage.id}?${queryParams.toString()}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F1EC]">
      <Header />

      <main className="mx-auto max-w-xl px-3 py-4 sm:py-8">
        <div className="rounded-[28px] border border-[#EFE6DD] bg-[#FDFBF9] px-3 pt-4 pb-5 shadow-[0_10px_40px_rgba(110,80,50,0.08)] sm:px-6">
          <div className="mb-1.5 flex items-center justify-between px-2 text-sm font-medium text-[#3C3530]">
            <span>
              {currentStep} מתוך {totalSteps}
            </span>
            <span dir="ltr">{percent}%</span>
          </div>
          <div
            className="mx-2 mb-4 h-2 overflow-hidden rounded-full bg-[#F1E4D8]"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-gradient-to-l from-[#E7C3A0] to-[#C99A6E]" style={{ width: `${percent}%` }} />
          </div>

          <div className="rounded-3xl border border-[#F1E9E1] bg-white/60 px-3 py-4 sm:px-5">
            <div className="space-y-10">
              {roomCards.map((card) => (
                <RoomPreview key={`${card.name}-${card.index}`} card={card} />
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-stretch gap-4 rounded-2xl bg-[#F8EEE5] px-4 py-4">
            <div className="flex-1 text-center">
              <h2 className="text-[#2A2522]">
                <span className="block text-[16px] leading-snug font-medium sm:text-[18px]">העיצוב כבר מוכן.</span>
                <span className="mt-1 block text-[20px] leading-snug font-bold sm:text-[22px]">
                  כל שנותר הוא להכניס אותו לחדר.
                </span>
              </h2>
              <p className="mt-3 text-[13.5px] leading-6 text-[#3C3530]">
                חבילת עיצוב מקצועית הכוללת הדמיות של חדר מעוצב, שילובי צבעים, מבחר פריטי עיצוב ודקורציה שנבחרו בקפידה עם
                קישורים ישירים לרכישה מאתרי אונליין בחו״ל במחירים נגישים, והנחיות ליישום העיצוב אצלכם בבית.
              </p>
              <p className="mt-2 text-[13.5px] leading-6 text-[#B07A50]">
                בלי שעות של חיפושים, בלי התלבטויות ובלי פערי תיווך.
              </p>
            </div>
            <span className="w-px shrink-0 bg-[#D9BFA8]" aria-hidden="true" />
            <span className="flex shrink-0 items-center">
              <Gift className="h-14 w-14 text-[#B07A50]" strokeWidth={1.2} />
            </span>
          </div>

          <div className="mt-3 grid grid-cols-5 rounded-2xl border border-[#F1E9E1] bg-white px-1 py-4">
            {FEATURES.map(({ icon: Icon, label }, index) => (
              <div key={index} className={`px-1 text-center ${index > 0 ? 'border-s border-[#EADFD4]' : ''}`}>
                <Icon className="mx-auto mb-1.5 h-7 w-7 text-[#B07A50]" strokeWidth={1.4} />
                <p className="text-[11px] leading-[1.25] text-[#3C3530] sm:text-[12px]">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#FAF1EA] px-4 py-3">
            <p className="flex-1 text-center text-[13px] leading-6 text-[#3C3530]">
              פריטי העיצוב והריהוט המוצגים אינם כלולים במחיר החבילה ונרכשים ישירות מאתרי אונליין בחו״ל, בהתאם לבחירתכם
              ולתקציב שלכם.
            </p>
            <Tag className="h-7 w-7 shrink-0 text-[#B07A50]" strokeWidth={1.4} />
          </div>

          <button
            type="button"
            onClick={handlePurchase}
            className="mt-3 block w-full rounded-2xl bg-gradient-to-l from-[#D2A57C] via-[#BE8C61] to-[#A9774F] px-4 py-3 text-center text-white shadow-[0_8px_20px_rgba(150,100,60,0.3)] transition-transform hover:scale-[1.01]"
          >
            <span className="block text-[15px] text-white/90">
              {roomCards.length > 1 ? `לפתיחת ${roomCards.length} החבילות שלכם` : 'לפתיחת החבילה שלכם'}
            </span>
            <span className="mt-1 flex items-center justify-center gap-2 sm:gap-3">
              <span className="text-[24px] leading-none font-bold whitespace-nowrap sm:text-[30px]">{monthly} ש״ח בלבד</span>
              <span className="h-7 w-px bg-white/50" aria-hidden="true" />
              <span className="flex gap-1.5 text-[15px] whitespace-nowrap sm:text-[17px]" dir="ltr">
                <span>{INSTALLMENT_COUNT} X</span>
                <span>חודשים</span>
              </span>
            </span>
            <span className="mx-auto mt-2 block w-fit rounded-full bg-[#FDF8F3] px-6 py-1 text-[15px] font-semibold text-[#3C3530]">
              או {total} ש״ח בתשלום אחד
            </span>
          </button>

          <div className="mt-4 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => navigate('/questionnaire')}
              className="inline-flex items-center gap-2 text-[17px] text-[#2A2522] hover:text-[#6B4A35]"
            >
              <ArrowRight className="h-5 w-5" />
              חזור
            </button>
            <button
              type="button"
              onClick={handlePurchase}
              className="inline-flex items-center gap-3 rounded-2xl bg-[#D6A47A] px-8 py-2.5 text-[17px] text-white shadow-[0_4px_12px_rgba(150,100,60,0.25)] hover:bg-[#C7956B]"
            >
              הבא
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
