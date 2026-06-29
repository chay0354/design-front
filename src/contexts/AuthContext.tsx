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
import type { ChildInfo, PurchaseOrder, User } from '../utils/auth'

interface PetiteProfileRow {
  id: string
  email: string
  name: string
  is_admin: boolean
  purchased_packages: string[]
  children: ChildInfo[]
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
  purchasePackage: (
    packageId: string,
    childName?: string,
    childAge?: number,
    gender?: string,
    theme?: string,
    colorPreference?: string,
  ) => Promise<void>
  purchaseAdditionalChild: (
    packageId: string,
    childName: string,
    childAge: number,
    gender?: string,
    theme?: string,
    colorPreference?: string,
  ) => Promise<void>
  completePurchase: (orders: PurchaseOrder[]) => Promise<void>
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
      purchased_packages: [],
      children: [],
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

async function saveProfileWithToken(accessToken: string, user: User): Promise<void> {
  const res = await profileRequest(
    accessToken,
    `petite_profiles?id=eq.${encodeURIComponent(user.id)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        purchased_packages: user.purchasedPackages,
        children: user.children,
        updated_at: new Date().toISOString(),
      }),
    },
  )

  if (!res.ok) {
    throw new Error(await res.text())
  }
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

function authErrorMessage(error: { message: string; code?: string }): string {
  const message = error.message.toLowerCase()
  if (error.code === 'PGRST205' || message.includes('petite_profiles')) {
    return 'שגיאת שרת — נסי שוב בעוד רגע'
  }
  if (message.includes('invalid login credentials')) {
    return 'אימייל או סיסמה שגויים'
  }
  if (message.includes('user already registered')) {
    return 'כתובת האימייל כבר רשומה — נסי להתחבר'
  }
  if (message.includes('password')) {
    return 'הסיסמה חייבת להכיל לפחות 6 תווים'
  }
  if (message.includes('email')) {
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer async Supabase calls — awaiting inside this callback deadlocks signInWithPassword.
      setTimeout(() => {
        void (async () => {
          if (!session?.user.email || !session.access_token) {
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
            setUser(null)
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
      const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password })
      if (error) {
        return { error: authErrorMessage(error), user: null }
      }

      try {
        if (data.session?.access_token && data.user?.email) {
          const profile = await loadProfileWithToken(
            data.session.access_token,
            data.user.id,
            data.user.email,
          )
          setUser(profile)
          return { error: null, user: profile }
        }

        if (data.user?.email && !data.session) {
          const result = await signIn(normalizedEmail, password)
          if (!result.error) {
            return result
          }
          return { error: 'נרשמת בהצלחה! בדקי את האימייל לאישור, ואז התחברי.', user: null }
        }
      } catch (profileError) {
        return {
          error: authErrorMessage(profileError as { message: string; code?: string }),
          user: null,
        }
      }

      return { error: 'לא הצלחנו להשלים את ההרשמה. נסי שוב.', user: null }
    },
    [signIn],
  )

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const completePurchase = useCallback(
    async (orders: PurchaseOrder[]) => {
      if (!user || orders.length === 0) return

      const purchaseDate = new Date().toISOString()
      const purchasedPackages = [...user.purchasedPackages]
      const children = [...user.children]

      for (const order of orders) {
        if (!purchasedPackages.includes(order.packageId)) {
          purchasedPackages.push(order.packageId)
        }

        const alreadyAdded = children.some(
          (child) => child.packageId === order.packageId && child.name === order.childName,
        )
        if (!alreadyAdded) {
          children.push({
            name: order.childName,
            age: order.childAge,
            packageId: order.packageId,
            purchaseDate,
            gender: order.gender,
            theme: order.theme,
            colorPreference: order.colorPreference,
          })
        }
      }

      const nextUser: User = { ...user, purchasedPackages, children }

      const token = await getAccessToken()
      if (!token) return

      await saveProfileWithToken(token, nextUser)
      setUser(nextUser)
    },
    [user],
  )

  const purchasePackage = useCallback(
    async (
      packageId: string,
      childName?: string,
      childAge?: number,
      gender?: string,
      theme?: string,
      colorPreference?: string,
    ) => {
      if (!user) return

      const nextUser: User = {
        ...user,
        purchasedPackages: user.purchasedPackages.includes(packageId)
          ? user.purchasedPackages
          : [...user.purchasedPackages, packageId],
        children: [...user.children],
      }

      if (childName && childAge) {
        const alreadyAdded = nextUser.children.some(
          (child) => child.packageId === packageId && child.name === childName,
        )
        if (!alreadyAdded) {
          nextUser.children.push({
            name: childName,
            age: childAge,
            packageId,
            purchaseDate: new Date().toISOString(),
            gender,
            theme,
            colorPreference,
          })
        }
      }

      const token = await getAccessToken()
      if (!token) return

      await saveProfileWithToken(token, nextUser)
      setUser(nextUser)
    },
    [user],
  )

  const purchaseAdditionalChild = useCallback(
    async (
      packageId: string,
      childName: string,
      childAge: number,
      gender?: string,
      theme?: string,
      colorPreference?: string,
    ) => {
      if (!user) return

      const nextUser: User = {
        ...user,
        purchasedPackages: user.purchasedPackages.includes(packageId)
          ? user.purchasedPackages
          : [...user.purchasedPackages, packageId],
        children: [
          ...user.children,
          {
            name: childName,
            age: childAge,
            packageId,
            purchaseDate: new Date().toISOString(),
            gender,
            theme,
            colorPreference,
          },
        ],
      }

      const token = await getAccessToken()
      if (!token) return

      await saveProfileWithToken(token, nextUser)
      setUser(nextUser)
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      logout,
      purchasePackage,
      purchaseAdditionalChild,
      completePurchase,
    }),
    [user, loading, signIn, signUp, logout, purchasePackage, purchaseAdditionalChild, completePurchase],
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
