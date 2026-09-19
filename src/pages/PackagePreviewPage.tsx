import type { ReactNode } from 'react'
import { Armchair, ArrowLeft, Baby, CheckCircle2, Lock, Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { ProductImage } from '../components/ProductImage'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { resolveDesignPackageImagesForSelection } from '../data/designPackageImages'
import {
  getAgeGroup,
  getAgeGroupIdForAge,
  type CatalogGender,
} from '../data/packageCatalog'
import type { ThemePackage } from '../data/themePackages'
import {
  type QuestionnaireChild,
} from '../utils/questionnaire'

const PLACEHOLDER = '/assets/lock-preview.png'
const balloonIcon = '/assets/balloon-icon.svg'

/** Soft painted stroke sitting behind a heading, as in the design. */
function BrushHeading({
  children,
  className = '',
  padding = 'px-6',
  fill = '#F3E5DA',
}: {
  children: ReactNode
  className?: string
  padding?: string
  fill?: string
}) {
  return (
    <span className={`relative inline-block max-w-full ${padding} py-1`}>
      <svg
        viewBox="0 0 400 64"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[8%] h-[76%] w-full"
      >
        <path
          d="M7 33C9 19 26 12 58 9c34-3 78-4 126-4 46 0 96 2 140 6 30 3 55 8 66 15 9 6 8 14-3 20-13 7-38 12-71 15-44 4-95 5-142 4-45-1-88-3-120-7C22 55 5 47 7 33Z"
          fill={fill}
        />
      </svg>
      <span className={`relative z-10 block ${className}`}>{children}</span>
    </span>
  )
}

function CollageTile({ src }: { src: string }) {
  return (
    <div className="aspect-square overflow-hidden rounded-xl bg-[#F7F4F0]">
      {src.startsWith('http') ? (
        <ProductImage src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <img src={src} alt="" className="h-full w-full object-cover" />
      )}
    </div>
  )
}

function TeaserGrid({ src }: { src: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-2.5" dir="ltr">
      {Array.from({ length: 9 }, (_, index) => {
        const col = index % 3
        const row = Math.floor(index / 3)
        return (
          <div key={index} className="aspect-square overflow-hidden rounded-xl bg-[#F7F4F0]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: '300% 300%',
                backgroundPosition: `${col * 50}% ${row * 50}%`,
              }}
            />
          </div>
        )
      })}
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

  for (const url of [heroImage, ...galleryImages]) {
    if (url && !seen.has(url)) {
      seen.add(url)
      images.push(url)
    }
  }

  for (const category of shoppingCategories) {
    for (const item of category.items) {
      if (item.image && item.image.startsWith('http') && !seen.has(item.image)) {
        seen.add(item.image)
        images.push(item.image)
      }
    }
  }

  while (images.length < 9) {
    images.push(PLACEHOLDER)
  }

  return images.slice(0, 9)
}

function ChildPackageCard({
  childName,
  gender,
  age,
  theme,
  colorPreference,
  pkg,
  price,
  originalPrice,
  discountLabel,
  onPurchase,
  purchaseLabel,
}: {
  childName: string
  gender: CatalogGender
  age: number
  theme: string
  colorPreference: string
  pkg: ThemePackage
  price: number
  originalPrice?: number
  discountLabel?: string
  onPurchase: () => void
  purchaseLabel: string
}) {
  const navigate = useNavigate()
  const { getPackageContent, getColorScaleForPreference } = useData()
  const content = getPackageContent(pkg.id)
  const colorScale = getColorScaleForPreference(colorPreference)
  const design = resolveDesignPackageImagesForSelection(gender, age, theme, colorScale.id)
  const collage = collectCollageImages(
    content?.heroImage || pkg.heroImage,
    content?.galleryImages || pkg.galleryImages,
    content?.shoppingCategories || pkg.shoppingCategories,
  )
  const ageGroup = getAgeGroup(getAgeGroupIdForAge(age))
  const packageTitle = theme ? `חבילת ${theme}` : pkg.theme ? `חבילת ${pkg.theme}` : pkg.name
  const styleDescription =
    'כאן תמצאו סקירה מלאה המותאמת לגיל, להעדפות ולסגנון שלכם. הקונספט העיצובי, כיוון הצבעים והנחיות הסטיילינג נבנו במיוחד כדי ליצור חדר חמים, רגוע ומלא קסם עבור ילדכם.'

  const preview = design.teaser ? (
    <TeaserGrid src={design.teaser} />
  ) : (
    <div className="grid grid-cols-3 gap-2 sm:gap-2.5" dir="ltr">
      {collage.map((src, index) => (
        <CollageTile key={`${src}-${index}`} src={src} />
      ))}
    </div>
  )

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:grid-rows-[1fr_auto] lg:items-stretch lg:gap-x-16 lg:gap-y-4">
      <div className="order-2 flex h-full flex-col font-[family-name:var(--font-family)] lg:order-1 lg:row-start-1">
        <div className="mb-6 text-center">
          <BrushHeading padding="px-7">
            <h2 className="text-[30px] font-light leading-[1.25] tracking-tight text-[#4A4A4A] sm:text-[34px]">
              חבילת העיצוב של {childName || 'הילד/ה'}
            </h2>
          </BrushHeading>
          {discountLabel && <p className="mt-2 text-sm text-[#7BA05B]">{discountLabel}</p>}
          <p className="mt-3 flex items-center justify-center gap-2 text-[13px] font-light text-[#7C736B]">
            <Plus className="h-3 w-3 text-[#C4B8A8]" strokeWidth={1.5} />
            {packageTitle} לגילאי {ageGroup.range[0]}–{ageGroup.range[1]}
            <Plus className="h-3 w-3 text-[#C4B8A8]" strokeWidth={1.5} />
          </p>
        </div>

        <div className="mb-4 rounded-[16px] bg-[#ECE1D9] px-4 py-5">
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-0">
            <div className="text-center sm:px-4">
              <p className="text-[11px] font-light text-[#9A8A7C]">סקלת הגוונים שנבחרה</p>
              <BrushHeading padding="px-5" className="mt-1" fill="#E1D2C4">
                <span className="text-[17px] font-normal text-[#4A4A4A]">{colorScale.name}</span>
              </BrushHeading>
              <div className="mt-4 flex items-stretch justify-center gap-1.5">
                {colorScale.colors.map((color) => (
                  <div
                    key={`${color.roleLabel}-${color.hex}`}
                    className="h-[70px] w-8 rounded-[9px]"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="sm:border-s sm:border-[#DCCFC4] sm:px-4">
              <BrushHeading padding="px-4" fill="#E1D2C4">
                <span className="text-[15px] font-normal text-[#4A4A4A]">הצעה לסגנון שנבחר עבורכם</span>
              </BrushHeading>
              <div className="mt-3 flex items-center gap-3">
                <p className="text-[11px] font-light leading-[1.9] text-[#8B7F74]">{styleDescription}</p>
                <img src={balloonIcon} alt="" className="h-14 w-14 shrink-0 object-contain" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-[14px] border border-[#EDE7E1] bg-[#FBF7F4] px-2 py-5">
          <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-y-0">
            {[
              {
                icon: Baby,
                title: 'סטיילינג בלבד',
                text: 'חבילת העיצוב כוללת קונספט והנחיות סטיילינג בלבד, אינה כוללת פריטים עצמם או תכנון העמדה.',
              },
              {
                icon: Armchair,
                title: 'מתלבש על ריהוט קיים',
                text: 'מיועד לריהוט בסיס קיים בבית, עם המלצות לריהוט כבד באזור האישי.',
              },
              {
                icon: CheckCircle2,
                title: 'קל ליישום',
                text: 'הנחיות סטיילינג פשוטות שמסתגלות לריהוט קיים ומשדרגות כל חדר.',
              },
              {
                icon: Lock,
                title: 'מותאם גיל והעדפות',
                text: 'הקונספט נבנה בהתאמה לגיל הילד, להעדפותיו ולסגנון המשפחה.',
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <div
                key={title}
                className={`px-3 text-center ${index > 0 ? 'sm:border-s sm:border-[#EDE7E1]' : ''}`}
              >
                <Icon className="mx-auto mb-3 h-7 w-7 text-[#99856D]" strokeWidth={1.1} />
                <p className="mb-1.5 text-[12px] text-[#4A4A4A]">{title}</p>
                <p className="text-[10px] font-light leading-[1.7] text-[#9A9088]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/questionnaire')}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#E7E0D8] bg-white px-3.5 py-2 text-[11px] font-light text-[#9A9088] transition-colors hover:text-[#4A4A4A]"
          >
            חזרה
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onPurchase}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#6E6858] px-4 py-3 text-[15px] font-light text-white transition-colors hover:bg-[#5C5748]"
          >
            {purchaseLabel}
            <Lock className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <div className="flex shrink-0 items-baseline gap-2">
            {originalPrice && originalPrice > price && (
              <span className="text-sm font-light text-[#B5B0A8] line-through">₪{originalPrice}</span>
            )}
            <span className="text-[30px] font-light tracking-tight text-[#4A4A4A]">₪{price}</span>
          </div>
        </div>
      </div>

      <div className="order-1 lg:order-2 lg:row-start-1">
        {preview}
      </div>

      <p className="order-3 mt-0 flex items-start gap-2 text-xs leading-6 text-[#B5B0A8] lg:col-start-2 lg:row-start-2">
        <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
        הצצה לחבילה והסגנון העיצובי הנבחר — כל הפרטים המלאים, הקישורים וההמלצות מחכים לכם לאחר הרכישה באזור האישי.
      </p>
    </div>
  )
}

export function PackagePreviewPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { packages, findMatchingPackages, loading } = useData()

  const childName = searchParams.get('childName') || ''
  const gender = (searchParams.get('gender') as 'boy' | 'girl' | 'unisex') || 'unisex'
  const age = parseInt(searchParams.get('age') || '5', 10)
  const theme = searchParams.get('theme') || ''
  const colorPreference = searchParams.get('colorPreference') || ''
  const wallDesignOption = searchParams.get('wallDesignOption') || ''
  const additionalChildrenParam = searchParams.get('additionalChildren')
  const additionalChildren: QuestionnaireChild[] = additionalChildrenParam
    ? (JSON.parse(additionalChildrenParam) as QuestionnaireChild[])
    : []

  const recommendedPackages = findMatchingPackages(gender, age, theme, colorPreference)
  const mainPackage = recommendedPackages[0] || packages[0]

  const additionalPackagesDetails = additionalChildren.map((child) => {
    const childPackages = findMatchingPackages(
      child.gender,
      child.age,
      child.theme,
      child.colorPreference,
    )
    return { child, package: childPackages[0] || packages[0] }
  })

  if (loading || !mainPackage) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-6xl px-4 py-24 text-center text-[#8B8B8B]">טוען...</div>
      </div>
    )
  }

  const handlePurchase = () => {
    const queryParams = new URLSearchParams({
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

  const grandTotal =
    mainPackage.price +
    additionalPackagesDetails.reduce(
      (sum, item) => sum + Math.round(item.package.price * 0.8),
      0,
    )

  const totalSavings = additionalPackagesDetails.reduce(
    (sum, item) => sum + Math.round(item.package.price * 0.2),
    0,
  )

  const purchaseLabel = 'לרכישה מיידית'

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-16">
          <ChildPackageCard
            childName={childName}
            gender={gender}
            age={age}
            theme={theme}
            colorPreference={colorPreference}
            pkg={mainPackage}
            price={mainPackage.price}
            onPurchase={handlePurchase}
            purchaseLabel={purchaseLabel}
          />

          {additionalPackagesDetails.map((item, index) => (
            <ChildPackageCard
              key={`${item.child.name}-${index}`}
              childName={item.child.name}
              gender={item.child.gender}
              age={item.child.age}
              theme={item.child.theme}
              colorPreference={item.child.colorPreference}
              pkg={item.package}
              price={Math.round(item.package.price * 0.8)}
              originalPrice={item.package.price}
              discountLabel="הנחת אחים 20%"
              onPurchase={handlePurchase}
              purchaseLabel={purchaseLabel}
            />
          ))}
        </div>

        {additionalChildren.length > 0 && (
          <div className="mt-16 border-t border-[#F0EBE4] pt-10 text-center">
            {additionalPackagesDetails.map((item) => (
              <p key={item.child.name} className="mb-2 text-sm text-[#8B8B8B]">
                חבילת {item.child.name} · ₪{Math.round(item.package.price * 0.8)}
              </p>
            ))}
            {totalSavings > 0 && (
              <p className="mb-4 text-sm text-[#7BA05B]">חסכתם ₪{totalSavings} בהנחת אחים</p>
            )}
            <p className="text-2xl font-light text-[#4A4A4A]">סה״כ ₪{grandTotal}</p>
          </div>
        )}
      </div>
    </div>
  )
}
