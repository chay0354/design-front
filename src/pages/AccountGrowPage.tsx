import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Sprout } from 'lucide-react'
import { Sparkle } from '../components/BrushTitle'
import { Header } from '../components/Header'
import { PageLoading } from '../components/PageLoading'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import {
  getAccountRooms,
  kidsPronoun,
  packagePreviewImage,
  packageThemeName,
  redesignPath,
} from '../utils/rooms'

function ageLabel(age: number) {
  if (age <= 0) return 'לגיל לידה'
  if (age === 1) return 'לגיל שנה'
  if (age === 2) return 'לגיל שנתיים'
  return `לגיל ${age}`
}

export function AccountGrowPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { packages, getPackageById, getPackageContent } = useData()

  if (loading) return <PageLoading />
  if (!user) return <Navigate to="/login" replace />

  const rooms = getAccountRooms(user, packages, getPackageById)
  if (rooms.length === 0) return <Navigate to="/account" replace />

  return (
    <div className="min-h-screen bg-[#FAF5F0]">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/account')}
          className="mb-2 inline-flex items-center gap-1 text-sm text-[#6F655C] hover:text-[#3B302A]"
        >
          <ChevronRight className="h-4 w-4" />
          חזרה לחדרים שלי
        </button>

        <section className="mb-7 text-center">
          <div className="mb-2 flex items-end justify-center gap-6 text-[#9C7E66]">
            <Sparkle className="mb-3 h-3.5 w-3.5 text-[#9C7E66]" />
            <Sprout className="h-14 w-14" strokeWidth={1.1} />
            <Sparkle className="mb-3 h-3.5 w-3.5 text-[#9C7E66]" />
          </div>
          <h1 className="text-[2rem] font-medium text-[#3B302A] sm:text-4xl">המקום שלי כשאגדל</h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-[#5F554C] sm:text-lg">
            בחרו עבור כל ילד את השדרוג המתאים לאהבות החדשות שלו, בפשטות ועם אותו קסם מעוצב.
          </p>
          <span className="mx-auto mt-3 block h-1 w-20 rounded-full bg-[#D9C6B5]" aria-hidden="true" />
        </section>

        <div className="space-y-5">
          {rooms.map((room) => (
            <article
              key={room.key}
              className="rounded-[26px] border border-[#EFE6DC] bg-white p-4 shadow-[0_6px_24px_rgba(120,95,70,0.07)] sm:p-5"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-4">
                <div className="min-w-0">
                  <h2 className="text-2xl font-medium text-[#3B302A]">החדר של {room.names}</h2>
                  <span className="mt-2 inline-block rounded-full bg-[#F5EDE4] px-3 py-1 text-[11px] text-[#5F554C] sm:text-xs">
                    חבילת {packageThemeName(room)} · החבילה הנוכחית
                  </span>
                  <p className="mt-2 text-sm text-[#5F554C]">הותאמה {ageLabel(room.entry.age)}</p>
                  <span className="mt-3 inline-block rounded-full bg-[#F7E9DC] px-5 py-1.5 text-lg font-medium text-[#3B302A]">
                    20% הנחה
                  </span>
                  <p className="mt-1 text-[13px] text-[#5F554C]">
                    להתאמת החדר למי ש{kidsPronoun(room.kids, { boy: 'הוא', girl: 'היא', many: 'הם' })} היום
                  </p>
                </div>
                <img
                  src={packagePreviewImage(getPackageContent(room.pkg.id))}
                  alt=""
                  className="aspect-[5/4] w-full rounded-2xl object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => navigate(room.roomId ? redesignPath([room.roomId]) : '/questionnaire')}
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-[#A08068] py-3 text-base text-white transition-opacity hover:opacity-90"
              >
                לבחירת נושאים מותאמי גיל
                <ArrowLeft className="h-5 w-5" />
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
