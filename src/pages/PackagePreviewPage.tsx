import { useLayoutEffect } from 'react'
import { Armchair, ArrowLeft, CheckCircle2, Lock, createLucideIcon } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BrushMark, Sparkle } from '../components/BrushTitle'
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

const Rug = createLucideIcon('rug', [
  ['rect', { x: '4', y: '7', width: '16', height: '10', rx: '0.8' }],
  ['path', { d: 'M7 7v10M17 7v10' }],
  ['path', { d: 'M12 9.5 14.5 12 12 14.5 9.5 12z' }],
  ['path', { d: 'M4 8.5H2M4 10.5H2M4 12.5H2M4 14.5H2M4 16H2' }],
  ['path', { d: 'M20 8.5h2M20 10.5h2M20 12.5h2M20 14.5h2M20 16h2' }],
])

const PLACEHOLDER = '/assets/lock-preview.png'
const giftIcon = '/assets/gift-icon.png'

function CollageTile({ src }: { src: string }) {
  return (
    <div className="aspect-square overflow-hidden bg-[#F7F4F0]">
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
    <img
      src={src}
      alt=""
      className="aspect-square w-full object-cover lg:object-contain max-lg:h-[46svh] max-lg:aspect-auto"
    />
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
    'כאן תמצאו סקיצה מלאה המותאמת לגיל, להעדפות ולסגנון שלכם. הקונספט העיצובי, כיוון העיצוב והנחיות הסטיילינג נבנו במיוחד כדי ליצור חדר חמים, רגוע ומלא קסם עבור ילדכם.'

  const preview = design.teaser ? (
    <TeaserGrid src={design.teaser} />
  ) : (
    <div className="grid grid-cols-3 gap-1" dir="ltr">
      {collage.map((src, index) => (
        <CollageTile key={`${src}-${index}`} src={src} />
      ))}
    </div>
  )

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-x-16 lg:gap-y-4">
      <div className="order-2 flex flex-col justify-between gap-5 font-[family-name:var(--font-family)] lg:order-1 lg:row-span-2 lg:h-full">
        <div className="text-center">
          <h2 className="whitespace-nowrap text-[28px] font-normal leading-tight tracking-tight text-[#2F2B28] sm:text-[34px]">
            <BrushMark className="px-8">חבילת העיצוב של {childName || 'הילד/ה'}</BrushMark>
          </h2>
          {discountLabel && <p className="mt-2 text-sm text-[#7BA05B]">{discountLabel}</p>}
          <p className="mt-3 flex items-center justify-center gap-2.5 text-[16px] text-[#3C3834]">
            <Sparkle className="h-3 w-3 text-[#C9A991]" />
            {packageTitle} לגילאי {ageGroup.range[0]}–{ageGroup.range[1]}
            <Sparkle className="h-3 w-3 text-[#C9A991]" />
          </p>
        </div>

        <div className="rounded-[14px] bg-[#EFE6DE] px-4 py-4">
          <div className="grid items-start gap-4 sm:grid-cols-2 sm:gap-4">
            <div className="flex flex-col items-center justify-center rounded-xl bg-white px-3 py-4 text-center">
              <p className="text-[13px] text-[#5A544E]">סקלת הגוונים שנבחרה</p>
              <p className="text-[22px] leading-tight text-[#2F2B28]">{colorScale.name}</p>
              <div className="mt-3 flex items-end justify-center gap-2">
                {colorScale.colors.slice(0, 6).map((color) => (
                  <div
                    key={`${color.roleLabel}-${color.hex}`}
                    className="h-[64px] w-[26px] rounded-[10px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="pt-1">
              <p className="mb-3 whitespace-nowrap text-center text-[15px] text-[#2F2B28]">
                <BrushMark className="px-4">הצצה לסגנון שנבחר עבורכם</BrushMark>
              </p>
              <div className="flex items-start gap-3">
                <p className="min-w-0 flex-1 text-[12.5px] leading-6 text-[#4A4540]">{styleDescription}</p>
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F6F0EA]">
                  <img src={giftIcon} alt="" className="h-10 w-10 object-contain" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#D9D2CB] bg-white px-1 py-5">
          <div className="grid grid-cols-2 gap-y-5 sm:grid-cols-4">
            {[
              {
                icon: Rug,
                title: 'סטיילינג בלבד',
                text: 'חבילת העיצוב כוללת קונספט והנחיות סטיילינג בלבד. אינה כוללת פריטים עצמם או תכנון העמדה.',
              },
              {
                icon: Armchair,
                title: 'מתלבש על ריהוט קיים',
                text: 'מיועד לריהוט בסיסי קיים בבית, עם המלצות לריהוט כבד באזור האישי.',
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
                className={`px-3 text-center ${index > 0 ? 'sm:border-s sm:border-[#EFE8E1]' : ''}`}
              >
                <Icon className="mx-auto mb-2.5 h-9 w-9 text-[#A27A5C]" strokeWidth={1.2} />
                <p className="mb-1.5 text-[14px] font-medium text-[#2F2B28]">{title}</p>
                <p className="text-[12px] leading-6 text-[#5A544E]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/questionnaire')}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-[#E7DCD2] bg-white px-4 py-2 text-[12px] text-[#5A544E] hover:text-[#2F2B28]"
          >
            חזרה
            <ArrowLeft className="h-3.5 w-3.5 text-[#A27A5C]" />
          </button>
          <button
            type="button"
            onClick={onPurchase}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-[#6E6758] px-4 py-3 text-[17px] text-white hover:bg-[#5A5548] sm:mx-6"
          >
            <Lock className="h-5 w-5" strokeWidth={1.5} />
            {purchaseLabel}
          </button>
          <div className="flex shrink-0 items-baseline gap-1.5">
            {originalPrice && originalPrice > price && (
              <span className="text-sm font-light text-[#B5B0A8] line-through">{originalPrice}₪</span>
            )}
            <span className="text-[30px] tracking-tight text-[#1F1C1A]">{price}₪</span>
          </div>
        </div>
      </div>

      <div className="order-1 lg:order-2 lg:self-start">
        {preview}
      </div>

      <p className="order-3 flex items-center gap-3 text-[13px] leading-6 text-[#3C3834] lg:order-2 lg:self-end">
        הצצה לחבילה והסגנון העיצובי הנבחר – כל הפרטים המלאים, הקישורים וההמלצות מחכים לכם לאחר הרכישה באזור האישי.
        <Lock className="h-7 w-7 flex-shrink-0 text-[#A27A5C]" strokeWidth={1.2} />
      </p>
    </div>
  )
}

export function PackagePreviewPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { packages, findMatchingPackages, loading } = useData()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [searchParams])

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
  const installmentCount = 6
  const monthlyPayment = Math.round(grandTotal / installmentCount)

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
            <p className="text-2xl font-light text-[#4A4A4A]">
              סה״כ {monthlyPayment} ש״ח - לחודש ל-{installmentCount} תשלומים
            </p>
            <p className="mt-2 text-base text-[#8B8B8B]">או {grandTotal} בתשלום 1</p>
          </div>
        )}
      </div>
    </div>
  )
}
