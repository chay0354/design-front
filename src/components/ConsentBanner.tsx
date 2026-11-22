import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getConsent, setConsent } from '../utils/tracking'

/** Small cookie consent bar. Referral attribution is stored only after "accept". */
export function ConsentBanner() {
  const [visible, setVisible] = useState(() => getConsent() === null)
  if (!visible) return null

  const choose = (value: 'accepted' | 'declined') => {
    setConsent(value)
    setVisible(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4" dir="rtl">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-[#E7DED2] bg-white/95 px-5 py-4 text-sm text-[#5E5852] shadow-lg backdrop-blur sm:flex-row sm:items-center">
        <p className="flex-1 leading-6">
          אנחנו משתמשים בעוגיות כדי לזכור את ההעדפות שלך ולדעת מאיפה הגעת אלינו.{' '}
          <Link to="/privacy" className="underline">
            מדיניות הפרטיות
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => choose('declined')}
            className="rounded-full border border-[#E2D8CC] px-4 py-2 text-[#6F6A64] hover:bg-[#F8F4EF]"
          >
            רק הכרחיות
          </button>
          <button
            type="button"
            onClick={() => choose('accepted')}
            className="rounded-full bg-[#C4B49A] px-5 py-2 text-white hover:bg-[#B3A288]"
          >
            מאשרת
          </button>
        </div>
      </div>
    </div>
  )
}
