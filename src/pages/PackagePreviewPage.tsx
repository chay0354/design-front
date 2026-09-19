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
    'כאן תמצאו סקירה מלאה המותאמת לגיל, להעדפות ולסגנון שבחרתם. הקונספט, כיוון הצבעים והנחיות הסטיילינג נבנו כדי ליצור חדר חמים ורגוע.'

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
      <div className="order-2 flex flex-col justify-between font-[family-name:var(--font-family)] lg:order-1 lg:row-start-1 lg:min-h-0">
        <div className="text-center">
          <BrushHeading padding="px-8">
            <h2 className="whitespace-nowrap text-[28px] font-light leading-none tracking-tight text-[#4A4A4A] sm:text-[32px]">
              חבילת העיצוב של {childName || 'הילד/ה'}
            </h2>
          </BrushHeading>
          {discountLabel && <p className="mt-2 text-sm text-[#7BA05B]">{discountLabel}</p>}
          <p className="mt-2.5 flex items-center justify-center gap-2 text-[12px] font-light text-[#8A8178]">
            <Plus className="h-3 w-3 text-[#C4B8A8]" strokeWidth={1.5} />
            {packageTitle} לגילאי {ageGroup.range[0]}–{ageGroup.range[1]}
            <Plus className="h-3 w-3 text-[#C4B8A8]" strokeWidth={1.5} />
          </p>
        </div>

        <div className="rounded-[18px] bg-[#EDE4DC] px-4 py-4">
          <div className="grid items-start gap-4 sm:grid-cols-[1.05fr_0.95fr] sm:gap-5">
            <div className="text-center">
              <p className="text-[11px] font-light text-[#9A8A7C]">סקלת הגוונים שנבחרה</p>
              <BrushHeading padding="px-4" fill="#E0D2C4">
                <span className="text-[16px] font-light text-[#4A4A4A]">{colorScale.name}</span>
              </BrushHeading>
              <div className="mt-3 flex items-end justify-center gap-1.5">
                {colorScale.colors.slice(0, 6).map((color) => (
                  <div
                    key={`${color.roleLabel}-${color.hex}`}
                    className="h-16 w-[22px] rounded-[10px]"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="sm:border-s sm:border-[#D8CBBF] sm:ps-5">
              <div className="mb-2 flex items-start gap-2.5">
                <div className="min-w-0 flex-1">
                  <BrushHeading padding="px-3" fill="#E0D2C4">
                    <span className="text-[14px] font-light leading-6 text-[#4A4A4A]">
                      הצעה לסגנון שנבחר עבורכם
                    </span>
                  </BrushHeading>
                </div>
                <img src={balloonIcon} alt="" className="mt-0.5 h-10 w-10 shrink-0 object-contain" />
              </div>
              <p className="text-[11px] font-light leading-5 text-[#8B7F74]">{styleDescription}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#EFE8E1] bg-white px-1 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[
              { icon: Baby, title: 'סטיילינג בלבד', text: 'קונספט והנחיות סטיילינג, בלי להחליף ריהוט.' },
              { icon: Armchair, title: 'מתלבש על ריהוט קיים', text: 'מיועד לחדר שכבר יש בו ריהוט בסיס.' },
              { icon: CheckCircle2, title: 'קל ליישום', text: 'שלבים פשוטים שאפשר ליישם מיד.' },
              { icon: Lock, title: 'מותאם גיל והעדפות', text: 'נבנה לפי הגיל, הנושא והצבעים שבחרתם.' },
            ].map(({ icon: Icon, title, text }, index) => (
              <div
                key={title}
                className={`px-2.5 text-center ${index > 0 ? 'sm:border-s sm:border-[#EFE8E1]' : ''}`}
              >
                <Icon className="mx-auto mb-2 h-6 w-6 text-[#A89888]" strokeWidth={1.15} />
                <p className="mb-1 text-[12px] font-light text-[#4A4A4A]">{title}</p>
                <p className="text-[10px] font-light leading-4 text-[#9A9088]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/questionnaire')}
            className="inline-flex shrink-0 items-center justify-center gap-1 rounded-md border border-[#E7E0D8] bg-white px-3 py-2 text-[11px] font-light text-[#9A9088] hover:text-[#4A4A4A]"
          >
            חזרה
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onPurchase}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-[#6B6556] px-4 py-2.5 text-[14px] font-light text-white hover:bg-[#5A5548]"
          >
            {purchaseLabel}
            <Lock className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <div className="flex shrink-0 items-baseline gap-1.5">
            {originalPrice && originalPrice > price && (
              <span className="text-sm font-light text-[#B5B0A8] line-through">₪{originalPrice}</span>
            )}
            <span className="text-[28px] font-light tracking-tight text-[#4A4A4A]">₪{price}</span>
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
