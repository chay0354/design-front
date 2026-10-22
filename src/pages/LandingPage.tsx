import { Link } from 'react-router-dom'
import { BrushTitle } from '../components/BrushTitle'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

const heroBackground = '/assets/hero-background.jpg'
const logo = '/assets/logo-brand.png'

const reasons = [
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
    icon: '/assets/icons/grows-with-child.png?v=4',
    title: 'החבילה גדלה עם הילד',
    text: 'כשהילד גדל ומגלה אהבות חדשות, נזכיר לכם שאפשר להתאים את החדר מחדש לשלב הבא, במחיר מופחת.',
  },
]

const included = [
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
    icon: '/assets/icons/chosen-items.png?v=4',
    title: 'פריטים שנבחרו עבורכם',
    text: 'קישורים לרכישה עצמית של פריטים יפים ומדויקים לקונספט, שנבחרו בקפידה מאתרי קניות אונליין-במחירים נגישים וללא פערי תיווך ומיתוג.',
  },
  {
    icon: '/assets/icons/room-design.png?v=4',
    title: 'כך העיצוב מתחבר בחדר',
    text: 'הדמיה מעוצבת שממחישה את הקונספט, הצבעים והשילובים בחדר, לצד טיפים למיקומים, גבהים ויצירת פינות מעוצבות.',
  },
]

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBFAF8]">
      <Header />

      <div className="px-3 pt-3 sm:px-4 sm:pt-4">
        <section className="relative isolate mx-auto max-w-[1240px] overflow-hidden rounded-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${heroBackground}')` }}
          />
          <div className="absolute inset-0 bg-[#FBF8F4]/80" />

          <div className="relative z-10 mx-auto max-w-3xl px-4 pt-14 pb-16 text-center sm:px-6 sm:pt-20 sm:pb-20">
            <img
              src={logo}
              alt="Petite dreams, Great design for little ones"
              className="mx-auto mb-6 h-28 w-auto object-contain sm:h-40"
            />

            <h1 className="mb-6 text-4xl font-light leading-tight text-[#3C3834] italic sm:text-[2.9rem]">
              עיצוב חדר ילדים קסום בקלות
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-xl font-light text-[#4A4540] sm:text-2xl">
              חדר ילדים מעוצב, עם כל מה שצריך כדי להגשים אותו
            </p>
            <p className="mx-auto mb-10 text-sm text-[#7A726A] sm:text-base">
              עיצוב פנים מקצועי ברבע מהעלות של מעצב פרטי
            </p>

            <Link
              to="/questionnaire"
              className="inline-block rounded-lg bg-[#B9A491] px-10 py-3.5 text-sm text-white shadow-sm transition-colors hover:bg-[#A8927F] sm:text-base"
            >
              אני רוצה חדר מעוצב עכשיו
            </Link>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-5xl px-4 pt-16 pb-14 sm:px-6 lg:px-8">
        <BrushTitle className="mb-12 text-2xl sm:text-[1.7rem]">למה לבחור ב-PETITE DREAMS?</BrushTitle>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {reasons.map(({ icon, title, text }) => (
            <article
              key={title}
              className="flex h-full flex-col rounded-md border border-[#EDE6DE] bg-white px-7 pt-7 pb-10 shadow-[0_2px_8px_rgba(120,100,80,0.05)]"
            >
              <img src={icon} alt="" className="mx-auto mb-5 h-16 w-16 object-contain" />
              <h3 className="mb-4 text-lg leading-8 font-light text-[#3C3834] sm:text-xl">{title}</h3>
              <p className="text-sm leading-7 text-[#7A726A]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#F7F5F2] px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <BrushTitle className="mb-12 text-2xl sm:text-[1.7rem]">מה כלול בחבילה שלכם</BrushTitle>
          <div className="grid gap-6 md:grid-cols-2 md:gap-7">
            {included.map(({ icon, title, text }) => (
              <article
                key={title}
                className="rounded-md border border-[#E6DED5] bg-white px-7 py-7 shadow-[0_2px_8px_rgba(120,100,80,0.06)]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <img src={icon} alt="" className="h-14 w-14 shrink-0 object-contain" />
                  <h3 className="text-base font-normal text-[#3C3834]">{title}</h3>
                </div>
                <p className="text-[15px] leading-7 text-[#5A544E]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
