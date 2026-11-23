import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Archive,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Heart,
  Lock,
  Pencil,
  Play,
  Plus,
  Ruler,
  Sparkles,
  Sprout,
} from 'lucide-react'
import { Sparkle } from '../components/BrushTitle'
import { Header } from '../components/Header'
import { PageLoading } from '../components/PageLoading'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { displayColorScaleName } from '../data/colorScales'
import type { ThemePackage } from '../data/themePackages'
import { DEFAULT_APPLICATION_GUIDES, useApplicationGuides, useGuideVideos, videoEmbed } from '../utils/guideVideos'
import { getChildPackageEntries, getPackageStatusForChild, hasPurchased, type ChildInfo } from '../utils/auth'
import {
  getAccountRooms,
  packagePath,
  packagePreviewImage,
  packageThemeName,
  roomKids,
  type AccountRoom,
} from '../utils/rooms'
import { formatRoomNames } from '../utils/questionnaire'

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

const SELF_PLACEHOLDERS = ['לבדוק מידות הקיר...', 'להשוות גוונים...', 'לתאם הזמנות...']
const TASK_PLACEHOLDERS = ['לתלות את המדפים...', 'לצבוע את הקיר...', 'להכין את התאורה...']
const MEASURE_PLACEHOLDERS = ['רוחב הקיר...', 'גובה התקרה...', 'מידות המיטה...']
const COLLAPSED_LINES = 3

const CARD = 'rounded-[26px] border border-[#EFE6DC] bg-white shadow-[0_6px_24px_rgba(120,95,70,0.07)]'
const BROWN = '#9C8068'

function NoteCard({
  title,
  icon,
  expanded,
  onToggle,
  onAdd,
  children,
}: {
  title: string
  icon: ReactNode
  expanded: boolean
  onToggle: () => void
  onAdd: () => void
  children: ReactNode
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-[#EFE6DC] bg-[#FDFAF7] p-4">
      <h3 className="mb-3 flex items-center justify-center gap-2 text-[15px] font-medium text-[#3B302A]">
        {icon}
        {title}
      </h3>
      <div className="flex-1 space-y-1">{children}</div>
      {expanded && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-2 flex w-full items-center justify-center gap-1 py-1.5 text-[13px] text-[#A89888]"
        >
          הוספת שורה
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={onToggle}
        className="mt-3 flex items-center justify-center gap-1 border-t border-[#F0E8DF] pt-3 text-[13px] text-[#8A7360] hover:text-[#5F4B3B]"
      >
        {expanded ? 'הצגת פחות' : 'לרשימה המלאה'}
        <ArrowLeft className="h-3.5 w-3.5" />
      </button>
    </article>
  )
}

function RoomNotes({ userId }: { userId: string }) {
  const storageKey = `petite-room-notes:${userId}`
  const [expanded, setExpanded] = useState<'self' | 'tasks' | 'measures' | null>(null)
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
  const addLine = (key: 'self' | 'measures') =>
    setNotes((current) => ({ ...current, [key]: [...current[key], ''] }))
  const toggleList = (key: 'self' | 'tasks' | 'measures') => setExpanded((open) => (open === key ? null : key))
  const visible = <T,>(key: 'self' | 'tasks' | 'measures', lines: T[]) =>
    expanded === key ? lines : lines.slice(0, COLLAPSED_LINES)

  const lineInput = 'w-full border-b border-[#F0E8DF] bg-transparent py-2 text-[13px] text-[#4A4540] outline-none placeholder:text-[#B9AEA3]'

  return (
    <section className={`${CARD} px-4 py-7 sm:px-7`}>
      <div className="mb-6 text-center">
        <h2 className="mb-1 flex items-center justify-center gap-2 text-2xl font-medium text-[#3B302A]">
          הפתקים שלי
          <CalendarDays className="h-6 w-6 text-[#A08670]" strokeWidth={1.4} />
        </h2>
        <p className="text-sm text-[#6F655C]">רשימות קצרות, רעיונות וטיפים שימושיים מהנסיון שלי.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <NoteCard
          title="מדדתי ושמרתי"
          icon={<Ruler className="h-5 w-5 text-[#A08670]" strokeWidth={1.4} />}
          expanded={expanded === 'measures'}
          onToggle={() => toggleList('measures')}
          onAdd={() => addLine('measures')}
        >
          {visible('measures', notes.measures).map((line, index) => (
            <input
              key={`measure-${index}`}
              value={line}
              onChange={(event) => updateLine('measures', index, event.target.value)}
              placeholder={MEASURE_PLACEHOLDERS[index] ?? 'מידה נוספת...'}
              className={lineInput}
            />
          ))}
        </NoteCard>

        <NoteCard
          title="עוד רגע קורה"
          icon={<Heart className="h-5 w-5 text-[#A08670]" strokeWidth={1.4} />}
          expanded={expanded === 'tasks'}
          onToggle={() => toggleList('tasks')}
          onAdd={() =>
            setNotes((current) => ({
              ...current,
              tasks: [...current.tasks, { id: crypto.randomUUID(), text: '', done: false }],
            }))
          }
        >
          {visible('tasks', notes.tasks).map((task, index) => (
            <label key={task.id} className="flex items-center gap-2 border-b border-[#F0E8DF] py-1.5">
              <button
                type="button"
                aria-label={task.done ? 'סימון המשימה כלא הושלמה' : 'סימון המשימה כהושלמה'}
                onClick={() =>
                  setNotes((current) => ({
                    ...current,
                    tasks: current.tasks.map((item) => (item.id === task.id ? { ...item, done: !item.done } : item)),
                  }))
                }
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                  task.done ? 'border-[#A08670] bg-[#A08670] text-white' : 'border-[#CDBFB1] bg-white'
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
                className={`w-full bg-transparent text-[13px] outline-none placeholder:text-[#B9AEA3] ${
                  task.done ? 'text-[#B5A99A] line-through' : 'text-[#4A4540]'
                }`}
              />
            </label>
          ))}
        </NoteCard>

        <NoteCard
          title="פתק לעצמי"
          icon={<Pencil className="h-5 w-5 text-[#A08670]" strokeWidth={1.4} />}
          expanded={expanded === 'self'}
          onToggle={() => toggleList('self')}
          onAdd={() => addLine('self')}
        >
          {visible('self', notes.self).map((line, index) => (
            <input
              key={`self-${index}`}
              value={line}
              onChange={(event) => updateLine('self', index, event.target.value)}
              placeholder={SELF_PLACEHOLDERS[index] ?? 'עוד משהו לזכור...'}
              className={lineInput}
            />
          ))}
        </NoteCard>
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#A39587]">
        <Lock className="h-3.5 w-3.5" />
        נשמר אוטומטית באזור האישי שלכם
      </p>
    </section>
  )
}

function RoomCard({
  title,
  theme,
  imageUrl,
  colors,
  note,
  onOpen,
}: {
  title: string
  theme: string
  imageUrl: string
  colors: string[]
  note?: string
  onOpen: () => void
}) {
  return (
    <article className={`${CARD} flex flex-col p-3 text-center`}>
      <button type="button" onClick={onOpen} className="block overflow-hidden rounded-[20px]" aria-label={title}>
        <img src={imageUrl} alt="" className="aspect-[4/3] w-full object-cover transition-transform hover:scale-[1.02]" />
      </button>
      <h3 className="mt-3 text-xl font-medium text-[#3B302A]">{title}</h3>
      <p className="text-[15px] text-[#5F554C]">{theme}</p>
      <div className="my-3 flex justify-center gap-1.5">
        {colors.slice(0, 4).map((color) => (
          <span
            key={color}
            className="h-4 w-4 rounded-full border border-[#EDE6DE]"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      {note && <p className="mb-2 text-xs text-[#A0806A]">{note}</p>}
      <button
        type="button"
        onClick={onOpen}
        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: BROWN }}
      >
        כניסה לחבילה
        <ArrowLeft className="h-4 w-4" />
      </button>
    </article>
  )
}

function ActionCard({
  title,
  text,
  icon,
  badge,
  oneLine = false,
  onClick,
}: {
  title: string
  text: string
  icon: ReactNode
  badge?: string
  oneLine?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${CARD} flex w-full items-center gap-3 px-4 py-5 text-right transition-colors hover:bg-[#FDFAF7] sm:gap-4 sm:px-6`}
    >
      <span className="flex w-14 shrink-0 justify-center text-[#9C7E66] sm:w-20">{icon}</span>
      <span className="h-14 w-px shrink-0 bg-[#E6DACE]" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span
          className={`block font-medium text-[#3B302A] ${
            oneLine ? 'whitespace-nowrap text-[17px] sm:text-2xl' : 'text-xl sm:text-2xl'
          }`}
        >
          {title}
        </span>
        <span className="mt-1 block text-[13px] leading-6 text-[#5F554C] sm:text-sm">{text}</span>
        {badge && (
          <span className="mt-2 inline-block max-w-full whitespace-nowrap rounded-full bg-[#EFE4D9] px-2.5 py-1 text-[12px] leading-5 text-[#7A6150]">
            {badge}
          </span>
        )}
      </span>
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: '#B49A84' }}
      >
        <ArrowLeft className="h-5 w-5" />
      </span>
    </button>
  )
}

const GUIDE_ICONS = ['/assets/icons/checklist.png', '/assets/icons/designed-corners.png', '/assets/icons/center-wall.png']

const DEFAULT_LESSONS = [
  {
    id: 'corner',
    image: '/assets/masterclass-corner.png',
    title: 'הפינה המושלמת',
    description: 'איך לבחור מיטה ושידה שלא תופסות את כל החדר.',
  },
  {
    id: 'cabinet',
    image: '/assets/masterclass-storage.png',
    title: 'אחסון חכם',
    description: 'איך לתכנן ארונות ומדפים שנשארים מסודרים גם כשהילד גדל.',
  },
  {
    id: 'play',
    image: '/assets/masterclass-play.png',
    title: 'משחקים או למידה?',
    description: 'פינה אחת שאפשר לשחק בה וגם להכין בה שיעורים.',
  },
]

function mergeGuideVideos(
  edited: { id: string; title: string; description: string; image: string; videoUrl: string }[] | null,
) {
  if (!edited) return DEFAULT_LESSONS.map((lesson) => ({ ...lesson, videoUrl: '' }))
  return edited.map((lesson, index) => {
    const base = DEFAULT_LESSONS.find((d) => d.id === lesson.id) || DEFAULT_LESSONS[index % DEFAULT_LESSONS.length]
    return {
      id: lesson.id,
      title: lesson.title || base.title,
      description: lesson.description || base.description,
      image: lesson.image || base.image,
      videoUrl: lesson.videoUrl,
    }
  })
}

function GuideVideoPlayer({ title, url }: { title: string; url: string }) {
  const embed = videoEmbed(url)
  if (!embed) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-[#3F3A36]/80">
        <div className="p-4 text-center text-white">
          <p className="mb-1 text-sm">וידאו: {title}</p>
          <p className="text-xs opacity-75">השיעור יעלה בקרוב</p>
        </div>
      </div>
    )
  }
  return embed.kind === 'iframe' ? (
    <iframe
      src={`${embed.src}?autoplay=1`}
      title={title}
      className="aspect-video w-full rounded-2xl"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
    />
  ) : (
    <video src={embed.src} controls autoPlay className="aspect-video w-full rounded-2xl bg-black" />
  )
}

function RoomBasics() {
  const guideVideos = useGuideVideos()
  const [playing, setPlaying] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const lessons = mergeGuideVideos(guideVideos ?? null)

  const scrollBy = (direction: 1 | -1) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: -direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className={`${CARD} px-4 py-7 sm:px-7`}>
      <div className="mb-5 text-center">
        <h2 className="mb-1 text-2xl font-medium text-[#3B302A]">יסודות החדר</h2>
        <p className="text-sm text-[#6F655C]">סדרת וידאו קצרה עם כל מה שצריך לדעת לעיצוב חדר ילדים מוצלח.</p>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="השיעור הקודם"
          className="absolute top-[38%] -right-2 z-10 hidden h-9 w-9 items-center justify-center rounded-full bg-white text-[#6F655C] shadow sm:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div
          ref={track}
          onScroll={(event) => {
            const el = event.currentTarget
            setPage(Math.round(Math.abs(el.scrollLeft) / Math.max(1, el.clientWidth * 0.8)))
          }}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none]"
        >
          {lessons.map(({ id, image, title, description, videoUrl }) => (
            <article key={id} className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)]">
              {playing === id ? (
                <GuideVideoPlayer title={title} url={videoUrl} />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(id)}
                  className="relative block w-full overflow-hidden rounded-2xl"
                  aria-label={`צפייה בשיעור ${title}`}
                >
                  <img src={image} alt="" className="aspect-video w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow">
                      <Play className="h-5 w-5 fill-[#3C3834] text-[#3C3834]" />
                    </span>
                  </span>
                </button>
              )}
              <h3 className="mt-2 text-center text-[15px] text-[#3B302A]">{title}</h3>
              <p className="text-center text-xs leading-5 text-[#8A7F75]">{description}</p>
            </article>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="השיעור הבא"
          className="absolute top-[38%] -left-2 z-10 hidden h-9 w-9 items-center justify-center rounded-full bg-white text-[#6F655C] shadow sm:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      <div className={`mt-3 flex justify-center gap-1.5 ${lessons.length > 3 ? '' : 'sm:hidden'}`} aria-hidden="true">
        {lessons.map((lesson, index) => (
          <span
            key={lesson.id}
            className={`h-1.5 w-1.5 rounded-full ${index === Math.min(page, lessons.length - 1) ? 'bg-[#A08670]' : 'bg-[#E3D8CC]'}`}
          />
        ))}
      </div>
    </section>
  )
}

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('he-IL') : '')

function ArchiveView({
  entries,
  imageFor,
  onOpen,
  onBack,
}: {
  entries: { child: ChildInfo; pkg: ThemePackage }[]
  imageFor: (pkg: ThemePackage) => string
  onOpen: (pkg: ThemePackage, child: ChildInfo) => void
  onBack: () => void
}) {
  const rooms = new Map<string, { child: ChildInfo; pkg: ThemePackage }[]>()
  for (const entry of [...entries].sort((a, b) => b.child.purchaseDate.localeCompare(a.child.purchaseDate))) {
    const key = entry.child.roomId || entry.child.name
    if (!rooms.has(key)) rooms.set(key, [])
    rooms.get(key)!.push(entry)
  }

  return (
    <section className={`${CARD} px-4 py-7 sm:px-7`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-medium text-[#3B302A]">
          <Archive className="h-5 w-5 text-[#A08670]" strokeWidth={1.5} />
          ארכיון החבילות
        </h2>
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-[#8A7A6B] hover:underline">
          חזרה לחדרים שלי
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-6 text-sm text-[#7A7068]">
        כאן נשמרות חבילות קודמות שהוחלפו בעיצוב חדש לאותו חדר. כל התוכן המקורי נשאר זמין לצפייה.
      </p>
      <div className="space-y-8">
        {[...rooms.entries()].map(([roomKey, roomEntries]) => (
          <div key={roomKey}>
            <h3 className="mb-3 text-lg text-[#4A4540]">החדר של {formatRoomNames(roomKids(roomEntries[0].child))}</h3>
            <div className="space-y-3">
              {roomEntries.map(({ child, pkg }) => (
                <article
                  key={`${child.packageId}-${child.purchaseDate}`}
                  className="flex items-center gap-4 rounded-2xl border border-[#EFE6DC] bg-[#FDFAF7] p-3"
                >
                  <img src={imageFor(pkg)} alt="" className="h-20 w-24 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[#3B302A]">{child.theme ? `חבילת ${child.theme}` : pkg.name}</p>
                    <p className="text-xs text-[#A39A8F]">
                      נרכשה ב־{formatDate(child.purchaseDate)} · הועברה לארכיון ב־{formatDate(child.archivedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpen(pkg, child)}
                    className="shrink-0 rounded-full border border-[#E2D8CC] bg-white px-4 py-2 text-sm text-[#5A544E] hover:bg-[#F8F4EF]"
                  >
                    לצפייה
                  </button>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function AccountPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { packages, getPackageById, getPackageContent, getColorScaleForPreference } = useData()
  const [showArchive, setShowArchive] = useState(false)
  const applicationGuides = useApplicationGuides()

  if (loading) {
    return <PageLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const allEntries = getChildPackageEntries(user, packages, getPackageById)
  const archivedEntries = allEntries.filter((entry) => entry.child.archivedAt)
  const rooms = getAccountRooms(user, packages, getPackageById)
  // Packages bought before children were recorded.
  const orphanPackages = packages.filter(
    (pkg) => hasPurchased(user, pkg.id) && !allEntries.some((entry) => entry.pkg.id === pkg.id),
  )
  const hasAnything = rooms.length > 0 || orphanPackages.length > 0

  const colorsFor = (pkg: ThemePackage, child?: ChildInfo) => {
    const fromScale = getColorScaleForPreference(child?.colorPreference || '').colors.map((c) => c.hex)
    return fromScale.length > 0 ? fromScale : pkg.colorPalette
  }
  const imageFor = (pkg: ThemePackage) => packagePreviewImage(getPackageContent(pkg.id))
  const roomNote = (room: AccountRoom) =>
    getPackageStatusForChild(room.pkg, room.entry).status === 'active' ? undefined : 'הגיע הזמן לשלב הבא ✦'

  const guides = (applicationGuides ?? DEFAULT_APPLICATION_GUIDES).map((entry, index) => ({
    ...entry,
    icon: GUIDE_ICONS[index % GUIDE_ICONS.length],
    hasBody: Boolean(entry.body?.trim()),
  }))

  return (
    <div className="min-h-screen bg-[#FAF5F0]">
      <Header />

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-6">
        {showArchive ? (
          <ArchiveView
            entries={archivedEntries}
            imageFor={imageFor}
            onOpen={(pkg, child) =>
              navigate(`/package/${pkg.id}${child.orderItemId ? `?item=${encodeURIComponent(child.orderItemId)}` : ''}`)
            }
            onBack={() => setShowArchive(false)}
          />
        ) : (
          <>
            <section className="relative text-center">
              <h1 className="flex items-center justify-center gap-2.5 text-[2rem] font-medium leading-tight text-[#3B302A] sm:gap-3 sm:text-4xl">
                <Sparkle className="h-3.5 w-3.5 shrink-0 text-[#C9A991] sm:h-4 sm:w-4" />
                <span>החדרים שלי</span>
                <Sparkle className="h-3.5 w-3.5 shrink-0 text-[#C9A991] sm:h-4 sm:w-4" />
              </h1>
              <p className="mx-auto mt-3 inline-block max-w-md rounded-2xl bg-[#EFE6DE] px-5 py-2.5 text-[15px] font-medium leading-6 text-[#3B302A] sm:text-base">
                כל חבילות העיצוב שרכשתם במקום אחד,
                <br />
                כולל טיפים וכל מה שצריך כדי ליישם אותן.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:absolute sm:top-1 sm:left-0 sm:mt-0 sm:flex-col sm:items-end">
                {rooms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate('/account/rooms')}
                    className="inline-flex items-center gap-1.5 border-b border-[#3B302A] pb-0.5 text-[13px] text-[#3B302A] hover:text-[#8A7360]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    עדכון חלוקת החדרים
                  </button>
                )}
                {archivedEntries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowArchive(true)}
                    className="inline-flex items-center gap-1.5 text-[13px] text-[#8A7360] hover:underline"
                  >
                    <Archive className="h-3.5 w-3.5" strokeWidth={1.5} />
                    ארכיון חבילות ({archivedEntries.length})
                  </button>
                )}
              </div>
            </section>

            {!hasAnything ? (
              <section className={`${CARD} px-6 py-14 text-center`}>
                <Sparkles className="mx-auto mb-5 h-8 w-8 text-[#C4B8A8]" strokeWidth={1.25} />
                <h2 className="mb-2 text-2xl font-light text-[#4A4A4A]">עדיין אין חבילות</h2>
                <p className="mb-8 text-sm text-[#8B8B8B]">התחילו ליצור את חדר החלומות של הילדים.</p>
                <button
                  type="button"
                  onClick={() => navigate('/questionnaire')}
                  className="rounded-full px-7 py-2.5 text-sm text-white"
                  style={{ backgroundColor: BROWN }}
                >
                  יצירת החבילה הראשונה
                </button>
              </section>
            ) : (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.key}
                    title={`החדר של ${room.names}`}
                    theme={[packageThemeName(room), displayColorScaleName(room.entry.colorPreference || '')].filter(Boolean).join(' · ')}
                    imageUrl={imageFor(room.pkg)}
                    colors={colorsFor(room.pkg, room.entry)}
                    note={roomNote(room)}
                    onOpen={() => navigate(packagePath(room))}
                  />
                ))}
                {orphanPackages.map((pkg) => (
                  <RoomCard
                    key={pkg.id}
                    title={pkg.name}
                    theme="חבילה פעילה"
                    imageUrl={imageFor(pkg)}
                    colors={colorsFor(pkg)}
                    onOpen={() => navigate(`/package/${pkg.id}`)}
                  />
                ))}
              </section>
            )}

            {rooms.length > 0 && (
              <ActionCard
                title="המקום שלי כשאגדל"
                text="הילדים גדלים והצרכים משתנים. בחרו חבילת עיצוב חדשה שמתאימה לגילם ולחלומות שלהם."
                icon={<Sprout className="h-12 w-12" strokeWidth={1.1} />}
                onClick={() => navigate('/account/grow')}
              />
            )}
            <ActionCard
              title="מעצבים חדר נוסף"
              oneLine
              text="גם לילד נוסף מגיע חדר מלא קסם. בחרו חבילת עיצוב שמתאימה בדיוק לו."
              icon={<DoorOpen className="h-12 w-12" strokeWidth={1.1} />}
              badge={hasAnything ? '20% הנחה על חדר נוסף' : undefined}
              onClick={() => navigate('/questionnaire')}
            />

            <section id="toolbox" className={`${CARD} scroll-mt-24 px-4 py-7 sm:px-7`}>
              <div className="mb-5 text-center">
                <h2 className="mb-1 text-2xl font-medium text-[#3B302A]">ארגז הכלים לביצוע מושלם</h2>
                <p className="text-sm text-[#6F655C]">כל מה שיעזור לכם לתכנן, ליישם ולהשלים את העיצוב.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {guides.map((guide) => (
                  <button
                    key={guide.id}
                    type="button"
                    onClick={() => navigate(guide.hasBody ? `/guides/${guide.id}` : '/tips')}
                    className="flex flex-col items-center rounded-2xl border border-[#EFE6DC] bg-[#FDFAF7] px-2 py-4 text-center transition-colors hover:bg-[#F7F0E8] sm:px-4 sm:py-6"
                  >
                    <img src={guide.icon} alt="" className="mb-3 h-12 w-auto object-contain sm:h-16" />
                    <h3 className="text-[13px] font-medium leading-5 text-[#3B302A] sm:text-base">{guide.title}</h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#6F655C] sm:text-[13px]">{guide.subtitle}</p>
                  </button>
                ))}
              </div>
            </section>

            <RoomBasics />

            <RoomNotes userId={user.id} />

            <p className="flex items-center justify-center gap-2 pt-2 text-center text-xs text-[#A39587]">
              <Sparkle className="h-2.5 w-2.5 text-[#C9A991]" />
              כל חבילה כוללת פריטים שנבחרו בקפידה, קישורים לרכישה והנחיות לעיצוב שמתאימים לכם.
            </p>
          </>
        )}
      </main>
    </div>
  )
}
