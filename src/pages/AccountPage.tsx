import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Archive,
  BookOpen,
  Calendar,
  Check,
  CheckSquare,
  Gift,
  Home,
  Play,
  Search,
  Sparkles,
  Tag,
} from 'lucide-react'
import { Header } from '../components/Header'
import { PageLoading } from '../components/PageLoading'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import type { ThemePackage } from '../data/themePackages'
import type { PackageContent } from '../contexts/DataContext'
import {
  getChildForPackage,
  getChildPackageEntries,
  getPackageStatusForChild,
  hasPurchased,
  type ChildInfo,
} from '../utils/auth'

const FALLBACK_ROOM = '/assets/hero-background.png'

function packagePreviewImage(content: PackageContent | null): string {
  if (!content) return ''
  if (content.heroImage) return content.heroImage
  return content.galleryImages.find(Boolean) ?? ''
}

function PurchasedPackageRow({
  pkg,
  child,
  statusMessage,
  imageUrl,
  colors,
  futureYear,
  showGrowCard,
  onOpen,
  onGrow,
}: {
  pkg: ThemePackage
  child?: ChildInfo
  statusMessage?: string
  imageUrl: string
  colors: string[]
  futureYear?: number
  showGrowCard: boolean
  onOpen: () => void
  onGrow?: () => void
}) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[220px_minmax(0,1.2fr)_minmax(260px,0.9fr)] lg:gap-10">
      {showGrowCard ? (
        <div className="text-center lg:text-right">
          <Sparkles className="mx-auto mb-4 h-6 w-6 text-[#C4B8A8] lg:mx-0" strokeWidth={1.25} />
          <h3 className="mb-3 text-lg font-light text-[#4A4A4A]">המקום שלי כשאגדל</h3>
          <p className="mb-4 text-sm leading-7 text-[#8B8B8B]">
            הבסיס האיכותי כבר כאן. כשיגיע הזמן להתאים את החדר, העדכון יחכה לכם בדיוק כאן.
          </p>
          {futureYear && (
            <p className="flex items-center justify-center gap-2 text-xs text-[#C4B8A8] lg:justify-start">
              <Calendar className="h-3.5 w-3.5" />
              זמין ב-{futureYear}
            </p>
          )}
          {onGrow && (
            <button
              type="button"
              onClick={onGrow}
              className="mt-3 text-sm text-[#8B7340] hover:underline"
            >
              כבר הגיע הזמן?
            </button>
          )}
        </div>
      ) : (
        <div className="hidden lg:block" />
      )}

      <div className="overflow-hidden rounded-2xl bg-[#F7F4F0]">
        <img
          src={imageUrl || FALLBACK_ROOM}
          alt={`תצוגת ${pkg.name}`}
          className="aspect-[5/4] w-full object-cover"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2 text-xs text-[#8B8B8B]">
          <Check className="h-3.5 w-3.5 text-[#C4B8A8]" />
          {child
            ? `מותאם עבור ${child.name}${child.age ? ` (גיל ${child.age})` : ''}`
            : statusMessage || 'חבילה פעילה'}
        </div>
        <h3 className="mb-2 text-2xl font-light text-[#4A4A4A] sm:text-3xl">{pkg.name}</h3>
        <p className="mb-5 text-sm leading-7 text-[#8B8B8B]">{pkg.description}</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {colors.slice(0, 6).map((color) => (
            <div
              key={color}
              className="h-6 w-6 rounded-full border border-[#EDE8E1]"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="mb-3 w-full rounded-full bg-[#C4B8A8] py-2.5 text-sm text-white transition-colors hover:bg-[#B5A99A]"
        >
          הצגת חבילה מלאה
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="text-sm text-[#8B8B8B] hover:text-[#4A4A4A]"
        >
          מה כלול בחבילה?
        </button>
      </div>
    </div>
  )
}

export function AccountPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { packages, getPackageById, getPackageContent, getColorScaleForPreference } = useData()
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  if (loading) {
    return <PageLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const purchasedPackages = packages.filter((pkg) => hasPurchased(user, pkg.id))
  const childPackageEntries = getChildPackageEntries(user, packages, getPackageById)

  const getPackageStatus = (pkg: ThemePackage, child?: ChildInfo) => {
    if (child) return getPackageStatusForChild(pkg, child)
    const childInfo = getChildForPackage(user, pkg.id)
    if (!childInfo) return { status: 'active' as const, message: '' }
    return getPackageStatusForChild(pkg, childInfo)
  }

  const colorsFor = (pkg: ThemePackage, child?: ChildInfo) => {
    const scale = getColorScaleForPreference(child?.colorPreference || '')
    const fromScale = scale.colors.map((c) => c.hex)
    return fromScale.length > 0 ? fromScale : pkg.colorPalette
  }

  const packagesByChild = new Map<string, typeof childPackageEntries>()
  childPackageEntries.forEach((entry) => {
    if (!packagesByChild.has(entry.child.name)) {
      packagesByChild.set(entry.child.name, [])
    }
    packagesByChild.get(entry.child.name)!.push(entry)
  })

  const uniqueChildren = [...new Set(user.children.map((c) => c.name))].map(
    (name) => user.children.find((c) => c.name === name)!,
  )

  const orphanPackages = purchasedPackages.filter(
    (pkg) => !childPackageEntries.some((entry) => entry.pkg.id === pkg.id),
  )

  const scrollToMasterclass = () => {
    setTimeout(() => {
      document.querySelectorAll('h2').forEach((h2) => {
        if (h2.textContent?.includes('Furniture Masterclass')) {
          h2.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="mb-16">
          {childPackageEntries.length === 0 && purchasedPackages.length === 0 ? (
            <div className="py-16 text-center">
              <Sparkles className="mx-auto mb-5 h-8 w-8 text-[#C4B8A8]" strokeWidth={1.25} />
              <h3 className="mb-2 text-2xl font-light text-[#4A4A4A]">עדיין אין חבילות</h3>
              <p className="mb-8 text-sm text-[#8B8B8B]">התחילו ליצור את חדר החלומות של הילד.</p>
              <button
                type="button"
                onClick={() => navigate('/questionnaire')}
                className="rounded-full bg-[#3F3A36] px-7 py-2.5 text-sm text-white hover:bg-[#2F2B28]"
              >
                יצירת החבילה הראשונה
              </button>
            </div>
          ) : (
            <>
              {orphanPackages.length > 0 && (
                <div className="mb-16 space-y-16">
                  {orphanPackages.map((pkg) => (
                    <PurchasedPackageRow
                      key={pkg.id}
                      pkg={pkg}
                      statusMessage={getPackageStatus(pkg).message || 'חבילה פעילה'}
                      imageUrl={packagePreviewImage(getPackageContent(pkg.id))}
                      colors={colorsFor(pkg)}
                      showGrowCard
                      onOpen={() => navigate(`/package/${pkg.id}`)}
                    />
                  ))}
                </div>
              )}

              {uniqueChildren.map((child) => {
                const childEntries = packagesByChild.get(child.name) || []
                const activeEntries = childEntries.filter(
                  (entry) => getPackageStatus(entry.pkg, entry.child).status !== 'outdated',
                )

                if (activeEntries.length === 0) return null

                const futureYear = new Date().getFullYear() + Math.max(1, 7 - child.age)

                return (
                  <div key={child.name} className="mb-16 space-y-16">
                    {activeEntries.map((entry, index) => {
                      const { pkg, child: entryChild } = entry
                      const status = getPackageStatus(pkg, entryChild)

                      return (
                        <div key={`${entryChild.name}-${entryChild.packageId}-${entryChild.purchaseDate}`}>
                          <PurchasedPackageRow
                            pkg={pkg}
                            child={entryChild}
                            statusMessage={status.message}
                            imageUrl={packagePreviewImage(getPackageContent(pkg.id))}
                            colors={colorsFor(pkg, entryChild)}
                            futureYear={futureYear}
                            showGrowCard={index === 0}
                            onOpen={() => navigate(`/package/${pkg.id}`)}
                            onGrow={
                              status.status === 'expiring'
                                ? () => navigate('/questionnaire')
                                : undefined
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              })}

              <p className="text-center text-xs leading-6 text-[#B5B0A8]">
                כל חבילה כוללת פריטים נבחרים, קישורי רכישה והנחיות עיצוב מלאות.
              </p>

              {childPackageEntries.some(
                (entry) => getPackageStatus(entry.pkg, entry.child).status === 'outdated',
              ) && (
                <div className="mt-16 border-t border-[#F0EBE4] pt-12">
                  <h2 className="mb-2 text-center text-2xl font-light text-[#4A4A4A]">
                    החדרים שלכם לאורך השנים
                  </h2>
                  <p className="mx-auto mb-10 max-w-xl text-center text-sm text-[#8B8B8B]">
                    כשהחדרים יתפתחו, החבילות הקודמות יעברו לכאן.
                  </p>
                  <div className="space-y-16">
                    {childPackageEntries.map((entry) => {
                      const { pkg, child: entryChild } = entry
                      const status = getPackageStatus(pkg, entryChild)
                      if (status.status !== 'outdated') return null

                      return (
                        <PurchasedPackageRow
                          key={`archive-${entryChild.name}-${entryChild.packageId}-${entryChild.purchaseDate}`}
                          pkg={pkg}
                          child={entryChild}
                          statusMessage="ארכיון"
                          imageUrl={packagePreviewImage(getPackageContent(pkg.id))}
                          colors={colorsFor(pkg, entryChild)}
                          showGrowCard={false}
                          onOpen={() => navigate(`/package/${pkg.id}`)}
                          onGrow={() => navigate('/questionnaire')}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="mb-16 border-t border-[#F0EBE4] pt-12 text-center">
          <Gift className="mx-auto mb-4 h-7 w-7 text-[#C4B8A8]" strokeWidth={1.25} />
          <h3 className="mb-2 text-2xl font-light text-[#4A4A4A]">הנחה לאחים</h3>
          <p className="mb-6 text-sm text-[#8B8B8B]">
            {uniqueChildren.length > 1
              ? 'רוצים לעצב חדר לילד נוסף? 20% הנחה על החבילה הבאה.'
              : '20% הנחה ברכישת חבילה עבור ילד נוסף.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/questionnaire')}
            className="rounded-full bg-[#C4B8A8] px-7 py-2.5 text-sm text-white hover:bg-[#B5A99A]"
          >
            {uniqueChildren.length > 1 ? 'הוספת חבילה נוספת' : 'הוספת חבילה לאח/אחות'}
          </button>
        </section>

        <section className="mb-20">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-light text-[#4A4A4A]">
              Furniture Masterclass: יסודות החדר
            </h2>
            <p className="text-sm text-[#8B8B8B]">
              טיפים מקצועיים לבחירת הרהיטים הגדולים שילוו אתכם שנים
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {[
              {
                id: 'bed',
                icon: Home,
                title: 'המיטה המושלמת',
                description: 'איך לבחור מיטה בטוחה שלא משתלטת על החלל',
                videoLabel: 'המיטה המושלמת',
              },
              {
                id: 'cabinet',
                icon: Archive,
                title: 'אחסון חכם',
                description: 'תכנון פנים שגדל עם הילד ומונע עומס ויזואלי',
                videoLabel: 'אחסון חכם',
              },
              {
                id: 'study',
                icon: BookOpen,
                title: 'פינת הלמידה',
                description: 'ארגונומיה וריכוז: יצירת סביבת למידה מעוררת השראה',
                videoLabel: 'פינת הלמידה',
              },
            ].map(({ id, icon: Icon, title, description, videoLabel }) => (
              <div key={id}>
                <div className="overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    className="relative flex aspect-video w-full cursor-pointer items-center justify-center bg-[#F0EBE4]"
                    onClick={() => setPlayingVideo(playingVideo === id ? null : id)}
                  >
                    {playingVideo !== id ? (
                      <div className="relative z-10 flex flex-col items-center">
                        <Icon className="mb-3 h-10 w-10 text-[#C4B8A8]" strokeWidth={1.25} />
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                          <Play className="mr-[-2px] h-5 w-5 fill-current text-[#C4B8A8]" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#3F3A36]/80">
                        <div className="p-6 text-center text-white">
                          <p className="mb-2 text-sm">🎥 וידאו: {videoLabel}</p>
                          <p className="text-xs opacity-75">כאן יוצג הוידאו המלא</p>
                        </div>
                      </div>
                    )}
                  </button>

                  <div className="pt-5">
                    <h3 className="mb-2 text-lg font-light text-[#4A4A4A]">{title}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-[#8B8B8B]">{description}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setPlayingVideo(playingVideo === id ? null : id)
                        scrollToMasterclass()
                      }}
                      className="text-sm text-[#8B7340] hover:underline"
                    >
                      {playingVideo === id ? 'סגור וידאו' : 'צפייה בשיעור'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-light text-[#4A4A4A]">ארגז הכלים לביצוע מושלם</h2>
          </div>

          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate('/tips')}
              className="cursor-pointer text-right"
            >
              <div className="mb-3 flex items-start gap-3">
                <Search className="h-5 w-5 flex-shrink-0 text-[#C4B8A8]" strokeWidth={1.5} />
                <div>
                  <h3 className="mb-2 font-light text-[#4A4A4A]">איך למצוא הכל</h3>
                  <p className="text-sm leading-relaxed text-[#8B8B8B]">
                    מדריך מציאת מוצרים דומים אם פריט אזל מהמלאי
                  </p>
                </div>
              </div>
              <span className="text-sm text-[#8B7340]">לקריאת המדריך</span>
            </button>

            <div>
              <div className="mb-3 flex items-start gap-3">
                <CheckSquare className="h-5 w-5 flex-shrink-0 text-[#C4B8A8]" strokeWidth={1.5} />
                <div>
                  <h3 className="mb-2 font-light text-[#4A4A4A]">צ׳ק ליסט לצביעה</h3>
                  <p className="text-sm leading-relaxed text-[#8B8B8B]">
                    מדריך צעד אחר צעד לצביעת קירות והתקנת אלמנטים
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-start gap-3">
                <Tag className="h-5 w-5 flex-shrink-0 text-[#C4B8A8]" strokeWidth={1.5} />
                <div>
                  <h3 className="mb-2 font-light text-[#4A4A4A]">סודות הקנייה החכמה</h3>
                  <p className="text-sm leading-relaxed text-[#8B8B8B]">
                    איך למקסם את תקציב העיצוב ולקבל את הערך הטוב ביותר
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
