import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

const heroBackground = '/assets/hero-background.png'
const logo = '/assets/logo-brand.png'

function TitlePlus() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0 text-[#9A8874]" aria-hidden="true">
      <path d="M8 2.2v11.6M2.2 8h11.6" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-12 flex items-center justify-center gap-4 text-center">
      <TitlePlus />
      <span className="relative inline-block px-3 py-1.5 text-2xl font-light leading-none text-[#3C3834] sm:text-[1.65rem]">
        <svg
          viewBox="0 0 300 48"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 h-[140%] w-[112%] -translate-x-1/2 -translate-y-[48%] -rotate-[0.6deg]"
        >
          <path
            fill="#E4D9CC"
            d="M14 18C34 8 52 20 86 13C124 5 156 19 198 11C236 4 268 16 286 12C294 22 292 33 284 36C246 46 198 34 150 41C100 48 52 36 18 39C6 37 4 24 14 18Z"
          />
        </svg>
        <span className="relative">{children}</span>
      </span>
      <TitlePlus />
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
              title: 'עיצוב מקצועי במחיר נגיש',
              text: 'עיצוב איכותי בשבריר מהעלות של ליווי אישי, בלי להתפשר על רמת העיצוב או בחירת הפריטים. הנחה נוספת ניתנת לחבילות עבור אחים.',
            },
            {
              icon: '/assets/icons/easy-apply.png',
              title: 'מהיר וקל ליישום',
              text: 'מלאו שאלון פשוט וקבלו חבילת עיצוב מלאה באופן מיידי. בלי לחכות שבועות למעצב.',
            },
            {
              icon: '/assets/icons/grows-with-child.png?v=3',
              title: 'החבילה גדלה עם הילד',
              text: 'כשהילד גדל ומגלה אהבות חדשות, נזכיר לכם שאפשר להתאים את החדר מחדש לשלב הבא, במחיר מופחת.',
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
                icon: '/assets/icons/age-themes.png',
                title: 'נושאים אהובים, מותאמים לגיל',
                text: 'בחרו מתוך מספר נושאים פופולריים ומותאמי גיל, ליצירת חדר שמתחבר לעולם של הילד ומרגיש באמת שלו.',
              },
              {
                icon: '/assets/icons/color-palette.png',
                title: 'פלטת גוונים מותאמת לקונספט',
                text: 'בחרו את כיוון הגוונים המועדף עליכם מתוך פלטות שנבנו מראש. בחבילות הכוללות צביעה תקבלו גם מספר גוון מומלץ לקיר עם קישור ישיר לרכישה.',
              },
              {
                icon: '/assets/icons/chosen-items.png?v=3',
                title: 'פריטים שנבחרו עבורכם',
                text: 'קישורים לרכישה עצמית של פריטים יפים ומדויקים לקונספט, שנבחרו בקפידה מאתרי קניות אונליין-במחירים נגישים וללא פערי תיווך ומיסוי.',
              },
              {
                icon: '/assets/icons/room-design.png?v=3',
                title: 'כך העיצוב מתחבר בחדר',
                text: 'הדמיה מעוצבת שממחישה את הקונספט, הצבעים והשילובים בחדר, לצד טיפים למיקומים, גבהים ויצירת פינות מעוצבות.',
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
