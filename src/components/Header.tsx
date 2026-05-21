import { Link, useNavigate } from 'react-router-dom'
import { Home, LogOut, User } from 'lucide-react'
import { getCurrentUser, logout } from '../utils/auth'

export function Header() {
  const navigate = useNavigate()
  const user = getCurrentUser()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8DED2] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-2xl font-light tracking-wide text-[#4A4A4A]">
          PETITE DREAMS
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-[#6B6B6B] transition-colors hover:bg-[#F9F7F4]"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">בית</span>
          </Link>

          <Link
            to="/about"
            className="rounded-sm px-3 py-2 text-[#6B6B6B] transition-colors hover:bg-[#F9F7F4]"
          >
            אודות
          </Link>

          {user ? (
            <>
              <Link
                to="/account"
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-[#6B6B6B] transition-colors hover:bg-[#F9F7F4]"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">החשבון שלי</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-[#6B6B6B] transition-colors hover:bg-[#F9F7F4]"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">התנתק</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-sm bg-[#C8B6A6] px-4 py-2 text-white transition-colors hover:bg-[#B5A99A]"
            >
              התחבר
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
