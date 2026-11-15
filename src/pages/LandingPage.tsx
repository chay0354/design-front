import type { LucideIcon } from 'lucide-react'
import { Check, CircleHelp, Clock, Frame, Heart, Lamp, Palette, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrushTitle } from '../components/BrushTitle'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

const heroPhoto = '/assets/hero-background.jpg'

const steps = [
  {
    n: '01',
    title: 'בוחרים את הסגנון',
    text: 'עונים על שאלון קצר ובוחרים את הנושא, הגוונים וההעדפות שלכם לחדר הילדים.',
  },
  {
    n: '02',
    title: 'מקבלים חבילת עיצוב',
    text: 'חבילה מוכנה בהתאם לבחירות שלכם, עם קונספט עיצובי מגובש, פריטים משלימים וקישורים לרכישה עצמאית.',
  },
  {
    n: '03',
    title: 'מעצבים בקצב שלכם',
    text: 'נעזרים בהדמיות, בטיפים מקצועיים ובכלים באזור האישי, ומיישמים את העיצוב בדרך שמתאימה לכם.',
  },
  {
    n: '04',
    title: 'ממשיכים לגדול יחד',
    text: 'ההעדפות נשמרות באזור האישי, וכשהילד גדל והטעם משתנה, תוכלו לבחור חבילה חדשה במחיר מופחת.',
  },
]

const reasons: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Heart,
    title: 'עיצוב מקצועי במחיר נגיש',
    text: 'חבילות שנוצרו מתוך ידע וניסיון מקצועי, עם תשומת לב לצבעים, לפרופורציות ולפרטים הקטנים, בעלות נגישה בהשוואה לליווי עיצוב אישי.',
  },
  {
    icon: CircleHelp,
    title: 'הבחירות הקטנות כבר נעשו עבורכם',
    text: 'איזה גוון מתאים למדבקות הקיר? אילו תמונות ישתלבו עם השטיח? ואיך הכול ייראה יחד? במקום לחפש ולהתלבט, תקבלו קונספט שבו כל הבחירות נעשו מתוך מחשבה על החדר כולו.',
  },
  {
    icon: Clock,
    title: 'עיצוב שמתאים גם לקצב שלכם',
    text: 'אפשר לרכוש את הפריטים וליישם את העיצוב בהדרגה, בהתאם לזמן ולתקציב שלכם.',
  },
]

const included: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Palette,
    title: 'קונספט עיצובי ופלטת גוונים',
    text: 'קונספט מגובש בהתאם לנושא ולהעדפות שבחרתם, עם שילוב מוקפד של צבעים, חומרים ופריטים דקורטיביים. בחבילות הכוללות צביעת קירות תקבלו גם מספר גוון מומלץ וקישור לרכישת הצבע.',
  },
  {
    icon: Frame,
    title: 'פריטים שנבחרו עבורכם',
    text: 'מבחר מדבקות קיר, תמונות ומסגרות, מדפים, תאורה, שטיחים, טקסטיל ואקססוריז, עם קישורים ישירים לרכישה מאתרי קניות אונליין במחירים נגישים. את הפריטים תוכלו לרכוש בנפרד, בהתאם לתקציב שלכם.',
  },
  {
    icon: Lamp,
    title: 'הדמיות להמחשת העיצוב',
    text: 'הדמיות הממחישות את הקונספט ואת שילובי הצבעים והפריטים, כדי שתוכלו לראות כיצד הכול מתחבר למראה שלם והרמוני.',
  },
  {
    icon: Pencil,
    title: 'טיפים וכלים ליישום',
    text: 'טיפים מקצועיים למיקום פריטים, מידות וגבהי תלייה, רעיונות ליצירת פינות מעוצבות ולהתאמת הקונספט לחדר שלכם. לצידם, כלים באזור האישי לשמירת רעיונות, תיעוד מידות ומעקב אחר משימות.',
  },
]

function StartLink({ children }: { children: string }) {
  return (
    <Link
      to="/questionnaire"
      className="inline-flex items-center justify-center rounded-lg bg-[#C4B09A] px-8 py-3 text-[15px] text-white shadow-sm transition-colors hover:bg-[#B39A86]"
    >
      {children}
    </Link>
  )
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#FBF8F4] text-[#4A4540]">
      <Header />

      <main>
        <section className="mx-auto max-w-3xl px-4 pt-10 pb-6 text-center sm:px-6 sm:pt-14">
          <h1 className="text-[2rem] leading-tight font-normal text-[#3C3834] sm:text-[2.6rem]">
            חדר ילדים מעוצב
            <br />
            וחלומי בקלות
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[#6B645C] sm:text-base">
            כל מה שצריך כדי להפוך את חדר הילדים למקום נעים, מעוצב ומלא קסם, עם חבילת עיצוב מקצועית
            שחוסכת לכם שעות של חיפושים והתלבטויות, במחיר נגיש
          </p>
          <div className="mt-6">
            <StartLink>אני רוצה חדר מעוצב עכשיו!</StartLink>
          </div>
          <img
            src={heroPhoto}
            alt="חדר ילדים מעוצב עם ג'ירפה, נורות דגלים ופינת משחק"
            className="mt-8 w-full rounded-2xl object-cover shadow-[0_8px_30px_rgba(120,100,80,0.08)]"
          />
        </section>

        <section className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6 sm:py-16">
          <BrushTitle className="mb-6 flex-wrap text-2xl sm:text-[1.7rem]">
            ברוכים הבאים ל־Petite Dreams
          </BrushTitle>
          <p className="text-[15px] leading-7 text-[#5A544E]">
            בואו נהפוך את חדר הילדים למקום מלא צבע, חמימות ואופי. חדר נעים ומעוצב, שכיף לשחק, לחלום
            ולגדול בו.
          </p>
          <p className="mt-4 text-[15px] leading-7 text-[#5A544E]">
            ב־Petite Dreams יצרנו חבילות עיצוב מקצועיות שבהן הצבעים, הפריטים והשילובים כבר נבחרו
            בקפידה. אתם בוחרים את הסגנון שאתם אוהבים, ומקבלים את כל מה שצריך כדי להעניק לחדר מראה
            חדש ומלא קסם.
          </p>
          <div className="mt-7">
            <StartLink>בואו נתחיל!</StartLink>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 pb-14 sm:px-6 sm:pb-16">
          <BrushTitle className="mb-10 text-2xl sm:text-[1.7rem]">איך זה עובד?</BrushTitle>
          <ol className="space-y-7">
            {steps.map((step) => (
              <li key={step.n} className="flex items-start gap-4">
                <span className="w-11 shrink-0 pt-0.5 text-[1.7rem] leading-none font-light text-[#C4B09A]">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-[16px] font-medium text-[#3C3834]">{step.title}</h3>
                  <p className="mt-1 text-[14px] leading-7 text-[#6B645C]">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex items-start justify-center gap-3 text-center">
            <Heart className="mt-1 h-5 w-5 shrink-0 text-[#C4B09A]" strokeWidth={1.4} />
            <p className="max-w-sm text-[14px] leading-7 text-[#5A544E]">
              מעצבים גם את החדר של האח או האחות?
              <br />
              תקבלו 20% הנחה על החבילה הנוספת.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 sm:pb-16">
          <BrushTitle className="mb-8 text-2xl sm:text-[1.7rem]">למה Petite Dreams?</BrushTitle>
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {reasons.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-[#E8E0D8] bg-white px-5 py-6 text-center shadow-[0_2px_10px_rgba(120,100,80,0.04)]"
              >
                <Icon className="mx-auto mb-3 h-7 w-7 text-[#C4B09A]" strokeWidth={1.4} />
                <h3 className="mb-2 text-[16px] font-medium text-[#3C3834]">{title}</h3>
                <p className="text-[13.5px] leading-7 text-[#6B645C]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-14 sm:px-6 sm:pb-16">
          <BrushTitle className="mb-8 flex-wrap text-2xl sm:text-[1.7rem]">מה כלול בחבילה שלכם?</BrushTitle>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {included.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-[#E8E0D8] bg-white px-5 py-6 shadow-[0_2px_10px_rgba(120,100,80,0.04)]"
              >
                <div className="mb-2 flex items-center gap-2.5">
                  <Icon className="h-6 w-6 shrink-0 text-[#C4B09A]" strokeWidth={1.4} />
                  <h3 className="text-[15px] font-medium text-[#3C3834]">{title}</h3>
                </div>
                <p className="text-[13.5px] leading-7 text-[#6B645C]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 pb-14 sm:px-6">
          <div className="rounded-2xl border border-[#E8E0D8] bg-white px-5 py-6 sm:px-7">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E4D5C6] text-[#C4B09A]">
                <Check className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <h2 className="text-[17px] font-medium text-[#3C3834]">לא צריך להחליף את הרהיטים!</h2>
            </div>
            <p className="text-[14px] leading-7 text-[#6B645C]">
              החבילה מתמקדת בסטיילינג ובהלבשת הקירות, הרצפה והתקרה, כך שתוכלו לשדרג את החדר גם עם
              הרהיטים הקיימים שלכם.
            </p>
            <p className="mt-4 text-[15px] font-medium text-[#3C3834]">ובכל זאת רוצים להתחדש ברהיטים?</p>
            <p className="mt-1 text-[14px] leading-7 text-[#6B645C]">
              באזור האישי תמצאו גם טיפים מקצועיים ממעצבת פנים לבחירת מיטות, ארונות ורהיטים גדולים, תוך
              שמירה על השפה העיצובית של החדר.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 pt-2 pb-16 text-center sm:pb-20">
          <h2 className="text-[1.7rem] font-light text-[#3C3834] sm:text-[2rem]">אז איך ייראה החדר שלכם?</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-[#6B645C]">
            בחרו את הסגנון שאתם אוהבים וגלו את חבילת העיצוב שמחכה לכם.
          </p>
          <div className="mt-6">
            <StartLink>בואו נמצא את העיצוב שלכם!</StartLink>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
