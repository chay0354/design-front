import { Lock, Sparkles } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { findMatchingPackages, packages, type Package } from '../data/packages'
import { getCurrentUser } from '../utils/auth'

const lockPreviewImage = '/assets/lock-preview.png'
const starIcon = '/assets/star-icon.png'

interface AdditionalChild {
  name: string
  age: number
  gender: 'boy' | 'girl' | 'unisex'
  theme: string
  colorPreference: string
}

function getColorPaletteFromName(colorName: string) {
  if (colorName.includes('חמים')) return ['#D4A574', '#8B7355', '#A0826D']
  if (colorName.includes('כחול')) return ['#4A7C9E', '#7BA4C7', '#B0D4E8']
  if (colorName.includes('ירוק')) return ['#7CB342', '#9CCC65', '#C5E1A5']
  if (colorName.includes('אפור')) return ['#8E8E8E', '#A8A8A8', '#C5C5C5']
  if (colorName.includes('צבעוני')) return ['#E57373', '#FFB74D', '#81C784']
  return ['#D4A574', '#8B7355', '#A0826D']
}

function packageEmoji(pkg: Package) {
  if (pkg.theme.includes('חלל')) return '🚀'
  if (pkg.theme.includes('אוקיינוס')) return '🐠'
  if (pkg.theme.includes('ג׳ונגל') || pkg.theme.includes('טבע')) return '🦁'
  if (pkg.theme.includes('מלכות')) return '👑'
  return '✨'
}

export function PackagePreviewPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = getCurrentUser()

  const childName = searchParams.get('childName') || ''
  const gender = (searchParams.get('gender') as 'boy' | 'girl' | 'unisex') || 'unisex'
  const age = parseInt(searchParams.get('age') || '5', 10)
  const theme = searchParams.get('theme') || ''
  const colorPreference = searchParams.get('colorPreference') || ''
  const wallDesignOption = searchParams.get('wallDesignOption') || ''
  const additionalChildrenParam = searchParams.get('additionalChildren')
  const additionalChildren: AdditionalChild[] = additionalChildrenParam
    ? (JSON.parse(additionalChildrenParam) as AdditionalChild[])
    : []

  const recommendedPackages = findMatchingPackages(gender, age, theme)
  const mainPackage = recommendedPackages[0] || packages[0]

  const additionalPackagesDetails = additionalChildren.map((child) => {
    const childPackages = findMatchingPackages(child.gender, child.age, child.theme)
    return { child, package: childPackages[0] || packages[0] }
  })

  const selectedColors = getColorPaletteFromName(colorPreference)

  const handlePurchase = () => {
    const queryParams = new URLSearchParams({
      childName,
      childAge: age.toString(),
      gender,
      theme,
      colorPreference,
      additionalChildren: JSON.stringify(additionalChildren),
    })

    if (!user) {
      sessionStorage.setItem('intended_package', mainPackage.id)
      sessionStorage.setItem('intended_child_name', childName)
      sessionStorage.setItem('intended_child_age', age.toString())
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

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center gap-3 text-4xl font-light text-[#4A4A4A]">
            <img src={starIcon} alt="" className="h-8 w-8 opacity-60" aria-hidden />
            ההתאמה המושלמת עבור {childName}!
            <img src={starIcon} alt="" className="h-8 w-8 opacity-60" aria-hidden />
          </h1>
          <p className="text-xl text-[#6B6B6B]">
            על סמך התשובות שלך, אנחנו ממליצים על חבילת העיצוב המדהימה הזו
          </p>
        </div>

        <div className="mb-8 overflow-hidden rounded-sm border border-[#E8DED2] bg-white shadow-sm">
          <div className="border-b border-[#E8DED2] bg-[#F9F7F4] px-8 py-4">
            <h3 className="text-[32px] font-light text-[#4A4A4A]">חבילת העיצוב של {childName}</h3>
            <p className="mt-1 text-[24px] text-[#6B6B6B]">
              גיל {age} • {theme} • גוונים: {colorPreference}
            </p>
          </div>

          <div className="grid gap-8 p-8 md:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-sm">
              <img
                src={lockPreviewImage}
                alt="תצוגה מקדימה של לוח השראה"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-md">
                <div className="rounded-sm bg-white/80 px-8 py-6 text-center">
                  <Lock className="mx-auto mb-4 h-16 w-16 text-[#C8B6A6]" />
                  <p className="text-lg font-normal text-[#4A4A4A]">
                    ההדמיה המלאה תיפתח לאחר הרכישה
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-normal text-[#4A4A4A]">הבחירות שלך מהשאלון</h3>
              <div className="mb-6 space-y-5">
                <div className="border-b border-[#E8DED2] pb-4">
                  <h4 className="mb-2 text-sm font-normal text-[#6B6B6B]">נושא</h4>
                  <p className="text-[36px] text-[#4A4A4A]">{theme}</p>
                </div>
                <div className="border-b border-[#E8DED2] pb-4">
                  <h4 className="mb-2 text-sm font-normal text-[#6B6B6B]">פלטת גוונים</h4>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex gap-2">
                      {selectedColors.map((color) => (
                        <div
                          key={color}
                          className="h-10 w-10 rounded-full border border-[#E8DED2]"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-base text-[#4A4A4A]">{colorPreference}</span>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-normal text-[#6B6B6B]">סוג קיר הכוח</h4>
                  <div className="rounded-sm bg-[#F9F7F4] p-4">
                    <p className="mb-2 text-base font-normal text-[#4A4A4A]">
                      {wallDesignOption === 'paint'
                        ? 'קיר כוח בצביעה'
                        : 'חיפוי קיר דקורטיבי'}
                    </p>
                    <p className="text-sm leading-relaxed text-[#6B6B6B]">
                      {wallDesignOption === 'paint'
                        ? 'צביעת קיר אחד היא עבודה פשוטה של כשעתיים. בסיס על-זמני שמתאים לכל גיל.'
                        : 'פתרון מעוצב ללא לכלוך של צבע, עם אפשרות להסרה בקלות.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6 rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-4">
                <div className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-5 w-5 text-[#C8B6A6]" />
                  <div>
                    <h4 className="font-normal text-[#4A4A4A]">פתחי את החבילה המלאה:</h4>
                    <ul className="mt-2 space-y-1 text-sm text-[#6B6B6B]">
                      <li>• קודי צבע מדויקים לכל האלמנטים</li>
                      <li>• גבהי תלייה מדויקים ומדריך מיקום</li>
                      <li>• קישורי קנייה ישירים</li>
                      <li>• הדמיה תלת-ממדית וסיור בחדר</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E8DED2] pt-4">
                <p className="text-sm text-[#6B6B6B]">מחיר חבילה</p>
                <p className="text-3xl font-light text-[#4A4A4A]">₪{mainPackage.price}</p>
              </div>
            </div>
          </div>
        </div>

        {additionalPackagesDetails.length > 0 && (
          <div className="mb-8 space-y-6">
            <div className="mb-8 text-center">
              <h2 className="mb-2 flex items-center justify-center gap-3 text-3xl font-light text-[#4A4A4A]">
                <img src={starIcon} alt="" className="h-6 w-6" aria-hidden />
                חבילות נוספות עבור האחים/אחיות
                <img src={starIcon} alt="" className="h-6 w-6" aria-hidden />
              </h2>
              <p className="text-[#6B6B6B]">כל ילד מקבל חבילה מותאמת אישית עם הנחה של 20%</p>
            </div>

            {additionalPackagesDetails.map((item, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-sm border border-[#E8DED2] bg-white shadow-sm"
              >
                <div className="border-b border-[#D4E7D4] bg-[#F0F8F0] px-8 py-4">
                  <h3 className="text-2xl font-light text-[#4A4A4A]">
                    חבילת העיצוב של {item.child.name}
                    <span className="mr-3 text-sm text-[#7BA05B]">(הנחה 20%)</span>
                  </h3>
                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    גיל {item.child.age} • {item.child.theme} • גוונים:{' '}
                    {item.child.colorPreference}
                  </p>
                </div>
                <div className="grid gap-8 p-8 md:grid-cols-2">
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-[#F5F1ED] to-[#E8DED2]">
                    <span className="text-6xl opacity-20">{packageEmoji(item.package)}</span>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm">
                      <div className="text-center">
                        <Lock className="mx-auto mb-4 h-16 w-16 text-[#C8B6A6]" />
                        <p className="text-lg font-normal text-[#4A4A4A]">
                          ההדמיה המלאה תיפתח לאחר הרכישה
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-light text-[#4A4A4A]">
                      ₪{Math.round(item.package.price * 0.8)}
                      <span className="mr-3 text-lg text-[#8B8B8B] line-through">
                        ₪{item.package.price}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-[#7BA05B]">
                      חיסכון של ₪{Math.round(item.package.price * 0.2)}!
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-sm border border-[#E8DED2] bg-[#F5F1ED] p-8 shadow-lg">
              <h3 className="mb-8 text-center text-3xl font-light text-[#4A4A4A]">
                בדרך לחדר החלומות של {childName}
                {additionalPackagesDetails.map((item, index) => (
                  <span key={index}>
                    {index === 0 ? ' ו' : ', '}
                    {item.child.name}
                  </span>
                ))}
              </h3>

              <div className="mx-auto mb-8 max-w-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8DED2] py-3">
                  <span className="text-lg text-[#6B6B6B]">חבילת {childName}</span>
                  <span className="text-2xl font-normal text-[#4A4A4A]">₪{mainPackage.price}</span>
                </div>
                {additionalPackagesDetails.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-[#E8DED2] py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-[#6B6B6B]">חבילת {item.child.name}</span>
                      <span className="rounded-full bg-[#F0F8F0] px-2 py-1 text-xs text-[#7BA05B]">
                        הנחת אחים 20%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-[#8B8B8B] line-through">
                        ₪{item.package.price}
                      </span>
                      <span className="text-2xl font-normal text-[#4A4A4A]">
                        ₪{Math.round(item.package.price * 0.8)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-8 rounded-sm border border-[#D4E7D4] bg-[#F0F8F0] p-4 text-center">
                <p className="text-lg text-[#7BA05B]">
                  חסכת ₪{totalSavings} בזכות ההנחה לאחים!
                </p>
              </div>

              <div className="mb-6 rounded-sm border-2 border-[#C8B6A6] bg-white p-6">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-light text-[#6B6B6B]">סה״כ לתשלום:</span>
                  <span className="text-5xl font-normal text-[#4A4A4A]">₪{grandTotal}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePurchase}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#4A4A4A] px-6 py-5 text-xl font-normal text-white shadow-md transition-colors hover:bg-[#6B6B6B]"
              >
                להזמנת החדרים של {childName}
                {additionalPackagesDetails.map((item, index) => (
                  <span key={index}>
                    {index === 0 ? ' ו' : ', '}
                    {item.child.name}
                  </span>
                ))}{' '}
                ✨
              </button>
              <p className="mt-4 text-center text-sm text-[#8B8B8B]">
                במקום ₪{(1 + additionalChildren.length) * 2000}+ למעצב פנים
              </p>
            </div>
          </div>
        )}

        {additionalChildren.length === 0 && (
          <div className="mb-8 rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="mb-4 text-2xl font-light text-[#4A4A4A]">מוכנים להתחיל את השינוי?</h3>
              <p className="mb-6 text-[#6B6B6B]">קבלו גישה מיידית לחבילת העיצוב המלאה</p>
              <p className="mb-2 text-5xl font-light text-[#4A4A4A]">₪{mainPackage.price}</p>
              <p className="mb-6 text-[#8B8B8B]">במקום ₪2000+ למעצב פנים</p>
              <button
                type="button"
                onClick={handlePurchase}
                className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-sm bg-[#C8B6A6] px-6 py-4 text-lg text-white shadow-sm transition-colors hover:bg-[#B5A99A]"
              >
                <Sparkles className="h-5 w-5" />
                {user ? 'רכישה עכשיו' : 'התחברי לרכישה'}
              </button>
            </div>
          </div>
        )}

        {recommendedPackages.length > 1 && (
          <div>
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
                  <div className="mb-3 flex gap-1">
                    {pkg.colorPalette.slice(0, 4).map((color) => (
                      <div
                        key={color}
                        className="h-8 w-8 rounded-full border border-[#E8DED2]"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
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
