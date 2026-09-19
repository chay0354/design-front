import { Link } from 'react-router-dom'
import { Box, Calendar, Gift, Palette, Plus, Ruler, Sprout, Tag } from 'lucide-react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

const heroBackground = '/assets/hero-background.png'
const logo = '/assets/logo-brand.png'

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-12 flex items-center justify-center gap-3 text-center text-2xl font-light text-[#4A4A4A] sm:text-3xl">
      <Plus className="h-5 w-5 text-[#C4B8A8]" strokeWidth={1.5} />
      {children}
      <Plus className="h-5 w-5 text-[#C4B8A8]" strokeWidth={1.5} />
    </h2>
  )
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroBackground}')` }}
        />
        <div className="absolute inset-0 bg-white/78" />
        <div className="pointer-events-none absolute inset-0">
          <Plus className="absolute top-16 left-[18%] h-5 w-5 text-[#D8CFC4]" strokeWidth={1.5} />
          <Plus className="absolute top-24 right-[22%] h-4 w-4 text-[#D8CFC4]" strokeWidth={1.5} />
          <Plus className="absolute bottom-28 left-[28%] h-4 w-4 text-[#D8CFC4]" strokeWidth={1.5} />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <img
            src={logo}
            alt="Petite dreams — Great design for little ones"
            className="mx-auto mb-8 h-28 w-auto object-contain sm:h-36"
          />

          <h1 className="mb-5 text-4xl font-light leading-tight text-[#4A4A4A] sm:text-5xl">
            עיצוב חדר ילדים בקלות
          </h1>
          <p className="mx-auto mb-3 max-w-xl text-lg font-light text-[#8B8B8B] sm:text-xl">
            חבילות עיצוב מוכנות עם כל מה שצריך
          </p>
          <p className="mx-auto mb-10 text-sm text-[#B5B0A8]">
            עיצוב פנים מקצועי ברבע מהעלות
          </p>

          <Link
            to="/questionnaire"
            className="inline-block rounded-full bg-[#C4B8A8] px-8 py-3 text-sm text-white transition-colors hover:bg-[#B5A99A]"
          >
            אני רוצה חדר מעוצב עכשיו
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionTitle>למה לבחור ב-PETITE DREAMS?</SectionTitle>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Tag,
              title: 'עיצוב במחיר נגיש',
              text: 'קבלו עיצוב פנים מקצועי בשבריר מהמחיר המסורתי. מושלם למשפחות עם תקציב מוגבל.',
            },
            {
              icon: Calendar,
              title: 'מהיר וקל ליישום',
              text: 'מלאו שאלון פשוט וקבלו חבילת עיצוב מלאה באופן מיידי, בלי לחכות שבועות למעצב.',
            },
            {
              icon: Sprout,
              title: 'החבילה גדלה עם הילד',
              text: 'כשהילד גדל, אפשר לרענן את החדר במחיר מופחת. נזכיר לכם מתי הגיע הזמן.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="px-4 py-8 text-center">
              <Icon className="mx-auto mb-5 h-7 w-7 text-[#C4B8A8]" strokeWidth={1.25} />
              <h3 className="mb-3 text-lg font-light text-[#4A4A4A]">{title}</h3>
              <p className="text-sm leading-7 text-[#8B8B8B]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <SectionTitle>מה כלול בחבילה שלכם</SectionTitle>
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {[
            {
              icon: Palette,
              title: 'לוח צבעים מדויק',
              text: 'קודי צבע מדויקים לכל רכיב בחדר, כדי לשחזר את המראה בקלות.',
            },
            {
              icon: Gift,
              title: 'קישורי קנייה ישירים',
              text: 'קישורים לרכישת כל פריט ב-AliExpress, עם הערות כמות ומידה.',
            },
            {
              icon: Ruler,
              title: 'מדריך מיקום מפורט',
              text: 'גבהי תלייה והנחיות לכל קיר ואלמנט עיצובי בחדר.',
            },
            {
              icon: Box,
              title: 'הדמיה של החדר',
              text: 'ראו את עיצוב החדר בהדמיה מוכנה, כדי לדעת בדיוק איך הכל יושב יחד.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4">
              <Icon className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#C4B8A8]" strokeWidth={1.25} />
              <div>
                <h4 className="mb-2 text-lg font-light text-[#4A4A4A]">{title}</h4>
                <p className="text-sm leading-7 text-[#8B8B8B]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
