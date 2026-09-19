import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
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
        <div className="grid items-start gap-6 md:grid-cols-3">
          {[
            {
              icon: '/assets/icons/affordable.png',
              title: 'עיצוב במחיר נגיש',
              text: 'קבלו עיצוב פנים מקצועי בשבריר מהמחיר המסורתי. מושלם למשפחות עם תקציב מוגבל.',
            },
            {
              icon: '/assets/icons/easy-apply.png',
              title: 'מהיר וקל ליישום',
              text: 'מלאו שאלון פשוט וקבלו חבילת עיצוב מלאה באופן מיידי, בלי לחכות שבועות למעצב.',
            },
            {
              icon: '/assets/icons/grows-with-child.png?v=3',
              title: 'החבילה גדלה עם הילד',
              text: 'כשהילד גדל, אפשר לרענן את החדר במחיר מופחת. נזכיר לכם מתי הגיע הזמן.',
            },
          ].map(({ icon, title, text }) => (
            <div key={title} className="flex h-full flex-col items-center px-4 py-8 text-center">
              <div className="mb-5 flex h-20 w-20 shrink-0 items-center justify-center">
                <img src={icon} alt="" className="h-20 w-20 object-contain" />
              </div>
              <h3 className="mb-3 text-lg font-light text-[#4A4A4A]">{title}</h3>
              <p className="max-w-[260px] text-sm leading-7 text-[#8B8B8B]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#FDFCFB] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <SectionTitle>מה כלול בחבילה שלכם</SectionTitle>
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {[
              {
                icon: '/assets/icons/color-palette.png',
                title: 'פלטת גוונים מדויקת',
                text: 'קודי צבע מדויקים לכל רכיב בחדר, כדי לשחזר את המראה בקלות.',
              },
              {
                icon: '/assets/icons/age-themes.png',
                title: 'נושאים אהובים, מותאמים לגיל',
                text: 'בחרו ממספר נושאים פופולריים ומותאמים לגיל הילד, שמתחברים לחדר ומרגישים בשלווה.',
              },
              {
                icon: '/assets/icons/room-design.png?v=3',
                title: 'כך מתחבר בחדר',
                text: 'הדמיה מוכנה של החדר, הצבעים והטפטים, עד הפרטים שיוצרים תמונה שלמה.',
              },
              {
                icon: '/assets/icons/chosen-items.png?v=3',
                title: 'פריטים שנבחרו עבורכם',
                text: 'קישורים לרכישת כל פריט, עם הערות כמות ומידה שמתאימים בדיוק.',
              },
            ].map(({ icon, title, text }) => (
              <div
                key={title}
                className="rounded-[20px] bg-white px-8 py-9 shadow-[0_10px_32px_rgba(176,160,140,0.08)]"
              >
                <div className="mb-3 flex items-start gap-4">
                  <img src={icon} alt="" className="mt-0.5 h-20 w-20 shrink-0 object-contain" />
                  <h4 className="text-lg font-light leading-7 text-[#4A4A4A]">{title}</h4>
                </div>
                <p className="text-sm leading-7 text-[#8B8B8B]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
