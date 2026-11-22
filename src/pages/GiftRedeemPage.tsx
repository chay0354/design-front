import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { PageLoading } from '../components/PageLoading'
import { BrushTitle } from '../components/BrushTitle'
import { VoucherCard, packagesPhrase } from '../components/VoucherCard'
import { useAuth } from '../contexts/AuthContext'
import { apiFetch } from '../utils/backend'
import { setPendingVoucher } from '../utils/tracking'

interface VoucherStatus {
  valid: boolean
  reason: 'not_found' | 'cancelled' | 'used' | null
  code?: string
  packagesCount?: number
  packagesRemaining?: number
  recipientNames?: string
  giverName?: string
  personalMessage?: string
}

const reasons: Record<string, string> = {
  not_found: 'לא מצאנו שובר עם הקוד הזה. כדאי לבדוק שהקישור הועתק במלואו.',
  cancelled: 'השובר הזה בוטל.',
  used: 'כל החבילות בשובר הזה כבר מומשו.',
}

export function GiftRedeemPage() {
  const { code = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [status, setStatus] = useState<VoucherStatus | null>(null)

  useEffect(() => {
    document.title = 'מימוש שובר מתנה | PETITE DREAMS'
    apiFetch<VoucherStatus>(`/api/vouchers/${encodeURIComponent(code)}`, { auth: false })
      .then(setStatus)
      .catch(() => setStatus({ valid: false, reason: 'not_found' }))
  }, [code])

  if (!status) return <PageLoading />

  const start = () => {
    setPendingVoucher(status.code || code)
    navigate('/questionnaire')
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF]">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-10 text-center">
        <BrushTitle as="h1">{status.valid ? 'מחכה לכם מתנה!' : 'מימוש שובר מתנה'}</BrushTitle>
        {status.valid ? (
          <>
            <p className="mt-4 text-sm leading-6 text-[#6F6A64]">
              השובר תקף ונותרו בו {packagesPhrase(status.packagesRemaining || 0)} למימוש. ממלאים שאלון קצר על
              הילדים והחדרים, ובסיום החבילות יופיעו באזור האישי שלכם — ללא חיוב נוסף.
            </p>
            <div className="mt-6">
              <VoucherCard
                recipientNames={status.recipientNames || ''}
                giverName={status.giverName || ''}
                personalMessage={status.personalMessage || ''}
                packagesCount={status.packagesCount || 1}
                code={status.code}
              />
            </div>
            <button
              type="button"
              onClick={start}
              className="mt-8 rounded-full bg-[#C4B49A] px-8 py-3.5 text-white hover:bg-[#B3A288]"
            >
              לבחירת חבילות העיצוב
            </button>
            {!user && (
              <p className="mt-4 text-xs text-[#8A847C]">
                בסוף השאלון תתבקשו להירשם או להתחבר, כדי שהחבילות יישמרו באזור האישי שלכם.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="mt-6 text-[#6F6A64]">{reasons[status.reason || 'not_found']}</p>
            <Link to="/" className="mt-8 inline-block rounded-full border border-[#E2D8CC] bg-white px-6 py-3 text-[#3C3834]">
              לדף הבית
            </Link>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
