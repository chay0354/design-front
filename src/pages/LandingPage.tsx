import type { ReactNode } from 'react'
import { ArrowDown, Check, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrushMark, Sparkle } from '../components/BrushTitle'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

const heroPhoto = '/assets/hero-background.jpg'
const ink = '#4A403A'

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

const reasons = [
  {
    title: 'עיצוב מקצועי במחיר נגיש',
    text: 'חבילות שנוצרו מתוך ידע וניסיון מקצועי, עם תשומת לב לצבעים, לפרופורציות ולפרטים הקטנים, בעלות נגישה בהשוואה לליווי עיצוב אישי.',
  },
  {
    title: 'הבחירות הקטנות כבר נעשו עבורכם',
    text: 'איזה גוון מתאים למדבקות הקיר? אילו תמונות ישתלבו עם השטיח? ואיך הכול ייראה יחד? במקום לחפש ולהתלבט, תקבלו קונספט שבו כל הבחירות נעשו מתוך מחשבה על החדר כולו.',
  },
  {
    title: 'עיצוב שמתאים גם לקצב שלכם',
    text: 'אפשר לרכוש את הפריטים וליישם את העיצוב בהדרגה, בהתאם לזמן ולתקציב שלכם.',
  },
]

function BagHeartIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11 shrink-0" fill="none" stroke={ink} strokeWidth="1.6" strokeLinejoin="round">
      <path d="M10 17h28l-2.2 25H12.2z" />
      <path d="M18 17v-3.5a6 6 0 0 1 12 0V17" strokeLinecap="round" />
      <path
        d="M24 36c-4.6-3-7-5.4-7-8.2 0-2 1.5-3.4 3.3-3.4 1.6 0 2.8.9 3.7 2.2.9-1.3 2.1-2.2 3.7-2.2 1.8 0 3.3 1.4 3.3 3.4 0 2.8-2.4 5.2-7 8.2z"
        fill="#D9C7B5"
        stroke="none"
      />
    </svg>
  )
}

function SwatchesIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11 shrink-0" fill="none" stroke={ink} strokeWidth="1.5" strokeLinejoin="round">
      <rect x="9" y="12" width="9" height="26" rx="2" transform="rotate(-38 13.5 38)" fill="#C9B6A1" />
      <rect x="15" y="10" width="9" height="28" rx="2" transform="rotate(-18 19.5 38)" fill="#E6DACB" />
      <rect x="21" y="9" width="9" height="29" rx="2" fill="#B39A84" />
      <circle cx="25.5" cy="34" r="1.6" fill="#fff" />
    </svg>
  )
}

function LaptopIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11 shrink-0" fill="none" stroke={ink} strokeWidth="1.6" strokeLinejoin="round">
      <rect x="9" y="11" width="30" height="20" rx="1.8" />
      <path d="M5 35h38l-2.5 3.5h-33z" />
      <path d="M19 26v-5.5l5-4 5 4V26z" fill="#E6DACB" />
      <path d="M23 26v-3h2v3" />
      <path d="M37 9l4-4M38.5 12.5l2 2" strokeLinecap="round" />
    </svg>
  )
}

function CalendarStarIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11 shrink-0" fill="none" stroke={ink} strokeWidth="1.6" strokeLinejoin="round">
      <rect x="8" y="11" width="32" height="29" rx="3" />
      <path d="M8 19h32" />
      <path d="M16 8v6M32 8v6" strokeLinecap="round" />
      <path
        d="M24 23.5l1.9 3.9 4.3.6-3.1 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3.1-3 4.3-.6z"
        fill="#D9C7B5"
      />
    </svg>
  )
}

function BedIllustration() {
  return (
    <svg viewBox="0 0 132 72" className="h-auto w-24 shrink-0 sm:w-32" fill="none" stroke={ink} strokeWidth="1.5" strokeLinejoin="round">
      <path d="M14 22V10M10 10h8l-1.5-5h-5z" />
      <circle cx="14" cy="24" r="2" fill="#E6DACB" />
      <rect x="24" y="14" width="96" height="22" rx="4" fill="#F7F3EE" />
      <rect x="34" y="22" width="26" height="12" rx="5" fill="#fff" />
      <rect x="66" y="22" width="26" height="12" rx="5" fill="#fff" />
      <rect x="20" y="34" width="104" height="18" rx="3" fill="#fff" />
      <path d="M20 44h104" />
      <path d="M26 52v6M118 52v6" strokeLinecap="round" />
    </svg>
  )
}

const included: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: <BagHeartIcon />,
    title: 'פריטים שנבחרו עבורכם',
    text: 'מבחר מדבקות קיר, תמונות ומסגרות, מדפים, תאורה, שטיחים, טקסטיל ואקססוריז, עם קישורים ישירים לרכישה מאתרי קניות אונליין במחירים נגישים. את הפריטים תוכלו לרכוש בנפרד, בהתאם לתקציב שלכם.',
  },
  {
    icon: <SwatchesIcon />,
    title: 'קונספט עיצובי ופלטת גוונים',
    text: 'קונספט מגובש בהתאם לנושא ולהעדפות שבחרתם, עם שילוב מוקפד של צבעים, חומרים ופריטים דקורטיביים. בחבילות הכוללות צביעת קירות תקבלו גם מספר גוון מומלץ וקישור לרכישת הצבע.',
  },
  {
    icon: <LaptopIcon />,
    title: 'הדמיות להמחשת העיצוב',
    text: 'הדמיות הממחישות את הקונספט ואת שילובי הצבעים והפריטים, כדי שתוכלו לראות כיצד הכול מתחבר למראה שלם והרמוני.',
  },
  {
    icon: <CalendarStarIcon />,
    title: 'טיפים וכלים ליישום',
    text: 'טיפים מקצועיים למיקום פריטים, מידות וגבהי תלייה, רעיונות ליצירת פינות מעוצבות ולהתאמת הקונספט לחדר שלכם. לצידם, כלים באזור האישי לשמירת רעיונות, תיעוד מידות ומעקב אחר משימות.',
  },
]

function StartLink({ children }: { children: string }) {
  return (
    <Link
      to="/questionnaire"
      className="inline-flex items-center justify-center rounded-lg bg-[#7E7355] px-7 py-2.5 text-[15px] font-medium text-white shadow-[0_2px_6px_rgba(60,50,30,0.18)] transition-colors hover:bg-[#6C6248] sm:px-9 sm:py-3 sm:text-base"
    >
      {children}
    </Link>
  )
}

function SectionTitle({ children, brush = false }: { children: string; brush?: boolean }) {
  return (
    <h2 className="flex items-center justify-center gap-4 text-center text-[1.3rem] leading-tight font-semibold whitespace-nowrap text-[#2F2A26] sm:gap-8 sm:text-[1.9rem]">
      <Sparkle className="h-3 w-3 text-[#A67C52]" />
      {brush ? <BrushMark className="px-6">{children}</BrushMark> : <span>{children}</span>}
      <Sparkle className="h-3 w-3 text-[#A67C52]" />
    </h2>
  )
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#FAF8F6] text-[#3C3631]">
      <Header />

      <main>
        <section className="relative isolate overflow-hidden">
          <img
            src={heroPhoto}
            alt="חדר ילדים מעוצב עם ג'ירפה, נורות דגלים ופינת משחק"
            className="absolute inset-0 -z-10 h-full w-full object-cover object-bottom"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#F6F3F0]/85 via-[#F6F3F0]/55 to-transparent" />
          <div className="mx-auto max-w-2xl px-4 pt-6 pb-[150px] text-center sm:pt-14 sm:pb-[300px]">
            <h1 className="text-[2.1rem] leading-[1.15] font-bold text-[#4A403A] sm:text-[3.2rem]">
              חדר ילדים מעוצב
              <br />
              וחלומי בקלות
            </h1>
            <div className="relative mx-auto mt-3 max-w-md px-6 py-2 sm:mt-5 sm:max-w-lg">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[-6%] inset-y-[-18%] -z-10 bg-[#C9C4BC]"
                style={{
                  maskImage: 'url(/assets/title-brush.png)',
                  WebkitMaskImage: 'url(/assets/title-brush.png)',
                  maskSize: '100% 100%',
                  WebkitMaskSize: '100% 100%',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                }}
              />
              <p className="text-[13.5px] leading-5 font-medium text-[#3C3631] sm:text-base sm:leading-6">
                כל מה שצריך כדי להפוך את חדר הילדים למקום נעים, מעוצב ומלא קסם, עם חבילת עיצוב מקצועית
                שחוסכת לכם שעות של חיפושים והתלבטויות, במחיר נגיש.
              </p>
            </div>
            <div className="mt-2 sm:mt-3">
              <StartLink>אני רוצה חדר מעוצב עכשיו!</StartLink>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-xl px-4 pt-8 pb-8 text-center sm:pt-14 sm:pb-12">
          <SectionTitle>ברוכים הבאים ל־Petite Dreams</SectionTitle>
          <p className="mt-3 text-[13.5px] leading-6 font-medium text-[#3C3631] sm:text-[15px] sm:leading-7">
            בואו נהפוך את חדר הילדים למקום מלא צבע, חמימות ואופי. חדר נעים ומעוצב, שכיף לשחק, לחלום
            ולגדול בו.
          </p>
          <p className="mt-2 text-[13.5px] leading-6 font-medium text-[#3C3631] sm:text-[15px] sm:leading-7">
            ב־Petite Dreams יצרנו חבילות עיצוב מקצועיות שבהן הצבעים, הפריטים והשילובים כבר נבחרו
            בקפידה. אתם בוחרים את הסגנון שאתם אוהבים, ומקבלים את כל מה שצריך כדי להעניק לחדר מראה
            חדש ומלא קסם.
          </p>
          <div className="mt-4">
            <StartLink>בואו נתחיל!</StartLink>
          </div>
        </section>

        <section className="mx-auto max-w-xl px-4 pb-8 sm:pb-12">
          <SectionTitle brush>איך זה עובד?</SectionTitle>
          <ol className="mx-auto mt-5 max-w-md">
            {steps.map((step, index) => (
              <li key={step.n} className="flex items-stretch gap-4">
                <div className="flex w-12 shrink-0 flex-col items-center pt-2 sm:w-14">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEE8E2] text-[15px] font-bold text-[#4A403A] sm:h-14 sm:w-14 sm:text-base">
                    {step.n}
                  </span>
                  {index < steps.length - 1 && (
                    <ArrowDown className="mt-1.5 h-3.5 w-3.5 text-[#6B6158]" strokeWidth={1.6} />
                  )}
                </div>
                <div
                  className={`flex-1 py-2.5 text-right ${index < steps.length - 1 ? 'border-b border-[#E6DFD8]' : ''}`}
                >
                  <h3 className="text-[16px] leading-6 font-bold text-[#2F2A26] sm:text-[17px]">{step.title}</h3>
                  <p className="text-[13px] leading-5 font-medium text-[#3C3631] sm:text-[14px] sm:leading-6">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mx-auto mt-5 flex max-w-md items-center gap-2.5 rounded-full bg-[#EFEAE5] px-4 py-3 sm:gap-4 sm:px-6">
            <p className="min-w-0 flex-1 text-[11.5px] leading-5 text-[#2F2A26] sm:text-[15px] sm:leading-6">
              <span className="block whitespace-nowrap font-bold">מעצבים גם את החדר של האח או האחות?</span>
              <span className="block whitespace-nowrap font-medium">תקבלו 20% הנחה על החבילה הנוספת.</span>
            </p>
            <Heart className="h-6 w-6 shrink-0 text-[#4A403A] sm:h-8 sm:w-8" strokeWidth={1.2} />
          </div>
        </section>

        <section className="mx-auto max-w-xl px-4 pb-8 sm:pb-12">
          <SectionTitle brush>למה Petite Dreams?</SectionTitle>
          <div className="mx-auto mt-3 max-w-lg divide-y divide-[#E6DFD8] text-center">
            {reasons.map((reason) => (
              <div key={reason.title} className="py-3">
                <h3 className="text-[16px] leading-6 font-bold text-[#2F2A26] sm:text-[17px]">{reason.title}</h3>
                <p className="mt-0.5 text-[13px] leading-6 font-medium text-[#3C3631] sm:text-[14px]">{reason.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-3 pb-6 sm:px-6 sm:pb-10">
          <SectionTitle brush>מה כלול בחבילה שלכם?</SectionTitle>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-5">
            {included.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-[#ECE5DE] bg-white/70 px-2.5 py-3 text-center shadow-[0_1px_6px_rgba(120,100,80,0.05)] sm:px-5 sm:py-5"
              >
                <div className="mb-2 flex items-center justify-center gap-2">
                  <h3 className="max-w-[7.5rem] text-[14px] leading-5 font-bold text-[#2F2A26] sm:max-w-none sm:text-[16px]">
                    {item.title}
                  </h3>
                  {item.icon}
                </div>
                <p className="text-[11.5px] leading-[1.15rem] font-medium text-[#3C3631] sm:text-[13.5px] sm:leading-6">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-3 pb-6 sm:px-6 sm:pb-10">
          <div className="flex items-center gap-3 rounded-2xl bg-[#EFEBE7] px-4 py-3.5 sm:gap-6 sm:px-8 sm:py-5">
            <div className="flex-1 text-center">
              <h2 className="flex items-center justify-center gap-1.5 text-[14.5px] font-bold whitespace-nowrap text-[#2F2A26] sm:text-[18px]">
                לא צריך להחליף את הרהיטים!
                <Check className="h-4 w-4 text-[#4A403A]" strokeWidth={2.2} />
              </h2>
              <p className="mt-1 text-[12.5px] leading-5 font-medium text-[#3C3631] sm:text-[14px] sm:leading-6">
                החבילה מתמקדת בסטיילינג ובהלבשת הקירות, הרצפה והתקרה, כך שתוכלו לשדרג את החדר גם עם
                הרהיטים הקיימים שלכם.
              </p>
            </div>
            <BedIllustration />
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-[16px] font-bold text-[#2F2A26] sm:text-[18px]">ובכל זאת רוצים להתחדש ברהיטים?</h3>
            <p className="mx-auto mt-0.5 max-w-xl text-[12.5px] leading-5 font-medium text-[#3C3631] sm:text-[14px] sm:leading-6">
              באזור האישי תמצאו גם טיפים מקצועיים ממעצבת פנים לבחירת מיטות, ארונות ורהיטים גדולים, תוך
              שמירה על השפה העיצובית של החדר.
            </p>
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-5xl px-4 pt-4 pb-5 text-center sm:pt-8">
          <h2 className="text-[1.75rem] leading-tight font-bold text-[#2F2A26] sm:text-[2.3rem]">אז איך ייראה החדר שלכם?</h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-6 font-medium text-[#3C3631] sm:text-[15px]">
            בחרו את הסגנון שאתם אוהבים וגלו את חבילת העיצוב שמחכה לכם.
          </p>
          <div className="mt-4">
            <StartLink>בואו נמצא את העיצוב שלכם!</StartLink>
          </div>
          <img
            src="/assets/logo-full.png"
            alt="Petite dreams, Great design for little ones"
            className="relative z-10 mx-auto mt-6 h-12 w-auto sm:h-16"
          />
          <img
            src="/assets/home-toys-left.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 left-1 w-[24%] max-w-[220px]"
          />
          <img
            src="/assets/home-toys-right.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-1 bottom-4 w-[21%] max-w-[190px]"
          />
        </section>
      </main>

      <Footer />
    </div>
  )
}
