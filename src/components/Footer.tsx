import { Link } from 'react-router-dom'
import { Heart, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E8DED2] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 text-2xl font-light tracking-wide text-[#4A4A4A]">
              PETITE DREAMS
            </div>
            <p className="text-sm text-[#6B6B6B]">
              הופכים עיצובי חדרים יפים לנגישים לכל משפחה
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-normal text-[#4A4A4A]">קישורים מהירים</h3>
            <ul className="space-y-2">
              {[
                ['/', 'בית'],
                ['/about', 'אודות'],
                ['/questionnaire', 'התחל'],
                ['/account', 'החשבון שלי'],
                ['/tips', 'טיפים ועצות'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-[#6B6B6B] hover:text-[#C8B6A6]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-normal text-[#4A4A4A]">משפטי</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-[#6B6B6B] hover:text-[#C8B6A6]">
                  תנאי שימוש
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-[#6B6B6B] hover:text-[#C8B6A6]">
                  מדיניות פרטיות
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-normal text-[#4A4A4A]">יצירת קשר</h3>
            <a
              href="mailto:info@petite-dreams.com"
              className="flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#C8B6A6]"
            >
              <Mail className="h-4 w-4" />
              info@petite-dreams.com
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#E8DED2] pt-8 md:flex-row">
          <p className="text-sm text-[#6B6B6B]">© 2026 PETITE DREAMS. כל הזכויות שמורות.</p>
          <p className="flex items-center gap-1 text-sm text-[#6B6B6B]">
            נוצר עם <Heart className="h-4 w-4 fill-current text-[#C8B6A6]" /> למשפחות
          </p>
        </div>
      </div>
    </footer>
  )
}
