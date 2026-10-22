import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Archive,
  Bed,
  Check,
  ChevronLeft,
  CircleCheck,
  Gift,
  Heart,
  Home,
  Lock,
  Pencil,
  Play,
  Plus,
  Ruler,
  Sparkles,
} from 'lucide-react'
import { BrushTitle, Sparkle } from '../components/BrushTitle'
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

const FALLBACK_ROOM = '/assets/hero-background.jpg'

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
              <Ruler className="h-6 w-6 shrink-0 text-[#A89888]" strokeWidth={1.3} />
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

const GENDER_LABELS: Record<string, string> = { boy: 'בנים', girl: 'בנות', unisex: 'יוניסקס' }

function GrowCard({ onGrow }: { onGrow?: () => void }) {
  return (
    <aside className="flex flex-col items-center justify-center rounded-xl border border-[#EDE6DE] bg-[#F8F5F1] px-6 py-8 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_18px_rgba(201,169,145,0.35)]">
        <Sparkle className="h-8 w-8 text-[#C9A991]" />
      </span>
      <h3 className="text-lg font-normal text-[#2F2B28]">המקום שלי כשאגדל</h3>
      <div className="my-3 flex items-center gap-2" aria-hidden="true">
        <span className="h-px w-8 bg-[#D9CBBE]" />
        <Sparkle className="h-2.5 w-2.5 text-[#C9A991]" />
        <span className="h-px w-8 bg-[#D9CBBE]" />
      </div>
      <p className="text-[13px] leading-7 text-[#4A4540]">
        החדר גדל יחד איתם.
        <br />
        כשהגיע הזמן לשלב הבא,
        <br />
        יחכו כאן רעיונות וחבילות חדשות
        <br />
        שמתאימים לגיל החדש.
      </p>
      {onGrow ? (
        <button type="button" onClick={onGrow} className="mt-5 text-sm italic text-[#B39A86] hover:underline">
          נתראה בשלב הבא ♡
        </button>
      ) : (
        <p className="mt-5 text-sm italic text-[#B39A86]">נתראה בשלב הבא ♡</p>
      )}
    </aside>
  )
}

function PurchasedPackageRow({
  pkg,
  child,
  statusMessage,
  imageUrl,
  colors,
  scaleName,
  showGrowCard,
  onOpen,
  onGrow,
}: {
  pkg: ThemePackage
  child?: ChildInfo
  statusMessage?: string
  imageUrl: string
  colors: string[]
  scaleName?: string
  showGrowCard: boolean
  onOpen: () => void
  onGrow?: () => void
}) {
  const accent = colors[2] || '#B39A86'
  const subtitle = [child?.gender ? GENDER_LABELS[child.gender] : '', scaleName].filter(Boolean)

  return (
    <div className={`grid gap-4 ${showGrowCard ? 'lg:grid-cols-[minmax(0,1fr)_210px]' : ''}`}>
      <article className="grid items-center gap-6 rounded-xl border border-[#EDE6DE] bg-white p-3 shadow-[0_4px_18px_rgba(120,100,80,0.05)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        <div className="px-3 py-2 sm:px-5">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-md bg-[#F3EEE8] px-2.5 py-1 text-[11px] text-[#4A4540]">
            <CircleCheck className="h-3.5 w-3.5 text-[#A89888]" strokeWidth={1.5} />
            {child
              ? `מושלם עבור ${child.name}${child.age ? ` (גיל ${child.age})` : ''}`
              : statusMessage || 'חבילה פעילה'}
          </span>
          <h3 className="mb-1 text-2xl font-normal text-[#2F2B28] sm:text-[1.7rem]">
            {child?.theme ? `חבילת ${child.theme}` : pkg.name}
          </h3>
          {subtitle.length > 0 && (
            <p
              className="mb-4 flex items-center gap-1.5 text-base"
              style={{ color: `color-mix(in srgb, ${accent} 75%, #6B4F3A)` }}
            >
              {subtitle.map((part, index) => (
                <span key={part} className="flex items-center gap-1.5">
                  {index > 0 && <Sparkle className="h-2.5 w-2.5" />}
                  {part}
                </span>
              ))}
            </p>
          )}
          <p className="mb-6 text-[13px] leading-7 text-[#4A4540]">{pkg.description}</p>
          <div className="mb-5 flex flex-wrap gap-3">
            {colors.slice(0, 5).map((color) => (
              <div
                key={color}
                className="h-8 w-8 rounded-full border border-[#EDE8E1]"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="mb-3 w-full rounded-md py-2.5 text-sm text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: `color-mix(in srgb, ${accent} 80%, #8A7360)` }}
          >
            הצגת חבילה מלאה
          </button>
          <button
            type="button"
            onClick={onOpen}
            className="mx-auto flex items-center gap-1 text-[13px] text-[#A27A5C] hover:text-[#6B4F3A]"
          >
            מה כוללת החבילה?
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-hidden rounded-md bg-[#F7F4F0]">
          <img
            src={imageUrl || FALLBACK_ROOM}
            alt={`תצוגת ${pkg.name}`}
            className="aspect-[6/5] w-full object-cover"
          />
        </div>
      </article>

      {showGrowCard && <GrowCard onGrow={onGrow} />}
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

  const scaleNameFor = (child?: ChildInfo) =>
    child?.colorPreference ? getColorScaleForPreference(child.colorPreference).name : undefined

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
                <div className="mb-4 space-y-4">
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

                return (
                  <div key={child.name} className="mb-4 space-y-4">
                    {activeEntries.map((entry) => {
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
                            scaleName={scaleNameFor(entryChild)}
                            showGrowCard
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

              <p className="flex items-center justify-center gap-3 rounded-lg border border-[#EDE6DE] bg-[#F8F5F1] px-4 py-3 text-center text-sm text-[#3C3834]">
                <Heart className="h-5 w-5 shrink-0 text-[#C9A991]" strokeWidth={1.3} />
                כל חבילה כוללת פריטים שנבחרו בקפידה, קישורים לרכישה והנחיות לעיצוב שמתאימים לכם.
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
                          scaleName={scaleNameFor(entryChild)}
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

        <p className="mb-2 text-base text-[#5A544E]">הצעות מיוחדות</p>
        <section className="mb-16 rounded-md bg-gradient-to-b from-[#BCAA98] to-[#B09C88] px-6 py-8 sm:px-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
            <div className="text-center text-white md:text-right">
              <Gift className="mx-auto mb-2 h-8 w-8 md:mx-0" strokeWidth={1.25} />
              <h3 className="text-lg font-normal">הנחה לאחים</h3>
              <p className="mt-1 text-sm text-white/90">
                רוצה לעצב חדר לילד נוסף? קבלי 20% הנחה על החבילה הבאה
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/questionnaire')}
              className="rounded-sm bg-white px-6 py-2 text-[13px] text-[#8A7A6B] hover:bg-[#F7F3EE]"
            >
              הוספת חבילה נוספת
            </button>
          </div>
        </section>

        <section className="mb-20">
          <div className="mb-8 text-center">
            <BrushTitle sparkles={false} className="mb-2 text-xl sm:text-2xl">
              ארגז הכלים לביצוע מושלם
            </BrushTitle>
            <p className="text-base text-[#5A544E] sm:text-lg">כל מה שצריך כדי ליישם את העיצוב נכון בחדר שלכם</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: '/assets/icons/checklist.png',
                title: 'צ׳ק ליסט לביצוע מדויק',
                subtitle: 'כל מה שכדאי להכין לפני שמתחילים',
                text: 'שלבים וטיפים ליישום נקי ומדויק של צבע או חיפוי קיר דקורטיבי, בהתאם לחבילה שבחרתם.',
              },
              {
                icon: '/assets/icons/designed-corners.png',
                title: 'יוצרים פינות מעוצבות',
                subtitle: 'מתאימים את העיצוב לחלל שלכם',
                text: 'איך למקם ולשלב את האלמנטים בחדר ליצירת פינות הרמוניות ונעימות.',
              },
              {
                icon: '/assets/icons/center-wall.png',
                title: 'הקיר המרכזי',
                subtitle: 'בוחרים את מוקד העיצוב בחדר',
                text: 'איך לבחור את הקיר הנכון לצבע, חיפוי ותמונות וליצור מוקד עיצובי בחדר.',
              },
            ].map((guide) => (
              <article
                key={guide.title}
                className="flex flex-col rounded-lg border border-[#E3D6C9] bg-white px-6 py-7 text-center"
              >
                <h3 className="text-lg font-medium text-[#2F2B28]">{guide.title}</h3>
                <p className="mt-1 text-[13px] text-[#4A4540]">{guide.subtitle}</p>
                <img src={guide.icon} alt="" className="mx-auto my-6 h-24 w-auto object-contain" />
                <p className="text-[13px] leading-6 text-[#3C3834]">{guide.text}</p>
                <button
                  type="button"
                  onClick={() => navigate('/tips')}
                  className="mx-auto mt-6 inline-flex items-center gap-1 text-sm text-[#A27A5C] hover:text-[#6B4F3A]"
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
            <BrushTitle sparkles={false} className="mb-2 text-xl sm:text-2xl">
              Furniture Masterclass | יסודות החדר
            </BrushTitle>
            <p className="text-base text-[#5A544E] sm:text-lg">
              טיפים מקצועיים לבחירת הרהיטים הגדולים שילוו אתכם שנים
            </p>
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
                className="flex flex-col overflow-hidden rounded-md border border-[#ECE5DD] bg-white text-center shadow-[0_4px_14px_rgba(90,70,40,0.05)]"
              >
                <button
                  type="button"
                  className="relative block w-full overflow-hidden"
                  onClick={() => setPlayingVideo(playingVideo === id ? null : id)}
                >
                  {playingVideo !== id ? (
                    <>
                      <img src={image} alt="" className="aspect-[2.3/1] w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow">
                          <Play className="h-5 w-5 fill-[#3C3834] text-[#3C3834]" />
                        </span>
                      </span>
                    </>
                  ) : (
                    <div className="flex aspect-[2.3/1] w-full items-center justify-center bg-[#3F3A36]/80">
                      <div className="p-6 text-center text-white">
                        <p className="mb-2 text-sm">וידאו: {title}</p>
                        <p className="text-xs opacity-75">כאן יוצג הוידאו המלא</p>
                      </div>
                    </div>
                  )}
                </button>

                <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                  <div className="mb-1 flex items-center justify-center gap-2">
                    <h3 className="text-base font-normal text-[#2F2B28]">{title}</h3>
                    <Icon className="h-5 w-5 text-[#C4A890]" strokeWidth={1.3} />
                  </div>
                  <p className="mb-4 text-[13px] leading-6 text-[#3C3834]">{description}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPlayingVideo(playingVideo === id ? null : id)
                      scrollToMasterclass()
                    }}
                    className="mx-auto mt-auto rounded-sm border border-[#D9C6B5] px-9 py-1.5 text-[13px] text-[#A27A5C] hover:bg-[#F7F3EE]"
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
