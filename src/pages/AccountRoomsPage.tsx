import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BedDouble,
  ChevronDown,
  ChevronRight,
  Gift,
  Plus,
  RefreshCw,
  ShoppingBag,
  Tag,
} from 'lucide-react'
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
  type RoomKid,
} from '../utils/rooms'

type RoomChoice = { kind: 'new' } | { kind: 'keep' } | { kind: 'restore'; orderItemId: string }

type AllocChild = {
  key: string
  name: string
  gender: string
  age: number
  roomSlot: number
  sourceRoomKey: string
}

const AGES = Array.from({ length: 13 }, (_, i) => i)

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

function SelectField({
  value,
  onChange,
  children,
  className = '',
}: {
  value: string | number
  onChange: (value: string) => void
  children: ReactNode
  className?: string
}) {
  return (
    <span className={`relative inline-flex min-w-0 ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-[#E8DED2] bg-[#FDFAF7] py-2 pr-3 pl-8 text-sm text-[#3B302A] outline-none focus:ring-2 focus:ring-[#D9CBB8]"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-[#8A7F75]" />
    </span>
  )
}

function roomIntro(kids: RoomKid[]) {
  if (kids.length === 1) {
    const kid = kids[0]
    const age = kid.age
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

function genderLabel(gender: string) {
  if (gender === 'girl') return 'בת'
  if (gender === 'boy') return 'בן'
  return ''
}

function buildInitialAllocation(rooms: AccountRoom[]): AllocChild[] {
  return rooms.flatMap((room, roomIndex) =>
    room.kids.map((kid, kidIndex) => ({
      key: `${room.key}-${kidIndex}-${kid.name}`,
      name: kid.name,
      gender: kid.gender || '',
      age: kidAgeToday(kid, room.entry.purchaseDate),
      roomSlot: roomIndex + 1,
      sourceRoomKey: room.key,
    })),
  )
}

export function AccountRoomsPage() {
  const navigate = useNavigate()
  const { user, loading, refreshProfile } = useAuth()
  const { packages, getPackageById, getPackageContent } = useData()
  const [step, setStep] = useState<1 | 2>(1)
  const [choices, setChoices] = useState<Record<string, RoomChoice>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftGender, setDraftGender] = useState<'boy' | 'girl'>('boy')
  const [draftAge, setDraftAge] = useState(1)
  const [draftRoomSlot, setDraftRoomSlot] = useState(1)
  const [allocation, setAllocation] = useState<AllocChild[] | null>(null)

  if (loading) return <PageLoading />
  if (!user) return <Navigate to="/login" replace />

  const rooms = getAccountRooms(user, packages, getPackageById)
  if (rooms.length === 0) return <Navigate to="/account" replace />

  const children = allocation ?? buildInitialAllocation(rooms)
  const roomCount = Math.max(rooms.length, ...children.map((child) => child.roomSlot), 1)
  const roomOptions = Array.from({ length: roomCount }, (_, i) => i + 1)

  const roomsForDesign = rooms.map((room, index) => {
    const slot = index + 1
    const kids = children
      .filter((child) => child.roomSlot === slot)
      .map((child) => ({ name: child.name, age: child.age, gender: child.gender }))
    return {
      ...room,
      kids: kids.length > 0 ? kids : room.kids,
      names:
        kids.length > 0
          ? kids.map((k) => k.name).filter(Boolean).join(' ו') || room.names
          : room.names,
    }
  })

  const ensureAllocation = () => {
    if (!allocation) setAllocation(buildInitialAllocation(rooms))
  }

  const updateChild = (key: string, patch: Partial<AllocChild>) => {
    ensureAllocation()
    setAllocation((current) =>
      (current ?? buildInitialAllocation(rooms)).map((child) =>
        child.key === key ? { ...child, ...patch } : child,
      ),
    )
  }

  const addChild = () => {
    const name = draftName.trim()
    if (!name) {
      setError('יש למלא שם לילד/ה')
      return
    }
    setError('')
    ensureAllocation()
    setAllocation((current) => [
      ...(current ?? buildInitialAllocation(rooms)),
      {
        key: `new-${Date.now()}`,
        name,
        gender: draftGender,
        age: draftAge,
        roomSlot: draftRoomSlot,
        sourceRoomKey: rooms[Math.min(draftRoomSlot, rooms.length) - 1]?.key || rooms[0].key,
      },
    ])
    setDraftName('')
    setDraftGender('boy')
    setDraftAge(1)
    setDraftRoomSlot(1)
    setAdding(false)
  }

  const choose = (key: string, choice: RoomChoice) => setChoices((current) => ({ ...current, [key]: choice }))

  const saveAllocation = async () => {
    const payload = {
      rooms: rooms.map((room, index) => ({
        roomId: room.roomId || null,
        orderItemId: room.entry.orderItemId || null,
        children: children
          .filter((child) => child.roomSlot === index + 1)
          .map((child) => ({
            name: child.name.trim(),
            age: child.age,
            gender: child.gender,
          }))
          .filter((child) => child.name),
      })),
    }
    await apiFetch('/api/rooms/allocation', { body: payload })
    await refreshProfile()
  }

  const continueToDesign = async () => {
    setError('')
    setSaving(true)
    try {
      await saveAllocation()
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'לא הצלחנו לשמור את החלוקה. נסו שוב.')
    } finally {
      setSaving(false)
    }
  }

  const submitDesign = async () => {
    setError('')
    setSaving(true)
    try {
      for (const room of roomsForDesign) {
        const choice = choices[room.key]
        if (choice?.kind === 'restore' && room.roomId) {
          await apiFetch(`/api/rooms/${room.roomId}/restore`, { body: { orderItemId: choice.orderItemId } })
        }
      }
      if (roomsForDesign.some((room) => choices[room.key]?.kind === 'restore')) await refreshProfile()

      const redesign = roomsForDesign.filter((room) => choices[room.key]?.kind === 'new')
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
        <div className="mb-4 flex items-center justify-between text-[#3B302A]">
          <button
            type="button"
            onClick={() => (step === 2 ? setStep(1) : navigate('/account'))}
            className="inline-flex items-center gap-1 text-sm text-[#6F655C] hover:text-[#3B302A]"
          >
            <ChevronRight className="h-4 w-4" />
            חזרה
          </button>
          <p className="text-sm font-medium text-[#3B302A]">Petite Dreams</p>
          <span className="w-14" aria-hidden="true" />
        </div>

        <Stepper current={step === 1 ? 1 : 2} />

        {step === 1 ? (
          <>
            <header className="mb-5 text-center">
              <h1 className="text-[1.75rem] font-medium text-[#3B302A] sm:text-3xl">עדכון חלוקת החדרים</h1>
              <p className="mt-1.5 text-sm text-[#6F655C]">עדכנו את הגילאים ואת השיוך לחדרים</p>
            </header>

            <section className="overflow-hidden rounded-[22px] border border-[#EFE6DC] bg-white shadow-[0_4px_18px_rgba(120,95,70,0.05)]">
              {children.map((child, index) => (
                <div
                  key={child.key}
                  className={`flex flex-wrap items-center gap-2 px-4 py-3 sm:gap-3 ${
                    index > 0 ? 'border-t border-[#F0E8DF]' : ''
                  }`}
                >
                  <p className="min-w-[5.5rem] flex-1 text-[15px] font-medium text-[#3B302A]">
                    {child.name}
                    {genderLabel(child.gender) ? ` ${genderLabel(child.gender)}` : ''}
                  </p>
                  <SelectField
                    value={child.age}
                    onChange={(value) => updateChild(child.key, { age: Number(value) })}
                    className="w-[4.5rem]"
                  >
                    {AGES.map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    value={child.roomSlot}
                    onChange={(value) => updateChild(child.key, { roomSlot: Number(value) })}
                    className="w-[6.5rem]"
                  >
                    {roomOptions.map((slot) => (
                      <option key={slot} value={slot}>
                        חדר {slot}
                      </option>
                    ))}
                  </SelectField>
                </div>
              ))}
            </section>

            {adding ? (
              <section className="mt-4 rounded-[22px] border border-[#EFE6DC] bg-white p-4 shadow-[0_4px_18px_rgba(120,95,70,0.05)]">
                <h2 className="mb-3 text-center text-lg font-medium text-[#3B302A]">הוספת ילד/ה חדש/ה</h2>
                <label className="mb-3 block text-sm text-[#5F554C]">
                  שם הילד/ה
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="לדוגמה: טל"
                    className="mt-1.5 w-full rounded-xl border border-[#E8DED2] bg-[#FDFAF7] px-4 py-2.5 text-[#3B302A] outline-none focus:ring-2 focus:ring-[#D9CBB8]"
                  />
                </label>
                <p className="mb-2 text-sm text-[#5F554C]">מין</p>
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: 'boy' as const, label: 'בן' },
                      { value: 'girl' as const, label: 'בת' },
                    ]
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDraftGender(option.value)}
                      className={`rounded-xl border py-2.5 text-sm ${
                        draftGender === option.value
                          ? 'border-[#D2CECA] bg-[#EEECEA] text-[#3B302A]'
                          : 'border-[#E7E1D8] bg-white text-[#5F554C]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <label className="text-sm text-[#5F554C]">
                    גיל
                    <SelectField
                      value={draftAge}
                      onChange={(value) => setDraftAge(Number(value))}
                      className="mt-1.5 block w-full"
                    >
                      {AGES.map((age) => (
                        <option key={age} value={age}>
                          {age}
                        </option>
                      ))}
                    </SelectField>
                  </label>
                  <label className="text-sm text-[#5F554C]">
                    שיוך לחדר
                    <SelectField
                      value={draftRoomSlot}
                      onChange={(value) => setDraftRoomSlot(Number(value))}
                      className="mt-1.5 block w-full"
                    >
                      {roomOptions.map((slot) => (
                        <option key={slot} value={slot}>
                          חדר {slot}
                        </option>
                      ))}
                    </SelectField>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={addChild}
                  className="w-full rounded-full bg-[#8A6A52] py-3 text-sm text-white hover:opacity-90"
                >
                  הוספה לרשימת הילדים
                </button>
              </section>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setAdding(true)
                setDraftRoomSlot(roomOptions[0] || 1)
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#E8DED2] bg-[#F5EDE4] py-3 text-sm text-[#3B302A] hover:bg-[#EFE6DC]"
            >
              <Plus className="h-4 w-4" />
              הוספת ילד/ה
            </button>

            {error && <p className="mt-4 text-center text-sm text-[#B4533F]">{error}</p>}

            <button
              type="button"
              onClick={continueToDesign}
              disabled={saving || children.length === 0}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#7E5F49] py-4 text-base text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'שומרים...' : 'אישור החלוקה והמשך לבחירת עיצוב'}
              <ArrowLeft className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <header className="mb-5 text-center">
              <h1 className="text-[1.75rem] font-medium text-[#3B302A] sm:text-3xl">בחירת חבילת העיצוב</h1>
              <p className="mt-1.5 text-sm text-[#6F655C]">לכל חדר בחרו אם לעצב מחדש או להשאיר את הקיים</p>
            </header>

            <div className="space-y-8">
              {roomsForDesign.map((room, index) => {
                const choice = choices[room.key]
                const intro = roomIntro(room.kids)
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
              onClick={submitDesign}
              disabled={saving}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-[#7E5F49] py-4 text-lg text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'מעדכנים...' : 'עדכן את הבחירות שלי'}
              <ArrowLeft className="h-5 w-5" />
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-[#8A7F75]">
              בחירת חבילה חדשה ממשיכה לשאלון קצר ולתשלום. חבילה קודמת שתחזירו תופיע שוב בחדר, והנוכחית תעבור לארכיון.
            </p>
          </>
        )}
      </main>
    </div>
  )
}
