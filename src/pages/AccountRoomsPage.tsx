import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, BedDouble, ChevronDown, Gift, Home, RefreshCw, ShoppingBag, Tag } from 'lucide-react'
import { Sparkle } from '../components/BrushTitle'
import { Header } from '../components/Header'
import { PageLoading } from '../components/PageLoading'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { apiFetch } from '../utils/backend'
import {
  ageRangeLabel,
  getAccountRooms,
  kidAgeToday,
  kidsPronoun,
  packagePreviewImage,
  packageThemeName,
  redesignPath,
  type AccountRoom,
} from '../utils/rooms'

type RoomChoice = { kind: 'new' } | { kind: 'keep' } | { kind: 'restore'; orderItemId: string }

function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-6 flex items-center justify-center" aria-label={`שלב ${current} מתוך 3`}>
      {[1, 2, 3].map((step, index) => (
        <li key={step} className="flex items-center">
          {index > 0 && <span className="h-0.5 w-12 bg-[#E3D6C9] sm:w-20" aria-hidden="true" />}
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg ${
              step === current
                ? 'border-[#8A6A52] bg-[#8A6A52] text-white'
                : 'border-[#E3D6C9] bg-white text-[#B9A898]'
            }`}
          >
            {step}
          </span>
        </li>
      ))}
    </ol>
  )
}

function roomIntro(room: AccountRoom) {
  if (room.kids.length === 1) {
    const kid = room.kids[0]
    const age = kidAgeToday(kid, room.entry.purchaseDate)
    const girl = kid.gender === 'girl'
    return {
      line1: `${kid.name} כבר ${girl ? 'בת' : 'בן'} ${age}, והצרכים והאהבות ${girl ? 'שלה' : 'שלו'} משתנים.`,
      line2: `בחרו את העיצוב שמתאים ${girl ? 'לה' : 'לו'} היום.`,
    }
  }
  return {
    line1: 'החדר השתנה, ואיתו גם הצרכים וההעדפות.',
    line2: 'בחרו עיצוב שמתאים לכל מי שחולק אותו היום.',
  }
}

function OptionCard({
  selected,
  onSelect,
  children,
}: {
  selected: boolean
  onSelect: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex flex-col items-center rounded-[22px] border-2 bg-white px-3 pt-4 pb-3 text-center transition-colors ${
        selected ? 'border-[#8A6A52] bg-[#FDF8F3]' : 'border-[#EFE6DC] hover:border-[#D9C6B5]'
      }`}
    >
      <span
        className={`absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? 'border-[#8A6A52]' : 'border-[#D5C7B9]'
        }`}
        aria-hidden="true"
      >
        {selected && <span className="h-3 w-3 rounded-full bg-[#8A6A52]" />}
      </span>
      {children}
    </button>
  )
}

export function AccountRoomsPage() {
  const navigate = useNavigate()
  const { user, loading, refreshProfile } = useAuth()
  const { packages, getPackageById, getPackageContent } = useData()
  const [choices, setChoices] = useState<Record<string, RoomChoice>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (loading) return <PageLoading />
  if (!user) return <Navigate to="/login" replace />

  const rooms = getAccountRooms(user, packages, getPackageById)
  if (rooms.length === 0) return <Navigate to="/account" replace />

  const choose = (key: string, choice: RoomChoice) => setChoices((current) => ({ ...current, [key]: choice }))

  const submit = async () => {
    setError('')
    setSaving(true)
    try {
      for (const room of rooms) {
        const choice = choices[room.key]
        if (choice?.kind === 'restore' && room.roomId) {
          await apiFetch(`/api/rooms/${room.roomId}/restore`, { body: { orderItemId: choice.orderItemId } })
        }
      }
      if (rooms.some((room) => choices[room.key]?.kind === 'restore')) await refreshProfile()

      const redesign = rooms.filter((room) => choices[room.key]?.kind === 'new')
      if (redesign.length > 0) {
        navigate(redesignPath(redesign.flatMap((room) => (room.roomId ? [room.roomId] : []))))
      } else {
        navigate('/account')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'לא הצלחנו לעדכן. נסו שוב.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF5F0]">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-2 flex items-center justify-between text-[#3B302A]">
          <button type="button" onClick={() => navigate('/account')} aria-label="חזרה לחדרים שלי" className="p-1">
            <Home className="h-6 w-6" strokeWidth={1.5} />
          </button>
          <p className="text-sm text-[#6F655C]">עדכון חלוקת החדרים</p>
          <button type="button" onClick={() => navigate(-1)} aria-label="חזרה" className="p-1">
            <ArrowLeft className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>

        <Stepper current={1} />

        <div className="space-y-8">
          {rooms.map((room, index) => {
            const choice = choices[room.key]
            const intro = roomIntro(room)
            const restoreOptions = room.archived
            return (
              <section key={room.key} className={index > 0 ? 'border-t border-[#E6DACE] pt-7' : ''}>
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F3EAE1] text-[#8A6A52]">
                    <BedDouble className="h-7 w-7" strokeWidth={1.3} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="flex items-start gap-2 text-xl font-medium leading-snug text-[#3B302A] sm:text-2xl">
                      איך תרצו לעצב את החדר של {room.names}?
                      <Sparkle className="mt-1 h-4 w-4 text-[#B4967E]" />
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[#5F554C]">
                      {intro.line1}
                      <br />
                      {intro.line2}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={`עיצוב החדר של ${room.names}`}>
                  <OptionCard selected={choice?.kind === 'new'} onSelect={() => choose(room.key, { kind: 'new' })}>
                    <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#A08068] text-white">
                      <Gift className="h-6 w-6" strokeWidth={1.4} />
                    </span>
                    <span className="text-lg font-medium leading-6 text-[#3B302A]">בחירת חבילת עיצוב חדשה</span>
                    <span className="my-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F5EDE4] px-2 py-2">
                      <span className="leading-tight">
                        <span className="block text-lg font-semibold text-[#3B302A]">20% הנחה</span>
                        <span className="block text-[11px] text-[#5F554C]">על כל חדר חדש</span>
                      </span>
                      <Tag className="h-6 w-6 shrink-0 text-[#A08068]" strokeWidth={1.4} />
                    </span>
                    <span className="text-[13px] leading-5 text-[#5F554C]">
                      בהתאמה לגיל, לצרכים ולהעדפות{' '}
                      {kidsPronoun(room.kids, { boy: 'שלו', girl: 'שלה', many: 'שלהם' })}
                    </span>
                  </OptionCard>

                  <OptionCard selected={choice?.kind === 'keep'} onSelect={() => choose(room.key, { kind: 'keep' })}>
                    <RefreshCw className="mb-2 h-8 w-8 text-[#3B302A]" strokeWidth={1.3} />
                    <span className="text-[15px] font-medium leading-5 text-[#3B302A]">
                      להשאיר את
                      <br />
                      חבילת העיצוב הקיימת
                    </span>
                    <img
                      src={packagePreviewImage(getPackageContent(room.pkg.id))}
                      alt={`חבילת ${packageThemeName(room)}`}
                      className="my-3 aspect-[16/9] w-full rounded-xl object-cover"
                    />
                    <span className="w-full rounded-full bg-[#F5EDE4] py-1.5 text-[13px] font-medium text-[#3B302A]">
                      מותאם לגילאי {ageRangeLabel(room.pkg)}
                    </span>
                  </OptionCard>
                </div>

                <label className="mt-3 flex items-center gap-3 rounded-2xl border border-[#EFE6DC] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(120,95,70,0.05)]">
                  <ShoppingBag className="h-6 w-6 shrink-0 text-[#8A6A52]" strokeWidth={1.3} />
                  <span className="h-6 w-px bg-[#E6DACE]" aria-hidden="true" />
                  <span className="relative min-w-0 flex-1">
                    <select
                      value={choice?.kind === 'restore' ? choice.orderItemId : ''}
                      disabled={restoreOptions.length === 0}
                      onChange={(event) =>
                        event.target.value
                          ? choose(room.key, { kind: 'restore', orderItemId: event.target.value })
                          : choose(room.key, { kind: 'keep' })
                      }
                      className="w-full appearance-none bg-transparent py-1 pl-7 text-[15px] font-medium text-[#3B302A] outline-none disabled:text-[#B9AEA3]"
                    >
                      <option value="">
                        {restoreOptions.length === 0
                          ? 'אין עדיין חבילות קודמות לחדר הזה'
                          : 'בחירה מהחבילות עיצוב שכבר רכשתם'}
                      </option>
                      {restoreOptions.map(({ child, pkg }) =>
                        child.orderItemId ? (
                          <option key={child.orderItemId} value={child.orderItemId}>
                            חבילת {child.theme || pkg.name} · נרכשה ב־
                            {new Date(child.purchaseDate).toLocaleDateString('he-IL')}
                          </option>
                        ) : null,
                      )}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 left-0 h-5 w-5 -translate-y-1/2 text-[#5F554C]" />
                  </span>
                </label>
              </section>
            )
          })}
        </div>

        {error && <p className="mt-5 text-center text-sm text-[#B4533F]">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-[#7E5F49] py-4 text-lg text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? 'מעדכנים...' : 'עדכן את הבחירות שלי'}
          <ArrowLeft className="h-5 w-5" />
        </button>
        <p className="mt-3 text-center text-xs leading-5 text-[#8A7F75]">
          בחירת חבילה חדשה ממשיכה לשאלון קצר ולתשלום. חבילה קודמת שתחזירו תופיע שוב בחדר, והנוכחית תעבור לארכיון.
        </p>
      </main>
    </div>
  )
}
