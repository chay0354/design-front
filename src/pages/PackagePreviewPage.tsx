import { Armchair, Baby, Check, ChevronRight, Lock, Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { ProductImage } from '../components/ProductImage'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import type { ThemePackage } from '../data/themePackages'
import {
  type QuestionnaireChild,
} from '../utils/questionnaire'

const PLACEHOLDER = '/assets/lock-preview.png'

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
  const collage = collectCollageImages(
    content?.heroImage || pkg.heroImage,
    content?.galleryImages || pkg.galleryImages,
    content?.shoppingCategories || pkg.shoppingCategories,
  )

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {collage.map((src, index) => (
            <div key={`${src}-${index}`} className="aspect-square overflow-hidden rounded-xl bg-[#F7F4F0]">
              {src.startsWith('http') ? (
                <ProductImage src={src} alt="" className="h-full w-full object-cover" />
              ) : (
                <img src={src} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs leading-6 text-[#B5B0A8]">
          <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
          ההדמיה והפריטים המלאים נפתחים לאחר הרכישה — הקולאז מציג את הכיוון העיצובי.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-3xl font-light text-[#4A4A4A] sm:text-4xl">
          חבילת העיצוב של {childName || 'הילד/ה'}
        </h2>
        {discountLabel && (
          <p className="mb-2 text-sm text-[#7BA05B]">{discountLabel}</p>
        )}
        <p className="mb-10 flex items-center justify-center gap-2 text-sm text-[#8B8B8B] lg:justify-start">
          <Plus className="h-4 w-4 text-[#C4B8A8]" strokeWidth={1.5} />
          {pkg.name} לגילאי {pkg.ageRange[0]}–{pkg.ageRange[1]}
          {theme ? ` · ${theme}` : ''}
          <Plus className="h-4 w-4 text-[#C4B8A8]" strokeWidth={1.5} />
        </p>

        <div className="mb-10 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-sm text-[#4A4A4A]">פלטת {colorScale.name}</p>
            <div className="flex flex-wrap gap-2">
              {colorScale.colors.map((color) => (
                <div
                  key={`${color.roleLabel}-${color.hex}`}
                  className="h-7 w-7 rounded-full border border-[#EDE8E1]"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm text-[#4A4A4A]">הכיוון העיצובי</p>
            <p className="text-sm leading-7 text-[#8B8B8B]">
              {pkg.description}
              {age ? ` מותאם לגיל ${age}.` : ''}
            </p>
          </div>
        </div>

        <div className="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { icon: Baby, title: 'סטיילינג בלבד', text: 'בלי להחליף רהיטים כבדים' },
            { icon: Armchair, title: 'ריהוט קיים', text: 'מתאים לחדר שכבר יש' },
            { icon: Check, title: 'קל ליישום', text: 'שלבים פשוטים אחרי הרכישה' },
            { icon: Lock, title: 'מותאם לגיל', text: 'נפתח במלואו אחרי התשלום' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="text-center">
              <Icon className="mx-auto mb-3 h-6 w-6 text-[#C4B8A8]" strokeWidth={1.25} />
              <p className="mb-1 text-sm text-[#4A4A4A]">{title}</p>
              <p className="text-xs leading-5 text-[#8B8B8B]">{text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-baseline gap-2">
            {originalPrice && originalPrice > price && (
              <span className="text-lg text-[#B5B0A8] line-through">₪{originalPrice}</span>
            )}
            <span className="text-3xl font-light text-[#4A4A4A]">₪{price}</span>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/questionnaire')}
              className="inline-flex items-center justify-center gap-1 rounded-full border border-[#E4DDD3] px-6 py-2.5 text-sm text-[#8B8B8B] hover:text-[#4A4A4A]"
            >
              <ChevronRight className="h-4 w-4" />
              חזרה
            </button>
            <button
              type="button"
              onClick={onPurchase}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3F3A36] px-7 py-2.5 text-sm text-white hover:bg-[#2F2B28]"
            >
              <Lock className="h-3.5 w-3.5" />
              {purchaseLabel}
            </button>
          </div>
        </div>
      </div>
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

  const purchaseLabel = user ? 'המשיכי לרכישה' : 'התחברי לרכישה'

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-16">
          <ChildPackageCard
            childName={childName}
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
