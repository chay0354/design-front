import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Header } from '../components/Header'
import { login } from '../utils/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('אנא הכניסי גם אימייל וגם סיסמה')
      return
    }

    const user = login(email, password)

    if (user) {
      const intendedPackage = sessionStorage.getItem('intended_package')
      if (intendedPackage) {
        const childName = sessionStorage.getItem('intended_child_name') || ''
        const childAge = sessionStorage.getItem('intended_child_age') || ''
        sessionStorage.removeItem('intended_package')
        sessionStorage.removeItem('intended_child_name')
        sessionStorage.removeItem('intended_child_age')
        navigate(
          `/checkout/${intendedPackage}?childName=${encodeURIComponent(childName)}&childAge=${childAge}`,
        )
      } else {
        navigate('/account')
      }
    } else {
      setError('ההתחברות נכשלה. אנא נסי שוב.')
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />

      <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C8B6A6]">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-light text-[#4A4A4A]">ברוכה שובך</h1>
            <p className="text-[#6B6B6B]">התחברי כדי לגשת לחבילות העיצוב שלך</p>
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
                className="w-full rounded-sm border border-[#E8DED2] bg-[#F9F7F4] px-4 py-3 focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none"
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
                className="w-full rounded-sm border border-[#E8DED2] bg-[#F9F7F4] px-4 py-3 focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-sm border border-[#F5D4D4] bg-[#FCF0F0] px-4 py-3 text-[#A05A5A]">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-sm bg-[#C8B6A6] px-6 py-3 text-white transition-colors hover:bg-[#B5A99A]"
            >
              התחברי
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#6B6B6B]">
              אין לך חשבון?{' '}
              <button type="button" className="text-[#C8B6A6] hover:underline">
                הרשמה
              </button>
            </p>
          </div>

          <div className="mt-6 rounded-sm border border-[#D4E7F7] bg-[#F0F8FF] p-4">
            <p className="text-sm text-[#6B6B6B]">
              <strong className="text-[#4A4A4A]">דמו:</strong> הכניסי כל אימייל וסיסמה כדי להתחבר
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
