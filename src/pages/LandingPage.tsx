import { Link } from 'react-router-dom'
import { Clock, Home as HomeIcon, Palette, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

const heroBackground = '/assets/hero-background.png'
const logo = '/assets/logo-brand.png'
const starIcon = '/assets/star-icon.png'
const roomVisualization = '/assets/room-visualization.png'

function SectionStar() {
  return <img src={starIcon} alt="" className="h-6 w-6 opacity-60" aria-hidden />
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FDFCFB]">
      <Header />

      <section className="relative isolate py-20">
        {/* Full-width hero background (matches Figma edge-to-edge feel) */}
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-[calc(100vw-2rem)] max-w-[1440px] -translate-x-1/2 overflow-hidden rounded-lg sm:w-[calc(100vw-3rem)]"
          style={{
            backgroundImage: `url('${heroBackground}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/70 to-white/75" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="-mb-8 mb-2 flex justify-center">
            <img
              src={logo}
              alt="Petite Dreams - Great design for little ones"
              className="-mb-8 h-48 w-auto object-contain md:h-72"
            />
          </div>

          <h1 className="-mt-12 mb-6 text-[48px] font-light italic text-[#4A4A4A]">
            עיצוב חדר ילדים בקלות ובמהירות
          </h1>
          <p className="mx-auto mb-4 max-w-3xl text-2xl font-normal text-[#6B6B6B] md:text-3xl">
            חבילות עיצוב מוכנות עם כל מה שצריך
          </p>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-[#8B8B8B]">
            ₪480-₪560 במקום ₪2000+ למעצב
          </p>

          <Link
            to="/questionnaire"
            className="inline-block rounded-md bg-[#C8B6A6] px-10 py-4 text-lg font-normal text-white shadow-sm transition-colors hover:bg-[#B5A99A]"
          >
            אני רוצה חדר מעוצב עכשיו
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-16 flex items-center justify-center gap-4 text-center text-3xl font-light text-[#4A4A4A]">
          <SectionStar />
          למה לבחור ב-PETITE DREAMS?
          <SectionStar />
        </h2>

        <div className="grid gap-12 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: 'יוקרה במחיר נגיש',
              text: 'קבלו עיצוב פנים מקצועי בשבריר מהמחיר המסורתי. מושלם למשפחות עם תקציב מוגבל.',
            },
            {
              icon: Clock,
              title: 'מהיר וקל',
              text: 'מלאו שאלון פשוט וקבלו חבילת עיצוב מלאה באופן מיידי. בלי לחכות שבועות למעצב.',
            },
            {
              icon: TrendingUp,
              title: 'החבילה גדלה עם הילד',
              text: 'כשהילד שלכם גדל, עדכנו את עיצוב החדר במחיר מופחת. אנחנו נזכיר לכם מתי הגיע הזמן לרענן.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-sm border border-[#E8DED2] bg-white p-10 shadow-sm"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-sm bg-[#F5F1ED]">
                <Icon className="h-6 w-6 text-[#C8B6A6]" />
              </div>
              <h3 className="mb-4 text-xl font-normal text-[#4A4A4A]">{title}</h3>
              <p className="font-light leading-relaxed text-[#6B6B6B]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-16 flex items-center justify-center gap-4 text-center text-3xl font-light text-[#4A4A4A]">
          <SectionStar />
          מה כלול בחבילה שלכם
          <SectionStar />
        </h2>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {[
            { icon: Palette, title: 'לוח צבעים מדויק', text: 'קודי צבע מדויקים לכל רכיב בחדר' },
            {
              icon: HomeIcon,
              title: 'מדריך מיקום מפורט',
              text: 'גבהי תלייה מדויקים לכל קיר ואלמנט עיצובי',
            },
            {
              icon: ShoppingBag,
              title: 'קישורי קנייה ישירים',
              text: 'קישורים לרכישת כל פריט ב-AliExpress (ספקים נוספים בקרוב)',
            },
            {
              icon: Sparkles,
              title: 'הדמיה תלת-ממדית',
              text: 'ראו את עיצוב החדר במודל תלת-ממדי גנרי עם סיור אינטראקטיבי',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#F5F1ED]">
                <Icon className="h-5 w-5 text-[#C8B6A6]" />
              </div>
              <div>
                <h4 className="mb-2 font-normal text-[#4A4A4A]">{title}</h4>
                <p className="font-light text-[#6B6B6B]">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-8">
          <p className="leading-relaxed text-[#6B6B6B]">
            <strong className="text-[#4A4A4A]">שימו לב:</strong> זו הדמיה לדוגמא של פריסת
            חדר גנרית (4 קירות, חלון, דלת), לא את החדר האמיתי של הילד שלכם. רוב חדרי הילדים
            עוקבים אחר פריסות סטנדרטיות, מה שהופך את זה לכלי תכנון יעיל.
          </p>
          <div className="mt-8">
            <img
              src={roomVisualization}
              alt="דוגמה להדמיית חדר ילדים"
              className="w-full rounded-sm shadow-md"
            />
            <p className="mt-3 text-center text-sm font-light text-[#8B8B8B]">
              ההדמיה המלאה תפתח לאחר הרכישה
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 flex items-center justify-center gap-4 text-4xl font-light text-[#4A4A4A]">
          <img src={starIcon} alt="" className="h-7 w-7 opacity-60" aria-hidden />
          אני רוצה חדר מעוצב עכשיו
          <img src={starIcon} alt="" className="h-7 w-7 opacity-60" aria-hidden />
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-xl font-light text-[#6B6B6B]">
          ענו על כמה שאלות פשוטות וקבלו את חבילת העיצוב המותאמת שלכם תוך דקות
        </p>
        <Link
          to="/questionnaire"
          className="inline-block rounded-md bg-[#C8B6A6] px-10 py-4 text-lg font-normal text-white shadow-sm transition-colors hover:bg-[#B5A99A]"
        >
          התחילי עכשיו
        </Link>
      </section>

      <Footer />
    </div>
  )
}
