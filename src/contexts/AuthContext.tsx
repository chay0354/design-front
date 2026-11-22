import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type { ChildInfo, User } from '../utils/auth'
import { apiFetch } from '../utils/backend'

interface PetiteProfileRow {
  id: string
  email: string
  name: string
  is_admin: boolean
  purchased_packages: string[]
  children: ChildInfo[]
}

export interface OrderRoomRequest {
  roomId?: string
  displayName: string
  children: { name: string; age: number; gender: string }[]
  designGender: string
  designAge: number
  ageChoice: unknown
  ageGroup: string
  ageTrack: 'child' | 'cross-age'
  packageId: string
  packageName: string
  theme: string
  colorPreference: string
  wallDesignOption: string
  packageSnapshot?: unknown
}

export interface OrderRequest {
  rooms: OrderRoomRequest[]
  couponCode?: string
  voucherCode?: string
  referral?: { visitorId: string } | null
  paymentOption?: 'full' | 'installments'
  sessionId?: string | null
}

export interface OrderResult {
  order: { id: string; orderNumber: number; total: number; discountTotal: number; voucherPackagesUsed: number }
  items: { id: string; roomId: string; packageId: string }[]
}

export interface AuthResult {
  error: string | null
  user: User | null
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
  /** Re-reads the profile (purchases, children) after a server-side change. */
  refreshProfile: () => Promise<void>
  /** Creates a paid order on the server and refreshes the profile. */
  submitOrder: (order: OrderRequest) => Promise<OrderResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapProfile(row: PetiteProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name || row.email.split('@')[0],
    isAdmin: row.is_admin ?? false,
    purchasedPackages: row.purchased_packages ?? [],
    children: Array.isArray(row.children) ? row.children : [],
  }
}

const supabaseRestUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseRestKey = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string

async function profileRequest(
  accessToken: string,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${supabaseRestUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseRestKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

async function fetchProfileRow(
  accessToken: string,
  userId: string,
): Promise<PetiteProfileRow | null> {
  const res = await profileRequest(
    accessToken,
    `petite_profiles?id=eq.${encodeURIComponent(userId)}&select=*`,
  )
  if (!res.ok) {
    throw new Error(await res.text())
  }
  const rows = (await res.json()) as PetiteProfileRow[]
  return rows[0] ?? null
}

async function createProfileRow(
  accessToken: string,
  userId: string,
  email: string,
): Promise<PetiteProfileRow> {
  const res = await profileRequest(accessToken, 'petite_profiles', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      id: userId,
      email,
      name: email.split('@')[0],
    }),
  })

  if (res.status === 409) {
    const existing = await fetchProfileRow(accessToken, userId)
    if (existing) return existing
  }

  if (!res.ok) {
    throw new Error(await res.text())
  }

  const rows = (await res.json()) as PetiteProfileRow[]
  return rows[0]
}

async function loadProfileWithToken(
  accessToken: string,
  userId: string,
  email: string,
): Promise<User> {
  const row = await fetchProfileRow(accessToken, userId)
  if (row) return mapProfile(row)
  const created = await createProfileRow(accessToken, userId, email)
  return mapProfile(created)
}

function authErrorMessage(error: { message: string; code?: string }): string {
  const message = error.message.toLowerCase()
  if (error.code === 'PGRST205' || message.includes('petite_profiles')) {
    return 'שגיאת שרת — נסי שוב בעוד רגע'
  }
  if (message.includes('over_email_send_rate_limit') || message.includes('only request this after')) {
    return 'ניסית להירשם כמה פעמים ברצף — המתיני כדקה ונסי שוב'
  }
  if (message.includes('email not confirmed')) {
    return 'החשבון נוצר, אבל עדיין לא אושר. נסי שוב בעוד רגע, או התחברי אחרי כמה שניות'
  }
  if (message.includes('invalid login credentials')) {
    return 'אימייל או סיסמה שגויים'
  }
  if (message.includes('user already registered') || message.includes('already been registered')) {
    return 'כתובת האימייל כבר רשומה — נסי להתחבר'
  }
  if (message.includes('password should be') || message.includes('password is too short')) {
    return 'הסיסמה חייבת להכיל לפחות 6 תווים'
  }
  if (
    message.includes('invalid email') ||
    message.includes('unable to validate email') ||
    message.includes('email address is invalid')
  ) {
    return 'כתובת אימייל לא תקינה'
  }
  return error.message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSessionUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      throw error
    }

    const session = data.session
    if (!session?.user.email || !session.access_token) {
      setUser(null)
      return
    }

    const profile = await loadProfileWithToken(
      session.access_token,
      session.user.id,
      session.user.email,
    )
    setUser(profile)
  }, [])

  useEffect(() => {
    let cancelled = false
    const safetyTimeout = setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 10000)

    loadSessionUser()
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
        clearTimeout(safetyTimeout)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Initial session is loaded by loadSessionUser — handling it again causes user flashes.
      if (event === 'INITIAL_SESSION') return

      setTimeout(() => {
        void (async () => {
          if (event === 'SIGNED_OUT' || !session?.user.email || !session.access_token) {
            setUser(null)
            setLoading(false)
            return
          }

          try {
            const profile = await loadProfileWithToken(
              session.access_token,
              session.user.id,
              session.user.email,
            )
            setUser(profile)
          } catch {
            // Keep the current user on transient profile refresh failures.
          } finally {
            setLoading(false)
          }
        })()
      }, 0)
    })

    return () => {
      cancelled = true
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [loadSessionUser])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })
    if (error) {
      return { error: authErrorMessage(error), user: null }
    }
    if (!data.user.email || !data.session?.access_token) {
      return { error: 'לא הצלחנו לטעון את פרטי המשתמש', user: null }
    }

    try {
      const profile = await loadProfileWithToken(
        data.session.access_token,
        data.user.id,
        data.user.email,
      )
      setUser(profile)
      return { error: null, user: profile }
    } catch (profileError) {
      return {
        error: authErrorMessage(profileError as { message: string; code?: string }),
        user: null,
      }
    }
  }, [])

  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const normalizedEmail = email.trim().toLowerCase()
      try {
        // Server-side signup confirms the email immediately and skips Auth's confirmation-mail rate limit.
        await apiFetch('/api/auth/signup', {
          body: { email: normalizedEmail, password },
          auth: false,
        })
        return await signIn(normalizedEmail, password)
      } catch (error) {
        return {
          error: authErrorMessage(error as { message: string; code?: string }),
          user: null,
        }
      }
    },
    [signIn],
  )

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    await loadSessionUser()
  }, [loadSessionUser])

  const submitOrder = useCallback(
    async (order: OrderRequest) => {
      const result = await apiFetch<OrderResult>('/api/checkout/orders', { body: order })
      await loadSessionUser()
      return result
    },
    [loadSessionUser],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      logout,
      refreshProfile,
      submitOrder,
    }),
    [user, loading, signIn, signUp, logout, refreshProfile, submitOrder],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
