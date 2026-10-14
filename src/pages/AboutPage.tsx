import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Info, Leaf, Lock, Palette } from 'lucide-react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

const ink = '#4A433C'
const muted = '#8A8178'
const line = '#C4B5A6'

function LineIcon({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center" style={{ color: line }}>
      {children}
    </div>
  )
}

function RugIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="10" y="12" width="28" height="24" rx="1.5" />
      <rect x="15" y="17" width="18" height="14" />
    </svg>
  )
}

function PillowIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="11" y="14" width="26" height="20" rx="5" />
      <path d="M24 14v20" />
    </svg>
  )
}

function FrameIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="10" y="12" width="28" height="24" rx="2" />
      <path d="M14 30l7-7 5 5 3-3 5 5" />
    </svg>
  )
}

function LampIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M16 20h16l-2 8H18z" />
      <path d="M24 28v6M18 34h12" />
    </svg>
  )
}

function BoxesIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M14 16h16v6H14zM12 24h18v6H12zM16 32h16v6H16z" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M24 8l2.2 11.2L37 22l-10.8 2.8L24 36l-2.2-11.2L11 22l10.8-2.8z" />
    </svg>
  )
}

function HouseHeartIcon() {
  return (
    <svg viewBox="0 0 88 88" className="h-20 w-20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M16 40 L44 18 L72 40 V70 H16 Z" />
      <path d="M44 58c-6-8-16-4-16 4 0 8 16 14 16 14s16-6 16-14c0-8-10-12-16-4z" />
    </svg>
  )
}

const values = [
  {
    title: 'חכם ומשתלב',
    text: 'מראה שלם, מתוכנן, בלי צורך בהחלפת ריהוט יקר.',
    icon: <Leaf className="h-8 w-8" strokeWidth={1.3} />,
  },
  {
    title: 'נגיש ומתאים להתפתחות',
    text: 'עיצוב שגדל עם הילד וניתן לעדכון בקלות, בלי להתחיל מהתחלה.',
    icon: <SparkIcon />,
  },
  {
    title: 'אוצרות מדויקת',
    text: 'בחירת צבעים, חומרים ופריטים שעובדים יחד בהרמוניה.',
    icon: <Palette className="h-8 w-8" strokeWidth={1.3} />,
  },
  {
    title: 'נגיש ונוח',
    text: 'עיצוב מקצועי, מותאם למשפחות ולקצב החיים שלכם.',
    icon: <Heart className="h-8 w-8" strokeWidth={1.3} />,
  },
]

const details = [
  { title: 'אביזרים', icon: <BoxesIcon /> },
  { title: 'טקסטיל', icon: <PillowIcon /> },
  { title: 'אמנות קיר', icon: <FrameIcon /> },
  { title: 'תאורה', icon: <LampIcon /> },
  { title: 'שטיחים', icon: <RugIcon /> },
]

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FBFAF8]" style={{ color: ink }}>
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-[1.65rem] font-light leading-tight sm:text-5xl sm:tracking-wide">אודות PETITE DREAMS</h1>
          <div className="mt-4 flex items-center justify-center gap-4" style={{ color: line }}>
            <span className="h-px w-16 bg-current" />
            <Heart className="h-4 w-4" strokeWidth={1.4} />
            <span className="h-px w-16 bg-current" />
          </div>
          <p className="mt-4 text-sm sm:text-base" style={{ color: muted }}>
            עיצוב מקצועי לחדרי ילדים, בדרך פשוטה ונגישה יותר
          </p>
        </header>

        <section className="rounded-[28px] bg-[#F6F1EC] p-4 sm:p-6 lg:p-8">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-10">
            <div className="space-y-4 px-2 py-2 text-sm leading-7 sm:text-[15px]" style={{ color: '#5C564F' }}>
              <p>
                <strong className="font-medium" style={{ color: ink }}>
                  PETITE DREAMS
                </strong>{' '}
                הוא סטודיו לעיצוב חדרי ילדים, שנולד מתוך אהבה לעיצוב ומתוך רצון להפוך חדרים
                יפים, מעוצבים ומעוררי השראה לנגישים הרבה יותר.
              </p>
              <p>
                הסטודיו הוקם ומובל על ידי מעצבת פנים בעלת למעלה מ-15 שנות ניסיון בתכנון ועיצוב
                מגורי יוקרה, עם רקע אקדמי מתקדם בלימודי עיצוב באיטליה, ולצידה צוות של מעצבים
                ואוצרים שעוזרים בבחירת פריטים, מדייקים ומתאימים בין צבעים, הדמיות, פרטים
                ורעיונות.
              </p>
              <p>
                לאורך השנים ראינו שוב ושוב כמה הורים רוצים ליצור לילדים שלהם חדר מיוחד. מקום
                שנעים לישון בו, לשחק בו, לגדול בו ולחלום בו.
              </p>
              <p>
                <strong className="font-medium" style={{ color: ink }}>
                  אבל בדרך לשם, קל מאוד ללכת לאיבוד.
                </strong>{' '}
                יש אינסוף השראות, מגמות, פריטים וסגנונות. כל דבר יכול להיראות יפה בפני עצמו, אבל
                לדעת מה לבחור ואיך לגרום להכול לעבוד יחד זו כבר משימה אחרת.
              </p>
              <p>
                מצד אחד, לא כל משפחה זקוקה או רוצה להיכנס לתהליך מלא של ליווי אישי עם מעצבת
                פנים. מצד שני, לעצב הכול לבד יכול להפוך מהר מאוד לעשרות החלטות, שעות של חיפושים
                והרבה ספקות.
              </p>
              <p>
                <strong className="font-medium" style={{ color: ink }}>
                  וכאן נולד PETITE DREAMS.
                </strong>{' '}
                רצינו ליצור דרך ביניים חכמה ונגישה יותר. לקחת את החשיבה, הניסיון והעין המקצועית
                של עולם עיצוב הפנים, ולתרגם אותם לחבילות עיצוב שכבר עברו תכנון ואוצרות מקצועית,
                כך שלא צריך להתחיל בכל פעם מחדש.
              </p>
              <p>
                <strong className="font-medium" style={{ color: ink }}>
                  אנחנו מאמינים שהקסם הגדול של חדר נמצא דווקא בהלבשה שלו.
                </strong>{' '}
                מיטה, ארון ושאר הרהיטים הגדולים תופסים מקום משמעותי בחדר, אבל לא תמיד נכון
                להחליף אותם. לכן החבילות שלנו בנויות מתוך מחשבה שהבסיס כבר קיים. באמצעות צבעים,
                טקסטיל, תמונות, תאורה, שטיחים ואביזרים אפשר לשנות לחלוטין את התחושה בחדר, לחבר גם
                רהיטים קיימים לשפה חדשה וליצור מראה שלם ומעוצב בלי להתחיל הכול מחדש.
              </p>
              <p>
                זו גם הסיבה שהעיצוב שלנו נשאר גמיש. ילדים גדלים, תחומי העניין מתחלפים והטעם
                משתנה, והלבשת החדר יכולה להשתנות יחד איתם בלי להפוך כל שינוי לפרויקט גדול ויקר.
              </p>
              <p>
                מאחורי כל חבילה עומד תהליך אוצרות קפדני. אנחנו מסננים את הרעש, בוחרים את הגוונים
                והפריטים הנכונים, ודואגים שכל פריט ירגיש חלק מאותו סיפור.
              </p>
              <p>
                כי עיצוב טוב לא נמדד בכמה עולה כל פריט, אלא בתחושה שנוצרת כשהכול מתחבר נכון.
              </p>
              <p>
                כך נולד PETITE DREAMS: כדי להפוך את הדרך לחדר מעוצב, נעים ומלא אופי לפשוטה,
                בטוחה ונגישה יותר.
              </p>
              <p>
                <strong className="font-medium" style={{ color: ink }}>
                  ברוכים הבאים ל-PETITE DREAMS.
                </strong>
                <br />
                בואו נתחיל לעצב את החלום הקטן שלכם.
              </p>
            </div>
            <img
              src="/assets/about-room.jpg"
              alt="חדר ילדים מעוצב בגוונים חמים"
              className="h-[520px] w-full rounded-[22px] object-cover"
            />
          </div>
        </section>

        <section className="mt-14 text-center">
          <h2 className="flex items-center justify-center gap-4 text-2xl font-medium">
            <span className="h-px w-10 bg-[#E4D9CE] sm:w-16" />
            הדרך שלנו
            <span className="h-px w-10 bg-[#E4D9CE] sm:w-16" />
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7" style={{ color: muted }}>
            חבילת עיצוב מוכנה ליישום עצמי, שנבנית מתוך חשיבה מקצועית וגישה שמתחשבת במשפחות
            ובחיים היומיומיים.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl bg-white px-5 py-7 shadow-[0_8px_24px_rgba(90,70,50,0.04)]"
              >
                <LineIcon>{item.icon}</LineIcon>
                <h3 className="mb-2 text-base font-medium">{item.title}</h3>
                <p className="text-sm leading-6" style={{ color: muted }}>
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#EFE6DE] bg-[#FBF8F5] px-4 py-8 text-center sm:px-8">
          <h2 className="text-2xl font-medium">הקסם שבפרטים הקטנים</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7" style={{ color: muted }}>
            אנחנו עובדים עם הצבעים, הטקסטיל, התאורה והאביזרים שמלבישים את החדר ומשנים את כל
            התחושה — בלי להחליף את הרהיטים הגדולים.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-5">
            {details.map((item, index) => (
              <div
                key={item.title}
                className={index < details.length - 1 ? 'sm:border-e sm:border-[#E8DFD6]' : ''}
                style={{ color: muted }}
              >
                <LineIcon>{item.icon}</LineIcon>
                <p className="text-sm">{item.title}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid items-center gap-8 rounded-[28px] bg-[#B8A899] px-6 py-8 text-[#F7F3EE] md:grid-cols-[auto_1fr_1.15fr] md:px-10">
          <HouseHeartIcon />
          <div className="text-sm leading-7 md:border-e md:border-white/40 md:pe-8">
            <p>
              השירות אינו כולל ליווי אישי, התקנה או הרכבה, וטיפול ברכישות, משלוחים, החלפות או
              איכות המוצרים מתבצע ישירות מול הספקים.
            </p>
            <p className="mt-3 font-medium">
              אנחנו דואגים לצד העיצובי.
              <br />
              אתם מיישמים אותו בדרך שמתאימה לכם.
            </p>
          </div>
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-medium">
              <Info className="h-5 w-5" />
              כדאי לדעת
            </h2>
            <p className="text-sm leading-7">
              PETITE DREAMS מציעה חבילות עיצוב דיגיטליות ליישום עצמאי. אנחנו נותנים לכם את
              הקונספט, הבחירות, הקישורים והכלים שיעזרו לכם ליצור את החדר בעצמכם.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col-reverse items-center justify-center gap-5 sm:flex-row sm:gap-8">
            <Link
              to="/questionnaire"
              className="rounded-lg bg-[#AB9683] px-5 py-2.5 text-sm text-white hover:bg-[#9A8674]"
            >
              לכל החבילות
            </Link>
            <div className="text-center sm:text-right">
              <h2 className="text-lg font-medium">מוכנים להתחיל?</h2>
              <p className="text-sm" style={{ color: muted }}>
                צאו לדרך עם חבילת עיצוב שמתאימה בדיוק למשפחה שלכם.
              </p>
            </div>
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-xs" style={{ color: muted }}>
            <Lock className="h-3.5 w-3.5" />
            החבילה נשמרת אוטומטית באזור האישי שלכם
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
