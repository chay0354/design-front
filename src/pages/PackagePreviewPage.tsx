import { Lock, Sparkles } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import type { ThemePackage } from '../data/themePackages'
import {
  genderLabel,
  getColorPaletteFromName,
  type QuestionnaireChild,
  wallDesignLabel,
} from '../utils/questionnaire'
import { getBasePackageId } from '../utils/packageVariants'

const lockPreviewImage = '/assets/lock-preview.png'
const starIcon = '/assets/star-icon.png'

function packageEmoji(pkg: ThemePackage) {
  const baseId = getBasePackageId(pkg)
  if (baseId === 'animals') return '🦁'
  if (baseId === 'adventures') return '⛺'
  if (baseId === 'sea-ships') return '🚢'
  if (baseId === 'transport') return '🚗'
  return '✨'
}

function ChildPackageCard({
  childName,
  age,
  gender,
  theme,
  colorPreference,
  wallDesignOption,
  pkg,
  price,
  originalPrice,
  discountLabel,
}: {
  childName: string
  age: number
  gender: string
  theme: string
  colorPreference: string
  wallDesignOption: string
  pkg: ThemePackage
  price: number
  originalPrice?: number
  discountLabel?: string
}) {
  const selectedColors = getColorPaletteFromName(colorPreference)

  return (
    <div className="overflow-hidden rounded-sm border border-[#E8DED2] bg-white shadow-sm">
      <div
        className={`border-b px-6 py-4 sm:px-8 ${
          discountLabel ? 'border-[#D4E7D4] bg-[#F0F8F0]' : 'border-[#E8DED2] bg-[#F9F7F4]'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-light text-[#4A4A4A] sm:text-2xl">
            חבילת העיצוב של {childName}
          </h3>
          {discountLabel && (
            <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[#7BA05B]">
              {discountLabel}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          {genderLabel(gender)} • גיל {age} • {theme}
        </p>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-2 sm:gap-8 sm:p-8">
        <div className="relative aspect-square overflow-hidden rounded-sm">
          <img
            src={lockPreviewImage}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-md">
            <div className="rounded-sm bg-white/80 px-6 py-4 text-center">
              <Lock className="mx-auto mb-3 h-12 w-12 text-[#C8B6A6]" />
              <p className="text-sm font-normal text-[#4A4A4A] sm:text-base">
                ההדמיה המלאה תיפתח לאחר הרכישה
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <h4 className="mb-4 font-normal text-[#4A4A4A]">הבחירות מהשאלון</h4>
          <div className="mb-4 space-y-4 text-sm">
            <div>
              <p className="mb-1 text-[#6B6B6B]">נושא</p>
              <p className="text-lg text-[#4A4A4A]">{theme}</p>
            </div>
            <div>
              <p className="mb-2 text-[#6B6B6B]">פלטת גוונים</p>
              <div className="flex flex-wrap items-center gap-2">
                {selectedColors.map((color) => (
                  <div
                    key={color}
                    className="h-8 w-8 rounded-full border border-[#E8DED2]"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <span className="text-[#4A4A4A]">{colorPreference}</span>
              </div>
            </div>
            <div>
              <p className="mb-1 text-[#6B6B6B]">קיר מרכזי</p>
              <p className="text-[#4A4A4A]">{wallDesignLabel(wallDesignOption)}</p>
            </div>
          </div>

          <div className="mt-auto border-t border-[#E8DED2] pt-4">
            <p className="text-sm text-[#6B6B6B]">{pkg.name}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-2xl font-light text-[#4A4A4A] sm:text-3xl">₪{price}</p>
              {originalPrice && originalPrice > price && (
                <p className="text-base text-[#8B8B8B] line-through">₪{originalPrice}</p>
              )}
            </div>
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
      <div className="min-h-screen bg-[#FDFCFB]">
        <Header />
        <div className="mx-auto max-w-6xl px-4 py-24 text-center text-[#6B6B6B]">טוען...</div>
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

  const allChildNames = [childName, ...additionalChildren.map((c) => c.name)]

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="mb-3 flex items-center justify-center gap-3 text-3xl font-light text-[#4A4A4A] sm:text-4xl">
            <img src={starIcon} alt="" className="h-7 w-7 opacity-60" aria-hidden />
            ההתאמה המושלמת עבורכם!
            <img src={starIcon} alt="" className="h-7 w-7 opacity-60" aria-hidden />
          </h1>
          <p className="text-lg text-[#6B6B6B]">
            {additionalChildren.length > 0
              ? `לכל ילד/ה חבילה נפרדת עם העדפות משלו/ה`
              : `עבור ${childName} — חבילה מותאמת אישית`}
          </p>
        </div>

        <div className="space-y-6">
          <ChildPackageCard
            childName={childName}
            age={age}
            gender={gender}
            theme={theme}
            colorPreference={colorPreference}
            wallDesignOption={wallDesignOption}
            pkg={mainPackage}
            price={mainPackage.price}
          />

          {additionalPackagesDetails.map((item, index) => (
            <ChildPackageCard
              key={`${item.child.name}-${index}`}
              childName={item.child.name}
              age={item.child.age}
              gender={item.child.gender}
              theme={item.child.theme}
              colorPreference={item.child.colorPreference}
              wallDesignOption={item.child.wallDesignOption}
              pkg={item.package}
              price={Math.round(item.package.price * 0.8)}
              originalPrice={item.package.price}
              discountLabel="הנחת אחים 20%"
            />
          ))}
        </div>

        <div className="mt-8 rounded-sm border border-[#E8DED2] bg-[#F5F1ED] p-6 shadow-sm sm:p-8">
          {additionalChildren.length > 0 && (
            <>
              <div className="mx-auto mb-6 max-w-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#E8DED2] py-2">
                  <span className="text-[#6B6B6B]">חבילת {childName}</span>
                  <span className="text-xl text-[#4A4A4A]">₪{mainPackage.price}</span>
                </div>
                {additionalPackagesDetails.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-[#E8DED2] py-2"
                  >
                    <span className="text-[#6B6B6B]">חבילת {item.child.name}</span>
                    <span className="text-xl text-[#4A4A4A]">
                      ₪{Math.round(item.package.price * 0.8)}
                    </span>
                  </div>
                ))}
              </div>

              {totalSavings > 0 && (
                <p className="mb-4 text-center text-[#7BA05B]">
                  חסכתם ₪{totalSavings} בזכות הנחת האחים!
                </p>
              )}
            </>
          )}

          <div className="mb-6 flex items-center justify-between rounded-sm border-2 border-[#C8B6A6] bg-white p-4 sm:p-6">
            <span className="text-xl font-light text-[#6B6B6B]">סה״כ לתשלום:</span>
            <span className="text-3xl font-normal text-[#4A4A4A] sm:text-4xl">₪{grandTotal}</span>
          </div>

          <button
            type="button"
            onClick={handlePurchase}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#C8B6A6] px-6 py-4 text-lg text-white shadow-sm transition-colors hover:bg-[#B5A99A] sm:text-xl"
          >
            <Sparkles className="h-5 w-5" />
            {user ? 'המשך לתשלום' : 'התחברי לרכישה'}
            {allChildNames.length > 1 && (
              <span className="text-base opacity-90">
                ({allChildNames.join(', ')})
              </span>
            )}
          </button>
        </div>

        {recommendedPackages.length > 1 && additionalChildren.length === 0 && (
          <div className="mt-12">
            <h3 className="mb-6 text-2xl font-light text-[#4A4A4A]">אפשרויות נוספות מעולות</h3>
            <div className="grid gap-6 md:grid-cols-3">
              {recommendedPackages.slice(1, 4).map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-sm border border-[#E8DED2] bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex aspect-square items-center justify-center rounded-sm bg-gradient-to-br from-[#F5F1ED] to-[#E8DED2] text-6xl">
                    {packageEmoji(pkg)}
                  </div>
                  <h4 className="mb-2 text-lg font-normal text-[#4A4A4A]">{pkg.name}</h4>
                  <p className="mb-4 text-sm text-[#6B6B6B]">{pkg.description}</p>
                  <p className="text-xl font-light text-[#4A4A4A]">₪{pkg.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
