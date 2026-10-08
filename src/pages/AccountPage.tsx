import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Archive,
  Bed,
  Calendar,
  Check,
  ChevronLeft,
  Gift,
  Home,
  Lock,
  Pencil,
  Plus,
  Sparkles,
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

type NoteTask = { id: string; text: string; done: boolean }
type RoomNotesState = {
  self: string[]
  tasks: NoteTask[]
  measures: string[]
}

const EMPTY_NOTES: RoomNotesState = {
  self: ['', '', ''],
  tasks: [
    { id: 'shelves', text: '', done: false },
    { id: 'paint', text: '', done: false },
    { id: 'frames', text: '', done: false },
  ],
  measures: ['', '', ''],
}

const SELF_PLACEHOLDERS = ['לזכור ש...', 'רעיון לפינה...', 'לבדוק...']
const TASK_PLACEHOLDERS = ['לתלות את המדפים...', 'לצבוע את הקיר...', 'למקם את התמונות...']
const MEASURE_PLACEHOLDERS = ['רוחב הקיר...', 'גובה החלון...', 'מידת השידה...']

function RoomNotes({ userId }: { userId: string }) {
  const storageKey = `petite-room-notes:${userId}`
  const [notes, setNotes] = useState<RoomNotesState>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return EMPTY_NOTES
      const parsed = JSON.parse(raw) as RoomNotesState
      if (!parsed.self || !parsed.tasks || !parsed.measures) return EMPTY_NOTES
      return parsed
    } catch {
      return EMPTY_NOTES
    }
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes))
  }, [notes, storageKey])

  const updateLine = (key: 'self' | 'measures', index: number, value: string) => {
    setNotes((current) => {
      const next = [...current[key]]
      next[index] = value
      return { ...current, [key]: next }
    })
  }

  return (
    <section className="bg-[#A39789] px-4 py-14 text-[#3F3A36] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center text-[#F7F3EE]">
          <h2 className="mb-2 flex items-center justify-center gap-2 text-2xl font-medium">
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            הפתקים שלי לחדר
          </h2>
          <p className="text-sm text-[#F3EDE6]/80">
            כל הדברים הקטנים שעוזרים להפוך את התמונה למציאות
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-[#E7E0D6] bg-[#FBF8F4] p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">פתק לעצמי</h3>
                <p className="mt-1 text-xs leading-5 text-[#A39890]">
                  רעיונות, מחשבות וכל דבר שכדאי להשאיר.
                </p>
              </div>
              <Pencil className="h-5 w-5 shrink-0 text-[#C4B8A8]" strokeWidth={1.4} />
            </div>
            <div className="rounded-xl border border-[#E7E0D6] bg-white px-4">
              {notes.self.map((line, index) => (
                <input
                  key={SELF_PLACEHOLDERS[index]}
                  value={line}
                  onChange={(event) => updateLine('self', index, event.target.value)}
                  placeholder={SELF_PLACEHOLDERS[index]}
                  className="w-full border-b border-[#F0EBE4] bg-transparent py-3 text-sm text-[#4A4A4A] outline-none placeholder:text-[#C4BBB2] last:border-b-0"
                />
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#E7E0D6] bg-[#FBF8F4] p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">עוד רגע קורה</h3>
                <p className="mt-1 text-xs leading-5 text-[#A39890]">
                  דברים שרצים לעשות, לסדר ולהשלים בחדר.
                </p>
              </div>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C4B8A8] text-[#C4B8A8]">
                <Check className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </div>
            <div className="rounded-xl border border-[#E7E0D6] bg-white px-4 py-1">
              {notes.tasks.map((task, index) => (
                <label key={task.id} className="flex items-center gap-3 border-b border-[#F0EBE4] py-2.5 last:border-b-0">
                  <button
                    type="button"
                    aria-label={task.done ? 'סימון המשימה כלא הושלמה' : 'סימון המשימה כהושלמה'}
                    onClick={() =>
                      setNotes((current) => ({
                        ...current,
                        tasks: current.tasks.map((item) =>
                          item.id === task.id ? { ...item, done: !item.done } : item,
                        ),
                      }))
                    }
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      task.done ? 'border-[#C4B8A8] bg-[#C4B8A8] text-white' : 'border-[#E4D9CC]'
                    }`}
                  >
                    {task.done && <Check className="h-3 w-3" />}
                  </button>
                  <input
                    value={task.text}
                    onChange={(event) =>
                      setNotes((current) => ({
                        ...current,
                        tasks: current.tasks.map((item) =>
                          item.id === task.id ? { ...item, text: event.target.value } : item,
                        ),
                      }))
                    }
                    placeholder={TASK_PLACEHOLDERS[index] ?? 'משימה חדשה...'}
                    className={`w-full bg-transparent text-sm outline-none placeholder:text-[#C4BBB2] ${
                      task.done ? 'text-[#B5A99A] line-through' : 'text-[#4A4A4A]'
                    }`}
                  />
                </label>
              ))}
              <button
                type="button"
                onClick={() =>
                  setNotes((current) => ({
                    ...current,
                    tasks: [...current.tasks, { id: crypto.randomUUID(), text: '', done: false }],
                  }))
                }
                className="flex w-full items-center justify-center gap-1 py-2.5 text-sm text-[#A89888]"
              >
                הוסף משימה
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-[#E7E0D6] bg-[#FBF8F4] p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">מדדתי ושמרתי</h3>
                <p className="mt-1 text-xs leading-5 text-[#A39890]">
                  מקום למידות ולפרטים שחשוב לזכור.
                </p>
              </div>
              <Pencil className="h-5 w-5 shrink-0 text-[#C4B8A8]" strokeWidth={1.4} />
            </div>
            <div className="rounded-xl border border-[#E7E0D6] bg-white px-4">
              {notes.measures.map((line, index) => (
                <input
                  key={MEASURE_PLACEHOLDERS[index]}
                  value={line}
                  onChange={(event) => updateLine('measures', index, event.target.value)}
                  placeholder={MEASURE_PLACEHOLDERS[index]}
                  className="w-full border-b border-[#F0EBE4] bg-transparent py-3 text-sm text-[#4A4A4A] outline-none placeholder:text-[#C4BBB2] last:border-b-0"
                />
              ))}
            </div>
          </article>
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-[#F3EDE6]/75">
          <Lock className="h-3.5 w-3.5" />
          נשמר אוטומטית באזור האישי שלכם
        </p>
      </div>
    </section>
  )
}

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

        <section className="mb-16 rounded-2xl bg-[#BEB2A4] px-6 py-7 sm:px-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-4 text-[#3F3A36]">
              <Gift className="h-9 w-9 shrink-0 text-[#F7F3EE]" strokeWidth={1.25} />
              <div>
                <h3 className="text-lg font-medium">הנחה לאחים</h3>
                <p className="mt-1 text-sm text-[#4A433C]">
                  רוצה לעצב חדר לילד נוסף? קבלי 20% הנחה על החבילה הבאה
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/questionnaire')}
              className="rounded-lg bg-white px-5 py-2.5 text-sm text-[#5C564F] hover:bg-[#F7F3EE]"
            >
              הוספת חבילה נוספת
            </button>
          </div>
        </section>

        <section className="mb-20">
          <div className="mb-8 text-center">
            <h2 className="mx-auto mb-3 w-fit rounded-full bg-[#E6DDD2] px-6 py-2 text-lg font-medium text-[#3F3A36] md:text-2xl">
              ארגז הכלים לביצוע מושלם
            </h2>
            <p className="text-sm text-[#8B8B8B]">הסברים קצרים ליישום החבילה בחדר</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: '/assets/icons/checklist.png',
                title: 'צ׳ק ליסט לביצוע מדויק',
                subtitle: 'מה להכין לפני שמתחילים',
                text: 'רשימה קצרה לפני צביעה, חיפוי קיר והתקנות, לפי החבילה שלכם.',
              },
              {
                icon: '/assets/icons/designed-corners.png',
                title: 'יוצרים פינות מעוצבות',
                subtitle: 'איך לסדר את הפינות בחדר',
                text: 'איפה לשים מיטה, מדפים ופינת משחק כך שהחדר יישאר נוח.',
              },
              {
                icon: '/assets/icons/center-wall.png',
                title: 'הקיר המרכזי',
                subtitle: 'הקיר שעליו שמים את הדגש',
                text: 'איך לבחור קיר אחד לצבע, לתמונות או לחיפוי, ושאר החדר נשאר שקט.',
              },
            ].map((guide) => (
              <article
                key={guide.title}
                className="flex flex-col rounded-2xl border border-[#E7E0D6] bg-white px-6 py-7 text-center"
              >
                <h3 className="text-lg font-medium text-[#3F3A36]">{guide.title}</h3>
                <p className="mt-1 text-sm text-[#8B8B8B]">{guide.subtitle}</p>
                <img src={guide.icon} alt="" className="mx-auto my-6 h-24 w-auto object-contain" />
                <p className="text-sm leading-7 text-[#8B8B8B]">{guide.text}</p>
                <button
                  type="button"
                  onClick={() => navigate('/tips')}
                  className="mx-auto mt-6 inline-flex items-center gap-1 text-sm text-[#A89888] hover:text-[#6B645C]"
                >
                  לקריאת המדריך
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <div className="mb-8 text-center">
            <h2 className="mx-auto mb-3 w-fit rounded-full bg-[#E6DDD2] px-6 py-2 text-lg font-medium text-[#3F3A36] md:text-2xl">
              Furniture Masterclass | יסודות החדר
            </h2>
            <p className="text-sm text-[#8B8B8B]">טיפים לבחירת הרהיטים הגדולים בחדר</p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {[
              {
                id: 'corner',
                icon: Bed,
                image: '/assets/masterclass-corner.png',
                title: 'הפינה המושלמת',
                description: 'איך לבחור מיטה ושידה שלא תופסות את כל החדר.',
              },
              {
                id: 'cabinet',
                icon: Archive,
                image: '/assets/masterclass-storage.png',
                title: 'אחסון חכם',
                description: 'איך לתכנן ארונות ומדפים שנשארים מסודרים גם כשהילד גדל.',
              },
              {
                id: 'play',
                icon: Home,
                image: '/assets/masterclass-play.png',
                title: 'משחקים או למידה?',
                description: 'פינה אחת שאפשר לשחק בה וגם להכין בה שיעורים.',
              },
            ].map(({ id, icon: Icon, image, title, description }) => (
              <article
                key={id}
                className="flex flex-col rounded-[22px] border border-[#E7E0D6] bg-white p-3 text-center shadow-[0_8px_24px_rgba(90,70,40,0.04)]"
              >
                <button
                  type="button"
                  className="relative block w-full overflow-hidden rounded-xl"
                  onClick={() => setPlayingVideo(playingVideo === id ? null : id)}
                >
                  {playingVideo !== id ? (
                    <img src={image} alt="" className="aspect-[2.3/1] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[2.3/1] w-full items-center justify-center bg-[#3F3A36]/80">
                      <div className="p-6 text-center text-white">
                        <p className="mb-2 text-sm">וידאו: {title}</p>
                        <p className="text-xs opacity-75">כאן יוצג הוידאו המלא</p>
                      </div>
                    </div>
                  )}
                </button>

                <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <h3 className="text-base font-medium text-[#3F3A36]">{title}</h3>
                    <Icon className="h-5 w-5 text-[#C4B8A8]" strokeWidth={1.4} />
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-[#8B8B8B]">{description}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPlayingVideo(playingVideo === id ? null : id)
                      scrollToMasterclass()
                    }}
                    className="mx-auto mt-auto rounded-xl border border-[#E4D9CC] px-8 py-2 text-sm text-[#A89888] hover:bg-[#F7F3EE]"
                  >
                    {playingVideo === id ? 'סגור וידאו' : 'צפייה בשיעור'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>

      <RoomNotes userId={user.id} />
    </div>
  )
}
