import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Check, Grid3X3, Home, LogOut, Settings, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function MenuIcon() {
  return (
    <span dir="ltr" className="inline-flex">
      <svg viewBox="0 0 28 18" className="h-[18px] w-7" aria-hidden="true">
        <path d="M4 3h20M4 9h20M4 15h20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

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

  const links = (
    <>
      <NavLink to="/" end className={navLink} onClick={() => setMenuOpen(false)}>
        <Home className="h-4 w-4" strokeWidth={1.5} />
        בית
      </NavLink>
      {user && (
        <NavLink to="/account" className={navLink} onClick={() => setMenuOpen(false)}>
          <User className="h-4 w-4" strokeWidth={1.5} />
          החשבון שלי
        </NavLink>
      )}
      <NavLink to="/about" className={navLink} onClick={() => setMenuOpen(false)}>
        אודות
      </NavLink>
      <NavLink to="/faq" className={navLink} onClick={() => setMenuOpen(false)}>
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
          onClick={() => setMenuOpen(false)}
          className="whitespace-nowrap rounded-md bg-[#B39A86] px-4 py-1.5 text-sm text-white transition-colors hover:bg-[#A28A76]"
        >
          התחבר
        </Link>
      )}
    </>
  )

  const cart = (
    <Link to={cartTarget} aria-label="סל הקניות" className="relative text-[#4A4540] hover:text-[#3C3834]">
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      <span className="absolute -bottom-1 -left-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B39A86] px-1 text-[10px] leading-none text-white">
        {intendedPackage ? 1 : 0}
      </span>
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-[#EFEAE4] bg-white">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[68px] sm:px-6 lg:px-8">
        <button
          type="button"
          className="text-[#4A403A] sm:hidden"
          aria-label="תפריט"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon />
        </button>

        <Link
          to="/"
          aria-label="PETITE DREAMS"
          className="absolute left-1/2 shrink-0 -translate-x-1/2 sm:static sm:translate-x-0"
        >
          <img src="/assets/logo-header.png" alt="" className="h-11 w-auto sm:h-12" />
        </Link>

        <Link
          to={user ? '/account' : '/login'}
          aria-label={user ? 'מחובר, לאזור האישי' : 'לא מחובר, להתחברות'}
          className="relative text-[#5A544E] hover:text-[#3C3834] sm:hidden"
        >
          <User className="h-5 w-5" strokeWidth={1.6} />
          {user && (
            <span className="absolute -bottom-1 -left-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[#5A544E]">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-7 text-sm sm:flex">
          {links}
          {cart}
        </nav>
      </div>

      {menuOpen && (
        <nav className="flex flex-col items-start gap-4 border-t border-[#EFEAE4] px-5 py-4 text-sm sm:hidden">
          {links}
        </nav>
      )}
    </header>
  )
}
