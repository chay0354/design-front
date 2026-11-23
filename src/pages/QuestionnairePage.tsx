import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getYearsSincePurchase } from '../utils/auth'
import { trackQuestionnaire } from '../utils/tracking'
import {
  ArrowLeft,
  Atom,
  Bird,
  Bone,
  Car,
  Cloud,
  Compass,
  Crown,
  FerrisWheel,
  Fish,
  Flower2,
  Gamepad2,
  Heart,
  Info,
  Leaf,
  Minus,
  MoonStar,
  Mountain,
  Music,
  PaintRoller,
  Palette,
  PawPrint,
  Plus,
  Rainbow,
  Rocket,
  Shell,
  Ship,
  Shirt,
  Sparkles,
  Users,
  Star,
  Tent,
  TreePine,
  Trophy,
  User,
  Waves,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Sparkle } from '../components/BrushTitle'
import { Header } from '../components/Header'
import { Slider } from '../components/ui/slider'
import { useData } from '../contexts/DataContext'
import { getQuestionnaireOptionsForScales } from '../data/colorScales'
import { filterColorScalesForChild } from '../data/themeColorScales'
import {
  buildQuestionnaireSteps,
  emptyRoom,
  formatRoomNames,
  getQuestionnaireThemesForChild,
  getAgeGroupIdForAge,
  normalizeRoom,
  roomDesignProfile,
  roomOrderMeta,
  isCrossAgeRoom,
  type AgeChoice,
  type CatalogGender,
  type QuestionnaireRoom,
  type RoomChild,
} from '../utils/questionnaire'
import { getAgeGroup } from '../data/packageCatalog'

const genderOptions = [
  { value: 'boy' as const, label: 'בן' },
  { value: 'girl' as const, label: 'בת' },
]

function GirlIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="7" r="3.5" />
      <path d="M6 20v-1.5a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4V20" />
      <path d="M8.5 7.5 7 11" />
      <path d="M15.5 7.5 17 11" />
    </svg>
  )
}

/** Flying hero with cape — replaces the theater-masks glyph. */
function SuperheroIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="14.5" cy="5.2" r="2.1" />
      <path d="M13.6 7.4 9.2 13.8" />
      <path d="M12.8 9.2 6.2 6.8" />
      <path d="M12.2 10.4 14.2 13" />
      <path d="M13.2 8.2c2.8.6 5 2.8 6.2 6.2-2.2-.4-4.2.4-5.8 2.2" />
      <path d="M9.2 13.8 6.4 19.2" />
      <path d="M9.2 13.8 12.2 18.6" />
    </svg>
  )
}

const themeIcons: Record<string, LucideIcon> = {
  safari: PawPrint,
  adventures: Compass,
  'sea-ships': Ship,
  transport: Car,
  dinosaurs: Bone,
  gamers: Gamepad2,
  science: Atom,
  sports: Trophy,
  'flowers-dream-garden': Flower2,
  'magical-forest-animals': PawPrint,
  'moon-stars-sky': MoonStar,
  'sea-shells-treasures': Shell,
  'fairies-magic-forest': Sparkles,
  'fairytales-princesses': Crown,
  'unicorn-rainbow': Rainbow,
  'butterflies-birds': Bird,
  'floral-boho': Flower2,
  'fashion-style': Shirt,
  'music-dance-stage': Music,
  'sea-surfing-freedom': Waves,
  'nordic-forest': TreePine,
  'clouds-dreams': Cloud,
  'pastel-safari': PawPrint,
  'beaches-shells': Shell,
  'camping-nature': Tent,
  underwater: Fish,
  'sky-stars': Star,
  'circus-magic': FerrisWheel,
  'journeys-discovery': Compass,
  'nature-adventure': Mountain,
  'music-world': Music,
  'creation-inspiration': Palette,
  space: Rocket,
  'nature-explore': Leaf,
}

function ThemeGlyph({ themeId }: { themeId: string }) {
  if (themeId === 'junior-superheroes' || themeId === 'superheroes') {
    return <SuperheroIcon className="h-9 w-9 text-[#C4B39A]" />
  }
  const Icon = themeIcons[themeId] ?? Sparkles
  return <Icon className="h-9 w-9 text-[#C4B39A]" strokeWidth={1.4} />
}

function ThemePicker({
  title,
  gender,
  age,
  value,
  onChange,
  crossAge,
}: {
  title: ReactNode
  gender: CatalogGender
  age: number
  value: string
  onChange: (theme: string) => void
  crossAge?: boolean
}) {
  const themes = getQuestionnaireThemesForChild(gender, age)
  const ageGroup = getAgeGroup(getAgeGroupIdForAge(age))

  return (
    <div>
      <h2 className="mb-2 text-center text-[1.7rem] font-light text-[#3C3834] sm:text-3xl">{title}</h2>
      {crossAge ? (
        <div className="mb-6 flex items-start gap-2 rounded-2xl bg-[#F8F4EF] px-4 py-3 text-sm leading-6 text-[#6F6A64]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#C4B39A]" strokeWidth={1.6} />
          <p>
            הילדים בחדר בגילאים שונים, ולכן ריכזנו נושאים חוצי גילאים — נושאים שמתאימים לחדר משותף, כך שהחדר לא ירגיש
            קטן מדי לגדול/ה ולא גדול מדי לקטן/ה. בסוף תתקבל חבילת עיצוב אחת לחדר המשותף.
          </p>
        </div>
      ) : (
        <p className="mb-6 text-center text-[#8A847C]">נושאים מותאמים ל{ageGroup.label.toLowerCase()}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => {
          const isSelected = value === theme.name
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.name)}
              className={`flex flex-col items-center gap-3 rounded-2xl border px-3 py-6 text-center transition-all ${
                isSelected
                  ? 'border-[#D2CECA] bg-[#EEECEA] shadow-[0_2px_10px_rgba(120,115,110,0.1)]'
                  : 'border-[#E7E1D8] bg-white hover:border-[#D4C4B0]'
              }`}
            >
              <ThemeGlyph themeId={theme.id} />
              <span className="text-[15px] text-[#4A4540]">{theme.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function scaleTitle(label: string) {
  return label.replace(/[\s\uFE0F]*\p{Extended_Pictographic}\uFE0F?/gu, '').trim()
}

function swatchLuminance(hex: string) {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  return red * 0.299 + green * 0.587 + blue * 0.114
}

function PaletteIcon({ scaleId }: { scaleId: string }) {
  const stroke = '#A89888'
  if (scaleId === 'soft-pinks') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <circle cx="16" cy="17" r="4" fill="#E7B7C0" />
        <circle cx="10.5" cy="13" r="3.2" fill="#F0C9CF" />
        <circle cx="21.5" cy="13" r="3.2" fill="#F0C9CF" />
        <circle cx="11" cy="21" r="3.2" fill="#E3A8B4" />
        <circle cx="21" cy="21" r="3.2" fill="#E3A8B4" />
        <circle cx="16" cy="17" r="1.6" fill="#C98492" />
      </svg>
    )
  }
  if (scaleId === 'elegant-grays') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path d="M16 6l1.2 4.2L21.5 11.4l-4.3 1.2L16 17l-1.2-4.4-4.3-1.2 4.3-1.2L16 6z" fill="#C8C2BA" />
        <path d="M23 16l.7 2.4 2.3.7-2.3.7-.7 2.4-.7-2.4-2.3-.7 2.3-.7L23 16z" fill="#B7B1A8" />
        <path d="M9.5 18l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6.6-2z" fill="#D5D0C8" />
      </svg>
    )
  }
  if (scaleId === 'happy-colorful') {
    return (
      <svg viewBox="0 0 36 28" className="h-7 w-9" aria-hidden="true">
        <path d="M4 20c4-8 8-12 14-12s10 4 14 12" fill="none" stroke="#C9A27A" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M7.5 20c3.2-6 6.4-9 10.5-9s7.3 3 10.5 9" fill="none" stroke="#B7C4A4" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M11 20c2.2-4 4.4-6 7-6s4.8 2 7 6" fill="none" stroke="#E4C2A8" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  }
  if (scaleId === 'calming-blues') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path d="M4 18c3 0 3-3 6-3s3 3 6 3 3-3 6-3 3 3 6 3" fill="none" stroke="#7FA4B8" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 23c3 0 3-3 6-3s3 3 6 3 3-3 6-3 3 3 6 3" fill="none" stroke="#A9C6D4" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }
  if (scaleId === 'sunny-yellows') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <circle cx="16" cy="16" r="5" fill="#E8C878" />
        <g stroke="#D4B56A" strokeWidth="1.4" strokeLinecap="round">
          <path d="M16 5v3M16 24v3M5 16h3M24 16h3M8.2 8.2l2.1 2.1M21.7 21.7l2.1 2.1M23.8 8.2l-2.1 2.1M10.3 21.7l-2.1 2.1" />
        </g>
      </svg>
    )
  }
  if (scaleId === 'fresh-greens' || scaleId === 'warm-natural') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path d="M16 26V14" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M16 18c-5-1-8-5-8-9 5 0 8 4 8 9z" fill="#C5D4B4" stroke="#8A9A78" strokeWidth="1.1" />
        <path d="M16 16c5-1 8-5 8-9-5 0-8 4-8 9z" fill="#D5E0C8" stroke="#8A9A78" strokeWidth="1.1" />
      </svg>
    )
  }
  return null
}

function ColorPalettePreview({
  swatches,
}: {
  swatches: { hex: string; name: string }[]
}) {
  const ordered = [...swatches].sort((a, b) => swatchLuminance(a.hex) - swatchLuminance(b.hex))

  return (
    <div className="flex h-10 overflow-hidden rounded-md" dir="ltr">
      {ordered.map((swatch, index) => (
        <div
          key={`${swatch.hex}-${index}`}
          className="min-w-0 flex-1"
          style={{ backgroundColor: swatch.hex }}
          title={swatch.name}
        />
      ))}
          </div>
  )
}

function ColorPicker({
  gender,
  age,
  theme,
  value,
  room,
  onChange,
}: {
  gender: CatalogGender
  age: number
  theme: string
  value: string
  room: QuestionnaireRoom
  onChange: (colorPreference: string) => void
}) {
  const { colorScales } = useData()
  const options = getQuestionnaireOptionsForScales(
    filterColorScalesForChild(colorScales, gender, age, theme),
  )

  return (
    <div className="rounded-lg bg-[#F8F4EF] px-3 py-6 sm:px-8 sm:py-8">
      <h2 className="mb-2 text-center text-[1.55rem] font-light leading-snug text-[#3C3834] sm:text-[1.9rem]">
        <span className="mx-auto flex w-full max-w-full items-center justify-center gap-2">
          <Sparkle className="h-3 w-3 shrink-0 text-[#D2A98F] sm:h-3.5 sm:w-3.5" />
          <span className="min-w-0 text-balance">בחרי את סקלת הגוונים</span>
          <Sparkle className="h-3 w-3 shrink-0 text-[#D2A98F] sm:h-3.5 sm:w-3.5" />
        </span>
        <span className="mt-1 block text-[1.2rem] sm:text-[1.35rem]">{roomPhrase(room, 'le')}</span>
      </h2>
      <p className="mb-8 text-center text-base text-[#7A726A]">סגנונות מותאמים לחלומות גדולים</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {options.map((pref) => {
          const isSelected = value === pref.name
          return (
            <button
              key={pref.scaleId}
              type="button"
              onClick={() => onChange(pref.name)}
              className={`rounded-lg border bg-[#FDFBF9] px-3.5 pt-4 pb-5 text-center transition-all ${
                isSelected
                  ? 'border-[#C9B5A3] shadow-[0_6px_20px_rgba(168,138,114,0.2)] ring-1 ring-[#C9B5A3]'
                  : 'border-[#E3DBD2] shadow-[0_2px_8px_rgba(120,100,80,0.06)] hover:border-[#D4C4B0]'
              }`}
            >
              <ColorPalettePreview swatches={pref.swatches} />
              <div className="mt-4 flex flex-col items-center gap-1.5">
                <PaletteIcon scaleId={pref.scaleId} />
                <h3 className="flex items-center gap-2 text-center text-[1.6rem] font-light leading-tight text-[#3C3834]">
                  {isSelected && <Sparkle className="h-3 w-3 text-[#B39A86]" />}
                  {scaleTitle(pref.name)}
                  {isSelected && <Sparkle className="h-3 w-3 text-[#B39A86]" />}
                </h3>
            </div>
              {pref.benefit && (
                <p className="mx-auto mt-1.5 max-w-[17rem] text-[13px] leading-6 text-[#6F6760]">{pref.benefit}</p>
              )}
            </button>
          )
        })}
      </div>
      <div className="mt-6 flex items-center gap-2" aria-hidden="true">
        <span className="h-px flex-1 bg-[#E9E1D8]" />
        <Heart className="h-3 w-3 text-[#B8A899]" strokeWidth={1.4} />
        <span className="h-px flex-1 bg-[#E9E1D8]" />
      </div>
      <p className="mt-2 flex items-center justify-center gap-2 text-center text-[13px] text-[#5A544E]">
        <Leaf className="h-4 w-4 shrink-0 text-[#B8AD9C]" strokeWidth={1.4} />
        כל סקלת צבעים נבחרה בקפידה כדי ליצור חלל שמזין את הדמיון, מרגיע את הלב ומלווה את הילד להתפתחות.
      </p>
    </div>
  )
}

function WallDesignPicker({
  value,
  room,
  onChange,
}: {
  value: string
  room: QuestionnaireRoom
  onChange: (wallDesignOption: string) => void
}) {
  const options = [
    {
      value: 'covering',
      title: 'חיפוי קיר דקורטיבי',
      text: 'פתרון מעוצב ללא לכלוך של צבע, עם אפשרות להסרה בקלות.',
      image: '/assets/wall-panel.jpg',
      icon: <PanelIcon />,
    },
    {
      value: 'paint',
      title: 'קיר מרכזי בצביעה',
      text: 'צביעת קיר אחד – עבודה פשוטה יחסית. בסיס על-זמני שמתאים לכל גיל.',
      image: '/assets/wall-paint.jpg',
      icon: <PaintRoller className="h-12 w-12" strokeWidth={1} />,
    },
  ]

  return (
            <div>
      <h2 className="mb-2 text-center text-2xl font-light text-[#3C3834] sm:text-[2rem]">
        איך תרצו לעצב את הקיר המרכזי
        <br />
        {roomPhrase(room, 'be')}?
              </h2>
      <p className="mb-6 text-center text-sm text-[#6B6B6B]">בחר/י את האופציה המתאימה {roomPhrase(room, 'le')}</p>
      <div className="grid gap-5 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = value === option.value
          return (
                  <button
                    key={option.value}
                    type="button"
              onClick={() => onChange(option.value)}
              className={`overflow-hidden rounded-md border bg-white text-right transition-all ${
                isSelected
                  ? 'border-[#C9B5A3] shadow-[0_6px_20px_rgba(168,138,114,0.2)] ring-1 ring-[#C9B5A3]'
                  : 'border-[#E3DBD2] hover:border-[#D4C4B0]'
              }`}
            >
              <img src={option.image} alt="" className="aspect-[3/2] w-full object-cover" />
              <div className="flex items-start justify-between gap-3 px-4 py-4">
                <div>
                  <h3 className="mb-1.5 flex items-center gap-2 text-lg font-medium text-[#3C3834] sm:text-xl">
                    {option.title}
                    {isSelected && <Sparkle className="h-3 w-3 text-[#B39A86]" />}
                  </h3>
                  <p className="text-[13px] leading-6 text-[#5A544E]">{option.text}</p>
                    </div>
                <span className="shrink-0 text-[#C2A893]">{option.icon}</span>
              </div>
                  </button>
          )
        })}
              </div>
            </div>
  )
}

function PanelIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="6" y="6" width="28" height="28" rx="1" />
      <path d="M6 9h28M6 31h28M12 9v22M18 9v22M24 9v22M30 9v22" />
    </svg>
  )
}

export function QuestionnairePage() {
  const navigate = useNavigate()
  const { colorScales } = useData()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [stepIndex, setStepIndex] = useState(0)

  // "New design for these rooms": start from each room's children (ages updated since purchase).
  const redesignRoomIds = (searchParams.get('roomId') || '').split(',').filter(Boolean)
  const redesignEntries = redesignRoomIds.flatMap((roomId) => {
    const entry = [...(user?.children || [])]
      .filter((child) => child.roomId === roomId && !child.archivedAt && child.roomChildren?.length)
      .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))[0]
    return entry ? [entry] : []
  })
  const [rooms, setRooms] = useState<QuestionnaireRoom[]>(() => {
    if (redesignEntries.length === 0) return [emptyRoom()]
    return redesignEntries.map((entry) => {
      const years = Math.floor(getYearsSincePurchase(entry.purchaseDate))
      return normalizeRoom({
        ...emptyRoom(),
        roomId: entry.roomId,
        children: (entry.roomChildren ?? []).map((child) => ({
          name: child.name,
          gender: (['boy', 'girl', 'unisex'].includes(child.gender) ? child.gender : '') as RoomChild['gender'],
          age: Math.min(18, child.age + years),
        })),
      })
    })
  })

  const trackedStart = useRef(false)
  useEffect(() => {
    if (trackedStart.current) return
    trackedStart.current = true
    trackQuestionnaire('start')
  }, [])

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'השאלון | PETITE DREAMS'
    return () => {
      document.title = previousTitle
    }
  }, [])

  const steps = buildQuestionnaireSteps(rooms)
  const safeIndex = Math.min(stepIndex, steps.length - 1)
  const current = steps[safeIndex]

  useEffect(() => {
    if (safeIndex > 0) trackQuestionnaire('step', { stepKind: current.kind, stepIndex: safeIndex })
  }, [safeIndex, current.kind])
  const stepNumber = safeIndex + 1
  const totalSteps = steps.length

  const updateRoom = (roomIndex: number, recipe: (room: QuestionnaireRoom) => QuestionnaireRoom) => {
    setRooms((currentRooms) =>
      currentRooms.map((room, index) => (index === roomIndex ? recipe(room) : room)),
    )
  }

  const updateChild = (roomIndex: number, childIndex: number, partial: Partial<RoomChild>) => {
    updateRoom(roomIndex, (room) =>
      normalizeRoom({
        ...room,
        children: room.children.map((child, index) =>
          index === childIndex ? { ...child, ...partial } : child,
        ),
      }),
    )
  }

  const colorStillValid = (room: QuestionnaireRoom, theme: string) => {
    if (!theme || !room.colorPreference) return false
    const profile = roomDesignProfile(room)
    const options = getQuestionnaireOptionsForScales(
      filterColorScalesForChild(colorScales, profile.gender, profile.age, theme),
    )
    return options.some((option) => option.name === room.colorPreference)
  }

  const applyTheme = (roomIndex: number, theme: string) => {
    updateRoom(roomIndex, (room) => ({
      ...room,
      theme,
      colorPreference: colorStillValid(room, theme) ? room.colorPreference : '',
    }))
  }

  const canProceed = () => {
    if (current.kind === 'rooms') {
      return rooms.every(
        (room) =>
          room.children.length > 0 && room.children.every((child) => child.name.trim() !== ''),
      )
    }
    if (current.kind === 'child') {
      return rooms[current.roomIndex]?.children[current.childIndex]?.gender !== ''
    }
    if (current.kind === 'design-gender') return rooms[current.roomIndex]?.designGender !== ''
    if (current.kind === 'design-age') return rooms[current.roomIndex]?.ageChoice !== null
    if (current.kind === 'theme') return rooms[current.roomIndex]?.theme !== ''
    if (current.kind === 'color') return rooms[current.roomIndex]?.colorPreference !== ''
    return rooms[current.roomIndex]?.wallDesignOption !== ''
  }

  const handleNext = () => {
    if (safeIndex < steps.length - 1) {
      setStepIndex(safeIndex + 1)
      window.scrollTo(0, 0)
      return
    }
    trackQuestionnaire('complete', {
      rooms: rooms.map((room) => ({
        theme: room.theme,
        colorPreference: room.colorPreference,
        ...roomOrderMeta(room),
        children: room.children.map((child) => ({ age: child.age, gender: child.gender })),
      })),
    })
    const queryParams = new URLSearchParams({ rooms: JSON.stringify(rooms) })
    window.scrollTo(0, 0)
    navigate(`/preview/recommended?${queryParams.toString()}`)
  }

  const handleBack = () => {
    if (safeIndex > 0) {
      setStepIndex(safeIndex - 1)
      window.scrollTo(0, 0)
    }
  }

  const pad = (value: number) => String(value).padStart(2, '0')
  const wide = current.kind === 'wall' || current.kind === 'color'

  return (
    <div className="min-h-screen bg-[#F7F4EF]">
      <Header />

      <div className={`mx-auto px-4 pt-2 pb-4 sm:px-6 sm:py-12 ${wide ? 'max-w-5xl' : 'max-w-xl'}`}>
        <div className="mb-2 flex items-center justify-between text-sm text-[#8A847C] sm:mb-5">
          <span dir="ltr">
            {pad(stepNumber)} / {pad(totalSteps)}
                    </span>
                  </div>
        <div className="mb-3 flex gap-1.5 sm:mb-6">
          {steps.map((item, index) => (
            <span
              key={`${item.kind}-${index}`}
              className={`h-1.5 flex-1 rounded-full ${index <= safeIndex ? 'bg-[#7E8B74]' : 'bg-[#E6E0D8]'}`}
            />
          ))}
        </div>

        {redesignEntries.length > 0 && rooms.some((room) => room.roomId) && current.kind === 'rooms' && (
          <p className="mb-3 rounded-2xl bg-[#F8F3EC] px-4 py-3 text-center text-sm leading-6 text-[#6F6A64]">
            עיצוב חדש{' '}
            {redesignEntries.length === 1 ? 'לחדר' : 'לחדרים'} של{' '}
            {redesignEntries.map((entry) => formatRoomNames(entry.roomChildren ?? [])).join(' ושל ')}, עם 20% הנחה על
            כל חדר. אחרי הרכישה החבילה הנוכחית תעבור לארכיון באזור האישי, וכל התוכן שלה יישאר זמין לצפייה.
          </p>
        )}

        <div className="rounded-[28px] border border-[#EAE3DB] bg-white p-4 shadow-[0_8px_30px_rgba(120,100,80,0.05)] sm:p-8">
          {current.kind === 'rooms' && (
            <RoomsStep
              rooms={rooms}
              onChange={(next) => setRooms(next.map((room) => normalizeRoom(room)))}
            />
          )}

          {current.kind === 'child' && (
            <ChildStep
              child={rooms[current.roomIndex].children[current.childIndex]}
              onChange={(partial) => updateChild(current.roomIndex, current.childIndex, partial)}
            />
          )}

          {current.kind === 'design-gender' && (
            <DesignGenderStep
              room={rooms[current.roomIndex]}
              value={rooms[current.roomIndex].designGender}
              onChange={(designGender) =>
                updateRoom(current.roomIndex, (room) => normalizeRoom({ ...room, designGender }))
              }
            />
          )}

          {current.kind === 'design-age' && (
            <DesignAgeStep
              room={rooms[current.roomIndex]}
              onChange={(ageChoice) =>
                updateRoom(current.roomIndex, (room) => normalizeRoom({ ...room, ageChoice }))
              }
            />
          )}

          {current.kind === 'theme' && (
            <ThemePicker
              title={themeTitle(rooms[current.roomIndex])}
              crossAge={isCrossAgeRoom(rooms[current.roomIndex])}
              gender={roomDesignProfile(rooms[current.roomIndex]).gender}
              age={roomDesignProfile(rooms[current.roomIndex]).age}
              value={rooms[current.roomIndex].theme}
              onChange={(theme) => applyTheme(current.roomIndex, theme)}
            />
          )}

          {current.kind === 'color' && rooms[current.roomIndex].theme !== '' && (
            <ColorPicker
              gender={roomDesignProfile(rooms[current.roomIndex]).gender}
              age={roomDesignProfile(rooms[current.roomIndex]).age}
              theme={rooms[current.roomIndex].theme}
              room={rooms[current.roomIndex]}
              value={rooms[current.roomIndex].colorPreference}
              onChange={(colorPreference) =>
                updateRoom(current.roomIndex, (room) => ({ ...room, colorPreference }))
              }
            />
          )}

          {current.kind === 'wall' && (
            <WallDesignPicker
              room={rooms[current.roomIndex]}
              value={rooms[current.roomIndex].wallDesignOption}
              onChange={(wallDesignOption) =>
                updateRoom(current.roomIndex, (room) => ({ ...room, wallDesignOption }))
              }
            />
          )}

          <div className="mt-5 flex items-center justify-between sm:mt-8">
                          <button
                            type="button"
              onClick={handleBack}
              disabled={safeIndex === 0}
              className={`text-sm ${safeIndex === 0 ? 'cursor-not-allowed text-[#C5C5C5]' : 'text-[#8A847C]'}`}
            >
              חזרה
                          </button>
                      <button
                        type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className={`inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-sm transition-colors ${
                canProceed()
                  ? 'bg-[#C4B49A] text-white hover:bg-[#B3A288]'
                            : 'cursor-not-allowed bg-[#E8DED2] text-[#C5C5C5]'
                        }`}
                      >
              {safeIndex === steps.length - 1 ? 'סיום' : 'המשך'}
              <ArrowLeft className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
              </div>
            </div>
  )
}

function ChoiceRadio({ selected }: { selected: boolean }) {
  return (
    <span
      className={`h-5 w-5 shrink-0 rounded-full border ${
        selected ? 'border-[#C4A574] bg-[#C4A574]' : 'border-[#D5CBBF] bg-white'
      }`}
    />
  )
}

function childAgeLabel(child: RoomChild) {
  const who = child.gender === 'girl' ? 'בת' : 'בן'
  if (child.age === 0) return `${who} עד שנה`
  if (child.age === 1) return `${who} שנה`
  if (child.age === 2) return `${who} שנתיים`
  return `${who} ${child.age}`
}

function DesignGenderStep({
  room,
  value,
  onChange,
}: {
  room: QuestionnaireRoom
  value: CatalogGender | ''
  onChange: (gender: CatalogGender) => void
}) {
  const options: { value: CatalogGender; label: string; hint?: string; icon: LucideIcon }[] = [
    { value: 'boy', label: 'חדר לבן', icon: User },
    { value: 'girl', label: 'חדר לבת', icon: User },
    { value: 'unisex', label: 'חדר ניטרלי', hint: '(מתאים לבנים ולבנות)', icon: Users },
  ]

  return (
            <div>
      <h2 className="mb-3 text-center text-[1.65rem] leading-tight font-light text-[#3C3834]">
        {roomPhrase(room)} יעוצב כ:
              </h2>
      <p className="mb-6 text-center text-sm leading-6 text-[#8A847C]">
        כך נוכל להתאים לכם נושאי עיצוב, צבעים
        <br />
        והשראה שיתאימו בדיוק לכם.
      </p>
      <div className="space-y-3">
        {options.map((option) => {
          const selected = value === option.value
          const Icon = option.icon
          return (
                  <button
              key={option.value}
                    type="button"
              onClick={() => onChange(option.value)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-right transition-colors ${
                selected ? 'border-[#E7D9C8] bg-[#F8F3EC]' : 'border-[#E7E1D8] bg-white'
              }`}
            >
              {option.value === 'girl' ? (
                <GirlIcon className="h-6 w-6 shrink-0 text-[#C4B39A]" />
              ) : (
                <Icon className="h-6 w-6 shrink-0 text-[#C4B39A]" strokeWidth={1.4} />
              )}
              <span className="flex-1">
                <span className="block text-[#3C3834]">{option.label}</span>
                {option.hint && <span className="block text-sm text-[#8A847C]">{option.hint}</span>}
              </span>
              <ChoiceRadio selected={selected} />
                  </button>
          )
        })}
              </div>
            </div>
  )
}

function DesignAgeStep({
  room,
  onChange,
}: {
  room: QuestionnaireRoom
  onChange: (choice: AgeChoice) => void
}) {
  const selectedKey = room.ageChoice?.type === 'child' ? `child-${room.ageChoice.childIndex}` : ''

  return (
            <div>
      <h2 className="mb-3 text-center text-[1.65rem] leading-tight font-light text-[#3C3834]">
        לפי איזה גיל תרצו לבחור
        <br />
        את נושא העיצוב
        <br />
        {roomPhrase(room, 'le')}?
              </h2>
      <p className="mb-6 text-center text-sm leading-6 text-[#8A847C]">
        כשאתם בגילאים שונים חולקים חדר, תוכלו
        <br />
        לבחור את נושא העיצוב לפי גילו של אחד מהם
        .
      </p>
      <div className="flex flex-col gap-3">
        {room.children.map((child, index) => {
          const key = `child-${index}`
          const selected = selectedKey === key
          return (
                  <button
              key={key}
                    type="button"
              onClick={() => onChange({ type: 'child', childIndex: index })}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 transition-colors ${
                selected ? 'border-[#E7D9C8] bg-[#F8F3EC]' : 'border-[#E7E1D8] bg-white'
              }`}
            >
              <span className="text-[#3C3834]">
                לפי {child.name}, {childAgeLabel(child)}
              </span>
              <ChoiceRadio selected={selected} />
                  </button>
          )
        })}
              </div>
            </div>
  )
}

function themeTitle(room: QuestionnaireRoom) {
  const named = room.children.filter((child) => child.name.trim())
  if (isCrossAgeRoom(room)) return `נושאים חוצי גילאים לחדר של ${formatRoomNames(named)}`
  if (named.length === 1) {
    const child = named[0]
    const verb =
      room.designGender === 'girl' ? 'אוהבת' : room.designGender === 'boy' ? 'אוהב' : 'אוהב/ת'
    return `איזה נושא ${child.name} ${verb}?`
  }
  const verb = named.every((child) => child.gender === 'girl') ? 'אוהבות' : 'אוהבים'
  return `איזה נושא אחד ${formatRoomNames(named)} ${verb}?`
}

const roomOrdinals = ['הראשון', 'השני', 'השלישי', 'הרביעי', 'החמישי', 'השישי', 'השביעי', 'השמיני', 'התשיעי', 'העשירי']

function roomDesignLabel(index: number) {
  const ordinal = roomOrdinals[index] ?? `ה-${index + 1}`
  return `החדר ${ordinal} שתרצו לעצב`
}

function roomPhrase(room: QuestionnaireRoom, prefix: 'et' | 'le' | 'be' = 'et') {
  const label = formatRoomNames(room.children)
  if (label === 'החדר') {
    if (prefix === 'le') return 'לחדר'
    if (prefix === 'be') return 'בחדר'
    return 'החדר'
  }
  if (prefix === 'le') return `לחדר של ${label}`
  if (prefix === 'be') return `בחדר של ${label}`
  return `החדר של ${label}`
}

const MAX_ROOMS = 5

function RoomsStep({
  rooms,
  onChange,
}: {
  rooms: QuestionnaireRoom[]
  onChange: (rooms: QuestionnaireRoom[]) => void
}) {
  const update = (recipe: (rooms: QuestionnaireRoom[]) => QuestionnaireRoom[]) => onChange(recipe(rooms))

  const setRoomCount = (count: number) => {
    const next = Math.max(1, Math.min(MAX_ROOMS, count))
    if (next === rooms.length) return
    if (next > rooms.length) {
      update((list) => [...list, ...Array.from({ length: next - list.length }, () => emptyRoom())])
      return
    }
    update((list) => list.slice(0, next))
  }

  return (
            <div>
      <h2 className="mb-2 text-center text-[1.7rem] font-light text-[#3C3834] sm:text-3xl">
        למי מעצבים את החדר?
              </h2>
      <p className="mb-4 text-center text-sm leading-6 text-[#8A847C] sm:mb-6">
        ספרו לנו את שמות הילדים
        <br />
        וחלקו אותם לחדרים
      </p>

      <div className="mb-3 rounded-2xl border border-[#E7E1D8] bg-[#FBF9F6] px-3 py-3.5 text-center">
        <p className="text-sm leading-5 text-[#4A4540]">כמה חדרים תרצו לעצב?</p>
        <div className="mt-2.5 flex items-center justify-center gap-3" dir="ltr">
          <button
            type="button"
            aria-label="הורדת חדר"
            disabled={rooms.length <= 1}
            onClick={() => setRoomCount(rooms.length - 1)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border ${
              rooms.length <= 1
                ? 'cursor-not-allowed border-[#E8DED2] text-[#C5C5C5]'
                : 'border-[#D5CBBF] text-[#6F6A64] hover:bg-white'
            }`}
          >
            <Minus className="h-4 w-4" strokeWidth={2} />
          </button>
          <span className="min-w-10 text-center text-3xl font-light leading-none text-[#3C3834]">
            {rooms.length}
          </span>
          <button
            type="button"
            aria-label="הוספת חדר"
            disabled={rooms.length >= MAX_ROOMS}
            onClick={() => setRoomCount(rooms.length + 1)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border ${
              rooms.length >= MAX_ROOMS
                ? 'cursor-not-allowed border-[#E8DED2] text-[#C5C5C5]'
                : 'border-[#D5CBBF] text-[#6F6A64] hover:bg-white'
            }`}
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#FBF6EE] px-4 py-2.5 text-sm leading-5 text-[#6F6254]">
        <img src="/assets/gift-icon.png" alt="" className="h-9 w-9 shrink-0 object-contain" />
        <p>
          מעצבים יותר מחדר אחד?
          <br />
          נהנים מ־20% הנחה על כל חדר נוסף!
        </p>
      </div>

      <div className="space-y-4">
        {rooms.map((room, roomIndex) => (
          <div key={roomIndex} className="rounded-2xl border border-[#E7E1D8] p-4">
            <div className="mb-3 flex items-center justify-center text-[#6F6A64]">
              <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap leading-none">
                <Sparkle className="h-2.5 w-2.5 shrink-0 text-[#C4A574]" />
                <span className="leading-none">{roomDesignLabel(roomIndex)}</span>
                <Sparkle className="h-2.5 w-2.5 shrink-0 text-[#C4A574]" />
              </span>
            </div>
            <div className="space-y-2">
              {room.children.map((child, childIndex) => (
                <div key={childIndex} className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={
                      room.children.length === 1 && rooms.length > 1
                        ? `הסרת ${roomDesignLabel(roomIndex)}`
                        : `הסרת ${child.name || 'ילד'}`
                    }
                    onClick={() =>
                      update((list) => {
                        const current = list[roomIndex]
                        const remainingChildren = current.children.filter((_, i) => i !== childIndex)
                        // Last child in an extra room → remove the whole room (and the +/- counter updates).
                        if (remainingChildren.length === 0 && list.length > 1) {
                          return list.filter((_, index) => index !== roomIndex)
                        }
                        return list.map((item, index) => {
                          if (index !== roomIndex) return item
                          return {
                            ...item,
                            children:
                              remainingChildren.length > 0
                                ? remainingChildren
                                : [{ name: '', gender: '', age: 5 }],
                          }
                        })
                      })
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#B7A89A]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    value={child.name}
                    onChange={(event) =>
                      update((list) =>
                        list.map((item, index) =>
                          index === roomIndex
                            ? {
                                ...item,
                                children: item.children.map((entry, i) =>
                                  i === childIndex ? { ...entry, name: event.target.value } : entry,
                                ),
                              }
                            : item,
                        ),
                      )
                    }
                    placeholder="שם הילד/ה"
                    className="w-full rounded-full border border-[#E8DED2] bg-[#FBF9F6] px-4 py-2.5 text-center focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none"
                  />
                  <User className="h-4 w-4 shrink-0 text-[#C4B39A]" strokeWidth={1.5} />
                </div>
              ))}
            </div>
                      <button
                        type="button"
              onClick={() =>
                update((list) =>
                  list.map((item, index) =>
                    index === roomIndex
                      ? { ...item, children: [...item.children, { name: '', gender: '', age: 5 }] }
                      : item,
                  ),
                )
              }
              className="mt-3 flex w-full items-center justify-center gap-1 text-sm text-[#8A847C]"
            >
              <Plus className="h-3.5 w-3.5" />
              הוספת ילד נוסף המתגורר בחדר
                      </button>
          </div>
                    ))}
                  </div>
                </div>
              )
}

function ChildStep({
  child,
  onChange,
}: {
  child: RoomChild
  onChange: (partial: Partial<RoomChild>) => void
}) {
  return (
    <div>
      <h2 className="mb-2 text-center text-[1.7rem] font-light text-[#3C3834] sm:text-3xl">
        קצת על {child.name}
      </h2>
      <p className="mb-6 text-center text-sm text-[#8A847C]">ספרו לנו עוד קצת</p>

      <p className="mb-3 text-center text-[#4A4540]">בן או בת?</p>
      <div className="mb-8 grid grid-cols-2 gap-3">
        {genderOptions.map((option) => {
          const selected = child.gender === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ gender: option.value })}
              className={`flex flex-col items-center gap-2 rounded-2xl border py-5 transition-all ${
                selected
                  ? 'border-[#D2CECA] bg-[#EEECEA] ring-1 ring-[#D2CECA]'
                  : 'border-[#E7E1D8] bg-white hover:border-[#D4C4B0]'
              }`}
            >
              {option.value === 'girl' ? (
                <GirlIcon className="h-7 w-7 text-[#C4B39A]" />
              ) : (
                <User className="h-7 w-7 text-[#C4B39A]" strokeWidth={1.4} />
              )}
              <span className="text-[#4A4540]">{option.label}</span>
            </button>
          )
        })}
          </div>

      <p className="mb-2 text-center text-[#4A4540]">באיזה גיל?</p>
      <div className="mb-4 text-center">
        <div className="text-5xl font-light text-[#7E8B74]">{child.age}</div>
        <div className="text-sm text-[#8A847C]">{child.age === 0 ? 'עד שנה' : 'שנים'}</div>
      </div>
      <div dir="ltr">
        <Slider
          value={[child.age]}
          onValueChange={(value) => onChange({ age: value[0] })}
          min={0}
          max={12}
          step={1}
        />
        <div className="mt-2 flex justify-between text-sm text-[#8A847C]">
          <span>0</span>
          <span>12</span>
        </div>
      </div>
    </div>
  )
}
