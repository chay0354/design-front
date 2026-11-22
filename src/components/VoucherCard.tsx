import { Sparkle } from './BrushTitle'
import { apiUrl } from '../utils/api'

export const DEFAULT_GIFT_BLESSING = 'כי לכל ילד מגיע מקום משלו לחלום, לדמיין ולגדול בו.'

export function packagesPhrase(count: number) {
  return count === 1 ? 'חבילת עיצוב אחת' : `${count} חבילות עיצוב`
}

/** Singular "קיבלת" for one recipient; "קיבלתם" for 2+ names or a family. */
export function isPluralRecipients(names: string): boolean {
  const n = names.trim()
  if (!n) return true
  if (/משפח|כולם|הילדים|הנכדים/.test(n)) return true
  if (/[,،/&+]/.test(n)) return true
  // "ליאב וניר" / "ליאב ו ניר"
  if (/\S\s+ו\S/.test(n) || /\S\s+ו\s+\S/.test(n)) return true
  return false
}

/** "למתן" / "לליאב, ניר ואלון" — ל' before the typed recipient(s). */
export function toRecipientLabel(names: string): string {
  const n = names.trim()
  if (!n) return 'למקבלי המתנה'
  return `ל${n}`
}

export function receivedPackagesLine(names: string, count: number): string {
  const verb = isPluralRecipients(names) ? 'קיבלתם' : 'קיבלת'
  return `${verb} ${packagesPhrase(count)} לחדרי הילדים`
}

/** The designed gift voucher. Never shows the price. */
export function VoucherCard({
  recipientNames,
  giverName,
  personalMessage,
  packagesCount,
  code,
}: {
  recipientNames: string
  giverName: string
  personalMessage: string
  packagesCount: number
  code?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#E7D9C8] bg-gradient-to-b from-[#FBF8F3] to-[#F4EDE3] px-6 py-8 text-center shadow-sm">
      <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-[#EADFD0]/60" />
      <div className="pointer-events-none absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-[#EFE5D8]/70" />
      <div className="relative">
        <img src="/assets/logo-full.png?v=6" alt="Petite Dreams" className="mx-auto h-10 w-auto" />
        <p className="mt-4 flex items-center justify-center gap-3 text-[1.9rem] font-light text-[#3C3834]">
          <Sparkle />
          שובר מתנה
          <Sparkle />
        </p>
        <p className="text-sm text-[#8A847C]">מתנה קטנה, חלומות גדולים</p>

        <p className="mt-5 text-lg text-[#3C3834]">{toRecipientLabel(recipientNames)}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 whitespace-pre-line text-[#5E5852]">
          {(personalMessage || '').trim() || DEFAULT_GIFT_BLESSING}
        </p>
        <p className="mt-4 text-[15px] text-[#3C3834]">
          {receivedPackagesLine(recipientNames, packagesCount)}
        </p>
        {giverName && <p className="mt-1 text-sm text-[#5E5852]">באהבה, {giverName} ♡</p>}

        <div className="mt-5 flex flex-col items-center gap-3">
          <div>
            <p className="text-xs text-[#8A847C]">קוד השובר</p>
            <p dir="ltr" className="text-xl tracking-[0.2em] text-[#3C3834]">
              {code || 'PD-XXXXXXXX'}
            </p>
          </div>
          {code ? (
            <img
              src={apiUrl(`/api/vouchers/${encodeURIComponent(code)}/qr.png`)}
              alt="קוד QR למימוש השובר"
              className="h-28 w-28 rounded-lg bg-white p-1.5"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-lg border border-dashed border-[#D9CCBB] bg-white/60 text-xs text-[#A39A8F]">
              QR
            </div>
          )}
          <p className="text-xs text-[#8A847C]">petite-dreams.com</p>
        </div>
      </div>
    </div>
  )
}
