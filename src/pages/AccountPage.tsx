import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
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
import { getChildForPackage, getChildPackageEntries, getPackageStatusForChild, hasPurchased, type ChildInfo } from '../utils/auth'

function themeEmoji(theme: string) {
  if (theme.includes('חלל')) return '🚀'
  if (theme.includes('אוקיינוס')) return '🐠'
  if (theme.includes('ג׳ונגל') || theme.includes('חיות')) return '🦁'
  if (theme.includes('נסיכ')) return '👑'
  if (theme.includes('הרפתק')) return '⛺'
  if (theme.includes('ים')) return '🚢'
  if (theme.includes('תחבורה')) return '🚗'
  return '✨'
}

function packagePreviewImage(content: PackageContent | null): string {
  if (!content) return ''
  if (content.heroImage) return content.heroImage
  return content.galleryImages.find(Boolean) ?? ''
}

function PackageCardThumbnail({
  pkg,
  getPackageContent,
  faded = false,
}: {
  pkg: ThemePackage
  getPackageContent: (id: string) => PackageContent | null
  faded?: boolean
}) {
  const imageUrl = packagePreviewImage(getPackageContent(pkg.id))
  const fadedClass = faded ? 'opacity-50 grayscale' : ''

  if (imageUrl) {
    return (
      <div
        className={`mb-4 aspect-square overflow-hidden rounded-sm border border-[#E8DED2] ${fadedClass}`}
      >
        <img
          src={imageUrl}
          alt={`תצוגת ${pkg.name}`}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={`mb-4 flex aspect-square items-center justify-center rounded-sm bg-gradient-to-br from-[#F5F1ED] to-[#E8DED2] text-6xl ${fadedClass}`}
    >
      {themeEmoji(pkg.theme)}
    </div>
  )
}

export function AccountPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { packages, getPackageById, getPackageContent } = useData()
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
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-light text-[#4A4A4A]">שלום, {user.name}!</h1>
          <p className="text-[#6B6B6B]">נהלי את חבילות העיצוב שלך וגלי השראה חדשה</p>
        </div>

        <section className="mb-12">
          {childPackageEntries.length === 0 && purchasedPackages.length === 0 ? (
            <div>
              <h2 className="mb-6 text-2xl font-light text-[#4A4A4A]">חבילות העיצוב שלך</h2>
              <div className="rounded-sm border border-[#E8DED2] bg-white p-12 text-center shadow-sm">
                <div className="mb-4 text-6xl">🎨</div>
                <h3 className="mb-2 text-xl font-normal text-[#4A4A4A]">עדיין אין חבילות</h3>
                <p className="mb-6 text-[#6B6B6B]">התחילי ליצור את חדר החלומות של הילד שלך היום!</p>
                <button
                  type="button"
                  onClick={() => navigate('/questionnaire')}
                  className="inline-flex items-center gap-2 rounded-sm bg-[#C8B6A6] px-6 py-3 text-white transition-colors hover:bg-[#B5A99A]"
                >
                  יצירת החבילה הראשונה שלך
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {orphanPackages.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-light text-[#4A4A4A]">חבילות העיצוב שלך</h2>
                  <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {orphanPackages.map((pkg) => {
                      const status = getPackageStatus(pkg)
                      return (
                        <div
                          key={pkg.id}
                          className="overflow-hidden rounded-sm border border-[#E8DED2] bg-white shadow-sm"
                        >
                          <div className="flex items-center gap-2 border-b border-[#D4E7D4] bg-[#F0F8F0] px-4 py-2">
                            <CheckCircle className="h-4 w-4 text-[#7BA05B]" />
                            <span className="text-sm font-normal text-[#5A7A4A]">
                              {status.message || 'חבילה פעילה'}
                            </span>
                          </div>
                          <div className="p-6">
                            <PackageCardThumbnail pkg={pkg} getPackageContent={getPackageContent} />
                            <h3 className="mb-2 text-xl font-normal text-[#4A4A4A]">{pkg.name}</h3>
                            <p className="mb-4 text-sm text-[#6B6B6B]">{pkg.theme}</p>
                            <button
                              type="button"
                              onClick={() => navigate(`/package/${pkg.id}`)}
                              className="w-full rounded-sm bg-[#C8B6A6] px-4 py-2 text-white transition-colors hover:bg-[#B5A99A]"
                            >
                              הצגת חבילה מלאה
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {uniqueChildren.map((child, childIndex) => {
                const childEntries = packagesByChild.get(child.name) || []
                const activeEntries = childEntries.filter(
                  (entry) => getPackageStatus(entry.pkg, entry.child).status !== 'outdated',
                )

                if (activeEntries.length === 0) return null

                const futureYear = new Date().getFullYear() + (7 - child.age)

                return (
                  <div key={child.name} className={childIndex > 0 ? 'mt-12' : ''}>
                    <h2 className="mb-6 text-2xl font-light text-[#4A4A4A]">
                      חבילות העיצוב של {child.name}
                    </h2>

                    <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {activeEntries.map((entry) => {
                        const { pkg, child: entryChild } = entry
                        const status = getPackageStatus(pkg, entryChild)

                        return (
                          <div
                            key={`${entryChild.name}-${entryChild.packageId}-${entryChild.purchaseDate}`}
                            className="overflow-hidden rounded-sm border border-[#E8DED2] bg-white shadow-sm"
                          >
                            {status.status === 'expiring' && (
                              <div className="flex items-center gap-2 border-b border-[#F5E6B3] bg-[#FFF9E6] px-4 py-2">
                                <AlertCircle className="h-4 w-4 text-[#C8A65D]" />
                                <span className="text-sm font-normal text-[#8B7340]">פג תוקף בקרוב</span>
                              </div>
                            )}
                            {status.status === 'active' && (
                              <div className="flex items-center gap-2 border-b border-[#D4E7D4] bg-[#F0F8F0] px-4 py-2">
                                <CheckCircle className="h-4 w-4 text-[#7BA05B]" />
                                <span className="text-sm font-normal text-[#5A7A4A]">
                                  {status.message}
                                </span>
                              </div>
                            )}
                            <div className="p-6">
                              <PackageCardThumbnail pkg={pkg} getPackageContent={getPackageContent} />

                              <h3 className="mb-2 text-xl font-normal text-[#4A4A4A]">{pkg.name}</h3>
                              <p className="mb-4 text-sm text-[#6B6B6B]">{pkg.theme}</p>

                              <div className="mb-4 flex gap-1">
                                {pkg.colorPalette.slice(0, 5).map((color) => (
                                  <div
                                    key={color}
                                    className="h-8 w-8 rounded-full border border-[#E8DED2]"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => navigate(`/package/${pkg.id}`)}
                                className="w-full rounded-sm bg-[#C8B6A6] px-4 py-2 text-white transition-colors hover:bg-[#B5A99A]"
                              >
                                הצגת חבילה מלאה
                              </button>

                              <button
                                type="button"
                                onClick={scrollToMasterclass}
                                className="mt-2 w-full px-4 py-2 text-center text-sm text-[#C8B6A6] transition-colors hover:text-[#B5A99A]"
                              >
                                מתכננים להחליף ארון או מיטה? הנה המדריך המקצועי שלי לבחירה נכונה
                                שתחזיק שנים &gt;
                              </button>

                              {status.status === 'expiring' && (
                                <button
                                  type="button"
                                  onClick={() => navigate('/questionnaire')}
                                  className="mt-2 w-full rounded-sm border border-[#C8A65D] px-4 py-2 font-normal text-[#8B7340] transition-colors hover:bg-[#FFF9E6]"
                                >
                                  שדרוג חבילה - 30% הנחה
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-dashed border-[#C8B6A6]/30 bg-white/40 backdrop-blur-sm">
                        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                          <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#C8B6A6]/10 to-[#E8DED2]/10 blur-2xl" />
                            <Sparkles className="relative h-16 w-16 text-[#C8B6A6] stroke-[1.5]" />
                          </div>

                          <h3 className="mb-3 text-xl font-normal text-[#4A4A4A]">המקום שלי כשאגדל</h3>

                          <p className="mb-4 text-sm leading-relaxed text-[#6B6B6B]">
                            הבסיס האיכותי כבר כאן. כשיגיע הזמן להתאים את החדר לילד הגדול שאהיה, כל
                            מה שצריך כדי לעדכן את האווירה בקלות יחכה לכם בדיוק כאן.
                          </p>

                          <div className="flex items-center gap-2 text-sm font-normal text-[#C8B6A6]">
                            <Calendar className="h-4 w-4" />
                            <span>זמין ב-{futureYear}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {childPackageEntries.some(
                (entry) => getPackageStatus(entry.pkg, entry.child).status === 'outdated',
              ) && (
                <div className="mt-16">
                  <h2 className="mb-2 flex items-center gap-2 text-2xl font-light text-[#4A4A4A]">
                    <Archive className="h-6 w-6 text-[#C8B6A6]" />
                    החדרים שלכם לאורך השנים
                  </h2>
                  <p className="mb-6 text-sm text-[#6B6B6B]">
                    עיצוב טוב יודע מתי לפנות מקום לצמיחה חדשה. כשהחדרים של{' '}
                    {uniqueChildren.map((c) => c.name).join(' או ')} יתפתחו, החבילות הקודמות יעברו
                    לכאן – כדי שתוכלו תמיד לחזור פנימה ולהיזכר בסטייל שליווה אתכם.
                  </p>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {childPackageEntries.map((entry) => {
                      const { pkg, child: entryChild } = entry
                      const status = getPackageStatus(pkg, entryChild)
                      if (status.status !== 'outdated') return null

                      return (
                        <div
                          key={`archive-${entryChild.name}-${entryChild.packageId}-${entryChild.purchaseDate}`}
                          className="overflow-hidden rounded-sm border border-[#E8DED2] bg-white opacity-60 shadow-sm"
                        >
                          <div className="flex items-center gap-2 border-b border-[#E8DED2] bg-[#F9F7F4] px-4 py-2">
                            <Archive className="h-4 w-4 text-[#C8B6A6]" />
                            <span className="text-sm font-normal text-[#6B6B6B]">ארכיון</span>
                          </div>
                          <div className="p-6">
                            <PackageCardThumbnail
                              pkg={pkg}
                              getPackageContent={getPackageContent}
                              faded
                            />

                            <h3 className="mb-1 text-xl font-normal text-[#4A4A4A]">
                              {pkg.name} - {entryChild.name}
                            </h3>
                            <p className="mb-4 text-sm text-[#6B6B6B]">{pkg.theme}</p>

                            <div className="mb-4 flex gap-1">
                              {pkg.colorPalette.slice(0, 5).map((color) => (
                                <div
                                  key={color}
                                  className="h-8 w-8 rounded-full border border-[#E8DED2] opacity-50 grayscale"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => navigate(`/package/${pkg.id}`)}
                              className="mb-2 w-full rounded-sm border border-[#E8DED2] px-4 py-2 text-[#6B6B6B] transition-colors hover:bg-[#F9F7F4]"
                            >
                              צפייה בחבילה
                            </button>

                            <button
                              type="button"
                              onClick={() => navigate('/questionnaire')}
                              className="w-full rounded-sm bg-[#C8B6A6] px-4 py-2 font-normal text-white transition-colors hover:bg-[#B5A99A]"
                            >
                              חבילה מתאימה לגיל - 40% הנחה
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-light text-[#4A4A4A]">הצעות מיוחדות</h2>
          <div className="rounded-sm bg-gradient-to-br from-[#C8B6A6] to-[#B5A99A] p-8 text-white">
            <Gift className="mb-4 h-12 w-12" />
            <h3 className="mb-2 text-2xl font-normal">הנחה לאחים</h3>
            <p className="mb-6 text-lg opacity-90">
              {uniqueChildren.length > 1
                ? 'רוצה לעצב חדר לילד נוסף? קבלי 20% הנחה על החבילה הבאה'
                : 'קבלי 20% הנחה כשאת רוכשת חבילה עבור ילד נוסף'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/questionnaire')}
              className="rounded-sm bg-white px-6 py-3 font-normal text-[#C8B6A6] transition-colors hover:bg-[#F9F7F4]"
            >
              {uniqueChildren.length > 1 ? 'הוספת חבילה נוספת' : 'הוספת חבילה לאח/אחות'}
            </button>
          </div>
        </section>

        <section className="mb-20">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-light text-[#4A4A4A]">
              Furniture Masterclass: יסודות החדר
            </h2>
            <p className="text-[#6B6B6B]">
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
                <div className="overflow-hidden rounded-2xl border border-[#E8DED2] bg-gradient-to-br from-[#F5F1ED] to-[#E8DED2] shadow-sm transition-all hover:shadow-lg">
                  <button
                    type="button"
                    className="relative flex aspect-video w-full cursor-pointer items-center justify-center bg-gradient-to-br from-[#D4C4B0] to-[#C8B6A6]"
                    onClick={() => setPlayingVideo(playingVideo === id ? null : id)}
                  >
                    {playingVideo !== id ? (
                      <>
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative z-10 flex flex-col items-center">
                          <Icon className="mb-3 h-16 w-16 text-white/90" />
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 transition-colors hover:bg-white">
                            <Play className="mr-[-2px] h-7 w-7 fill-current text-[#C8B6A6]" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-black/80">
                        <div className="p-6 text-center text-white">
                          <p className="mb-2 text-sm">🎥 וידאו: {videoLabel}</p>
                          <p className="text-xs opacity-75">כאן יוצג הוידאו המלא</p>
                        </div>
                      </div>
                    )}
                  </button>

                  <div className="bg-white p-6">
                    <h3 className="mb-2 text-xl font-normal text-[#4A4A4A]">{title}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-[#6B6B6B]">{description}</p>
                    <button
                      type="button"
                      onClick={() => setPlayingVideo(playingVideo === id ? null : id)}
                      className="w-full rounded-lg bg-[#C8B6A6] px-4 py-2.5 text-sm font-normal text-white transition-colors hover:bg-[#B5A99A]"
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
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-medium text-[#4A4A4A]">ארגז הכלים לביצוע מושלם</h2>
          </div>

          <div className="mx-auto grid max-w-6xl gap-7 md:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate('/tips')}
              className="cursor-pointer rounded-2xl border border-[#EDE5DD] bg-[#FDFCFB] p-7 text-right shadow-[0_4px_24px_rgba(120,100,80,0.05)] transition-all hover:shadow-[0_8px_30px_rgba(120,100,80,0.08)]"
            >
              <div className="mb-4 flex items-start gap-4">
                <Search className="h-7 w-7 flex-shrink-0 text-[#6B6B6B] stroke-[1.5]" />
                <div className="flex-1">
                  <h3 className="mb-2 text-base font-normal leading-snug text-[#4A4A4A]">
                    איך למצוא הכל (גם אם הלינק נשבר)
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6B6B6B]">
                    מדריך מציאת מוצרים דומים במידה ואזל מהמלאי
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-normal text-[#C8B6A6] transition-colors hover:text-[#B5A99A]">
                לקריאת המדריך
                <ArrowLeft className="h-4 w-4" />
              </div>
            </button>

            <div className="rounded-2xl border border-[#EDE5DD] bg-[#FDFCFB] p-7 shadow-[0_4px_24px_rgba(120,100,80,0.05)] transition-all hover:shadow-[0_8px_30px_rgba(120,100,80,0.08)]">
              <div className="mb-4 flex items-start gap-4">
                <CheckSquare className="h-7 w-7 flex-shrink-0 text-[#6B6B6B] stroke-[1.5]" />
                <div className="flex-1">
                  <h3 className="mb-2 text-base font-normal leading-snug text-[#4A4A4A]">
                    צ&apos;ק ליסט לצביעה ודיוק
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6B6B6B]">
                    מדריך צעד אחר צעד לצביעה קירות והתקנת אלמנטים
                  </p>
                </div>
              </div>
              <div className="flex cursor-pointer items-center gap-1.5 text-sm font-normal text-[#C8B6A6] transition-colors hover:text-[#B5A99A]">
                לקריאת המדריך
                <ArrowLeft className="h-4 w-4" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#EDE5DD] bg-[#FDFCFB] p-7 shadow-[0_4px_24px_rgba(120,100,80,0.05)] transition-all hover:shadow-[0_8px_30px_rgba(120,100,80,0.08)]">
              <div className="mb-4 flex items-start gap-4">
                <Tag className="h-7 w-7 flex-shrink-0 text-[#6B6B6B] stroke-[1.5]" />
                <div className="flex-1">
                  <h3 className="mb-2 text-base font-normal leading-snug text-[#4A4A4A]">
                    סודות הקנייה החכמה
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6B6B6B]">
                    כיצד למקסם את תקציב העיצוב ולקבל את הערך הטוב ביותר
                  </p>
                </div>
              </div>
              <div className="flex cursor-pointer items-center gap-1.5 text-sm font-normal text-[#C8B6A6] transition-colors hover:text-[#B5A99A]">
                לקריאת המדריך
                <ArrowLeft className="h-4 w-4" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
