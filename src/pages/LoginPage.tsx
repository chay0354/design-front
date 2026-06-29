import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import { Header } from '../components/Header'
import { useAuth } from '../contexts/AuthContext'

type AuthMode = 'signin' | 'signup'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>(() =>
    sessionStorage.getItem('intended_package') ? 'signup' : 'signin',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectAfterAuth = (isAdmin: boolean) => {
    if (isAdmin) {
      navigate('/admin')
      return
    }

    const intendedPackage = sessionStorage.getItem('intended_package')
    const intendedCheckoutQuery = sessionStorage.getItem('intended_checkout_query')
    if (intendedPackage) {
      sessionStorage.removeItem('intended_package')
      sessionStorage.removeItem('intended_checkout_query')
      const query = intendedCheckoutQuery ? `?${intendedCheckoutQuery}` : ''
      navigate(`/checkout/${intendedPackage}${query}`)
    } else {
      navigate('/account')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!email || !password) {
      setError('אנא הכניסי גם אימייל וגם סיסמה')
      return
    }

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }

    setSubmitting(true)
    try {
      const result =
        mode === 'signin' ? await signIn(email, password) : await signUp(email, password)

      if (result.error) {
        if (mode === 'signup' && result.error.includes('אימייל')) {
          setInfo(result.error)
        } else {
          setError(result.error)
        }
        return
      }

      redirectAfterAuth(result.user?.isAdmin ?? false)
    } finally {
      setSubmitting(false)
    }
  }

  const isSignIn = mode === 'signin'

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />

      <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C8B6A6]">
              {isSignIn ? (
                <LogIn className="h-8 w-8 text-white" />
              ) : (
                <UserPlus className="h-8 w-8 text-white" />
              )}
            </div>
            <h1 className="mb-2 text-3xl font-light text-[#4A4A4A]">
              {isSignIn ? 'ברוכה שובך' : 'יצירת חשבון'}
            </h1>
            <p className="text-[#6B6B6B]">
              {isSignIn
                ? 'התחברי כדי לגשת לחבילות העיצוב שלך'
                : sessionStorage.getItem('intended_package')
                  ? 'הירשמי כדי לשמור את החבילה ולהמשיך לרכישה'
                  : 'הירשמי כדי לשמור את החבילות והרכישות שלך'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-normal text-[#6B6B6B]">
                כתובת אימייל
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                dir="ltr"
                className="w-full rounded-sm border border-[#E8DED2] bg-[#F9F7F4] px-4 py-3 text-left focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-normal text-[#6B6B6B]">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full rounded-sm border border-[#E8DED2] bg-[#F9F7F4] px-4 py-3 text-left focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none"
                autoComplete={isSignIn ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <div className="rounded-sm border border-[#F5D4D4] bg-[#FCF0F0] px-4 py-3 text-[#A05A5A]">
                {error}
              </div>
            )}

            {info && (
              <div className="rounded-sm border border-[#D4E7F7] bg-[#F0F8FF] px-4 py-3 text-[#4A6670]">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm bg-[#C8B6A6] px-6 py-3 text-white transition-colors hover:bg-[#B5A99A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'רק רגע...' : isSignIn ? 'התחברי' : 'הירשמי'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#6B6B6B]">
              {isSignIn ? 'אין לך חשבון?' : 'כבר יש לך חשבון?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(isSignIn ? 'signup' : 'signin')
                  setError('')
                  setInfo('')
                }}
                className="text-[#C8B6A6] hover:underline"
              >
                {isSignIn ? 'הרשמה' : 'התחברי'}
              </button>
            </p>
          </div>

          <div className="mt-6 text-center text-sm text-[#8B8B8B]">
            <Link to="/" className="hover:text-[#C8B6A6]">
              חזרה לדף הבית
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
