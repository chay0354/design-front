import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Grid3X3, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    const wasAdmin = user?.isAdmin
    await logout()
    navigate(wasAdmin ? '/login' : '/')
  }

  if (user?.isAdmin) {
    return (
      <header className="sticky top-0 z-50 border-b border-[#E8DED2] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/admin" className="text-2xl font-light tracking-wide text-[#4A4A4A]">
            PETITE DREAMS
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-[#F9F7F4] text-[#4A4A4A]'
                    : 'text-[#6B6B6B] hover:bg-[#F9F7F4]'
                }`
              }
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">לוח ניהול</span>
            </NavLink>
            <NavLink
              to="/admin/collage"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-[#F9F7F4] text-[#4A4A4A]'
                    : 'text-[#6B6B6B] hover:bg-[#F9F7F4]'
                }`
              }
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">צור קולאז</span>
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-sm px-3 py-2 text-[#6B6B6B] transition-colors hover:bg-[#F9F7F4]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">התנתק</span>
            </button>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-sm font-light tracking-[0.18em] text-[#4A4A4A]">
          PETITE DREAMS
        </Link>

        <nav className="flex items-center gap-5 text-sm text-[#8B8B8B]">
          <Link to="/" className="transition-colors hover:text-[#4A4A4A]">
            בית
          </Link>
          <Link to="/about" className="transition-colors hover:text-[#4A4A4A]">
            אודות
          </Link>
          <Link to="/faq" className="transition-colors hover:text-[#4A4A4A]">
            שאלות נפוצות
          </Link>
          {user ? (
            <>
              <Link to="/account" className="transition-colors hover:text-[#4A4A4A]">
                החשבון שלי
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="transition-colors hover:text-[#4A4A4A]"
              >
                התנתק
              </button>
            </>
          ) : (
            <Link to="/login" className="transition-colors hover:text-[#4A4A4A]">
              התחבר
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
