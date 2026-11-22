import { apiFetch } from './backend'

/**
 * Visitor ids, cookie consent, influencer referral attribution and questionnaire
 * funnel events. Storage access is wrapped because it can throw in private
 * windows; tracking must never break the site.
 */

const CONSENT_KEY = 'pd_cookie_consent'
const VISITOR_KEY = 'pd_visitor_id'
const REFERRAL_KEY = 'pd_referral'
const PENDING_REFERRAL_KEY = 'pd_pending_referral'
const QUESTIONNAIRE_SESSION_KEY = 'pd_questionnaire_session'
export const REFERRAL_DAYS = 30

export type Consent = 'accepted' | 'declined' | null

function read(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}

function write(storage: Storage | undefined, key: string, value: string | null) {
  try {
    if (value === null) storage?.removeItem(key)
    else storage?.setItem(key, value)
  } catch {
    // storage unavailable — ignore
  }
}

const local = () => (typeof window === 'undefined' ? undefined : window.localStorage)
const session = () => (typeof window === 'undefined' ? undefined : window.sessionStorage)

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '')
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
}

export function getConsent(): Consent {
  const value = read(local(), CONSENT_KEY)
  return value === 'accepted' || value === 'declined' ? value : null
}

export function getVisitorId(): string {
  let id = read(local(), VISITOR_KEY) || read(session(), VISITOR_KEY)
  if (!id) {
    id = newId()
    write(getConsent() === 'accepted' ? local() : session(), VISITOR_KEY, id)
  }
  return id
}

interface StoredReferral {
  ref: string
  visitorId: string
  at: number
}

async function recordReferral(ref: string, path: string) {
  const visitorId = getVisitorId()
  write(local(), VISITOR_KEY, visitorId)
  const stored: StoredReferral = { ref, visitorId, at: Date.now() }
  write(local(), REFERRAL_KEY, JSON.stringify(stored))
  try {
    await apiFetch('/api/referrals/visit', { body: { ref, visitorId, path }, auth: false })
  } catch {
    // attribution is best effort
  }
}

/** Call once on page load: picks up ?ref= and keeps it for 30 days if the visitor consents. */
export function captureReferralFromUrl() {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  const ref = url.searchParams.get('ref')?.trim().toLowerCase()
  if (!ref || !/^[a-z0-9-]{1,40}$/.test(ref)) return

  url.searchParams.delete('ref')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)

  const consent = getConsent()
  if (consent === 'accepted') void recordReferral(ref, url.pathname)
  else if (consent === null) write(session(), PENDING_REFERRAL_KEY, JSON.stringify({ ref, path: url.pathname }))
}

export function setConsent(value: 'accepted' | 'declined') {
  write(local(), CONSENT_KEY, value)
  if (value === 'accepted') {
    write(local(), VISITOR_KEY, getVisitorId())
    const pending = read(session(), PENDING_REFERRAL_KEY)
    write(session(), PENDING_REFERRAL_KEY, null)
    if (pending) {
      try {
        const { ref, path } = JSON.parse(pending) as { ref: string; path: string }
        void recordReferral(ref, path)
      } catch {
        // ignore malformed pending referral
      }
    }
  } else {
    write(local(), REFERRAL_KEY, null)
    write(local(), VISITOR_KEY, null)
  }
}

/** The referral to send with an order, if still inside the 30 day window. */
export function getActiveReferral(): { visitorId: string } | null {
  if (getConsent() !== 'accepted') return null
  const raw = read(local(), REFERRAL_KEY)
  if (!raw) return null
  try {
    const stored = JSON.parse(raw) as StoredReferral
    if (Date.now() - stored.at > REFERRAL_DAYS * 86400000) {
      write(local(), REFERRAL_KEY, null)
      return null
    }
    return { visitorId: stored.visitorId }
  } catch {
    return null
  }
}

export function getQuestionnaireSessionId(reset = false): string {
  let id = reset ? null : read(session(), QUESTIONNAIRE_SESSION_KEY)
  if (!id) {
    id = newId()
    write(session(), QUESTIONNAIRE_SESSION_KEY, id)
  }
  return id
}

export function peekQuestionnaireSessionId(): string | null {
  return read(session(), QUESTIONNAIRE_SESSION_KEY)
}

export function trackQuestionnaire(
  event: 'start' | 'step' | 'complete' | 'cart',
  extra: { stepKind?: string; stepIndex?: number; rooms?: unknown[] } = {},
) {
  const sessionId = event === 'start' ? getQuestionnaireSessionId(true) : peekQuestionnaireSessionId()
  if (!sessionId) return
  void apiFetch('/api/events', { body: { sessionId, event, ...extra } }).catch(() => {})
}

// Gift voucher being redeemed in this browser session (applied automatically at checkout).
const VOUCHER_KEY = 'pd_redeem_voucher'
export const getPendingVoucher = () => read(session(), VOUCHER_KEY)
export const setPendingVoucher = (code: string | null) => write(session(), VOUCHER_KEY, code)
