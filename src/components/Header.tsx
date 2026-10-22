import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Grid3X3, Home, LogOut, Settings, ShoppingBag, User } from 'lucide-react'
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

  const intendedPackage = sessionStorage.getItem('intended_package')
  const intendedQuery = sessionStorage.getItem('intended_checkout_query')
  const cartTarget = intendedPackage
    ? `/checkout/${intendedPackage}${intendedQuery ? `?${intendedQuery}` : ''}`
    : '/questionnaire'

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#3C3834] ${
      isActive ? 'text-[#A88A72]' : 'text-[#4A4540]'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-[#EFEAE4] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:h-[60px] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-0 lg:px-8">
        <Link
          to="/"
          className="shrink-0 whitespace-nowrap text-xl font-light tracking-[0.06em] text-[#3C3834]"
        >
          PETITE DREAMS
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:flex-nowrap sm:gap-7">
          <NavLink to="/" end className={navLink}>
            <Home className="h-4 w-4" strokeWidth={1.5} />
            בית
          </NavLink>
          {user && (
            <NavLink to="/account" className={navLink}>
              <User className="h-4 w-4" strokeWidth={1.5} />
              החשבון שלי
            </NavLink>
          )}
          <NavLink to="/about" className={navLink}>
            אודות
          </NavLink>
          <NavLink to="/faq" className={navLink}>
            לפני שרוכשים
          </NavLink>
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="whitespace-nowrap rounded-md bg-[#B39A86] px-4 py-1.5 text-sm text-white transition-colors hover:bg-[#A28A76]"
            >
              התנתק
            </button>
          ) : (
            <Link
              to="/login"
              className="whitespace-nowrap rounded-md bg-[#B39A86] px-4 py-1.5 text-sm text-white transition-colors hover:bg-[#A28A76]"
            >
              התחבר
            </Link>
          )}
          <Link to={cartTarget} aria-label="סל הקניות" className="relative text-[#4A4540] hover:text-[#3C3834]">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            <span className="absolute -bottom-1 -left-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B39A86] px-1 text-[10px] leading-none text-white">
              {intendedPackage ? 1 : 0}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
