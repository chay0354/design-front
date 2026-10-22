import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Home, Leaf, Minus, Plus, ShoppingBag, Sparkles, User } from 'lucide-react'
import { BrushMark } from '../components/BrushTitle'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

type FaqSectionId = 'package' | 'purchase' | 'service'

type FaqSection = {
  id: FaqSectionId
  tab: string
  title: string
  icon: typeof Home
  items: { q: string; a: string[] }[]
}

const SECTIONS: FaqSection[] = [
  {
    id: 'package',
    tab: 'על החבילה',
    title: 'על החבילה',
    icon: Home,
    items: [
      {
        q: 'מה בעצם מקבלים בחבילת העיצוב?',
        a: [
          'חבילת PETITE DREAMS היא חבילת עיצוב דיגיטלית ליישום עצמאי, שבה כבר עשינו עבורכם את עבודת החיפוש, הבחירה, ההתאמה והאוצרות.',
          'החבילה כוללת קונספט עיצובי שלם, פלטת גוונים, בחירת פריטי הלבשה וסטיילינג, קישורים לרכישה, טיפים ליישום והדמיה קונספטואלית שממחישה כיצד כל האלמנטים מתחברים יחד לחדר הרמוני ומעוצב.',
        ],
      },
      {
        q: 'החדר שלי שונה מהחדר שמופיע בהדמיה. זה עדיין מתאים?',
        a: [
          'בהחלט. ההדמיה בחבילה היא הדמיה קונספטואלית שנועדה להמחיש את השפה העיצובית, הצבעים, החומרים, הפריטים והאווירה הכללית, ולא לשמש כתכנית העמדה מדויקת של החדר שלכם.',
          'מידות, פרופורציות, חלונות, פתחים ומיקום הרהיטים יכולים להיות שונים. אין צורך למקם כל פריט בדיוק כפי שהוא מופיע בהדמיה. הרעיון הוא לקחת את השפה העיצובית והחיבור בין האלמנטים ולהתאים אותם למבנה ולגודל של החדר שלכם.',
        ],
      },
      {
        q: 'האם צריך להחליף את הרהיטים שכבר יש בחדר?',
        a: [
          'ממש לא. PETITE DREAMS נולדה מתוך ההבנה שלרוב המשפחות כבר יש מיטה, ארון ורהיטים גדולים נוספים, ואין צורך להחליף אותם בכל פעם שרוצים ליצור שינוי.',
          'הקסם קורה דווקא דרך הלבשת החדר: צבע, טקסטיל, אמנות, תאורה, מדפים ואביזרים משלימים. באמצעות הבחירות הנכונות אפשר לשנות לחלוטין את התחושה בחדר ולחבר גם רהיטים קיימים לשפה עיצובית חדשה.',
        ],
      },
      {
        q: 'האם הפריטים שמופיעים בחבילה כלולים במחיר?',
        a: [
          'לא. מחיר החבילה הוא עבור חבילת העיצוב הדיגיטלית.',
          'המוצרים עצמם נרכשים בנפרד על ידכם באמצעות הקישורים המצורפים, בהתאם לפריטים שתרצו לשלב ולתקציב שלכם.',
        ],
      },
      {
        q: 'חייבים להשתמש בכל הפריטים שבחבילה?',
        a: [
          'ממש לא. החבילה מציגה קונספט שלם והרמוני, אבל אתם מחליטים כמה ממנו תרצו ליישם.',
          'אפשר לבחור רק את הפריטים שאהבתם, לשלב דברים שכבר יש לכם בבית או לבחור חלופה דומה ששומרת על הגוונים, החומרים והשפה העיצובית של הקונספט.',
          'החבילה היא מפת דרך לעיצוב החדר, לא רשימת קניות שחייבים לבצע במלואה.',
        ],
      },
      {
        q: 'האם אפשר להחליף חבילה לאחר הרכישה?',
        a: [
          'לאחר שהחבילה הדיגיטלית נמסרה והפכה זמינה באזור האישי, לא ניתן להחליפה בחבילה אחרת ללא רכישה נוספת.',
          'לכן מומלץ להקדיש רגע לפני הרכישה לבחירת הסגנון והכיוון שהכי מדברים אליכם.',
        ],
      },
      {
        q: 'האם החבילה כוללת בחירת צבע לקירות?',
        a: [
          'כאשר צבע קיר הוא חלק מהקונספט, תקבלו התייחסות לגוון המתאים כחלק מפלטת הצבעים.',
          'חשוב לזכור שצבע עשוי להיראות מעט שונה בהתאם לתאורה, לכיוון החלונות ולמסך שממנו צופים בו, ולכן מומלץ לבדוק דוגמת צבע בחדר לפני צביעה מלאה.',
        ],
      },
      {
        q: 'האם צריך לבדוק מידות לפני שמזמינים?',
        a: [
          'כן. ההדמיה היא קונספטואלית ואינה תכנית מדידה של החדר שלכם.',
          'לפני הזמנת פריטים, ובמיוחד שטיחים, מדפים, גופי תאורה, תמונות ופריטים בעלי ממדים משמעותיים, חשוב לבדוק את מידות המוצר באתר הספק ולוודא שהן מתאימות למקום שבו תרצו למקם אותו.',
        ],
      },
    ],
  },
  {
    id: 'purchase',
    tab: 'רכישה ומוצרים',
    title: 'רכישה, מוצרים ומשלוחים',
    icon: ShoppingBag,
    items: [
      {
        q: 'תוך כמה זמן מקבלים את החבילה?',
        a: [
          'מיד לאחר השלמת הרכישה.',
          'PETITE DREAMS היא חבילת עיצוב דיגיטלית, ולכן אין צורך להמתין למשלוח. לאחר השלמת ההזמנה תקבלו גישה לחבילה שרכשתם ולכל התוכן והקישורים הכלולים בה.',
        ],
      },
      {
        q: 'איפה החבילה שלי נשמרת?',
        a: [
          'החבילה נשמרת באזור "החשבון שלי", כך שתוכלו לחזור אליה בכל שלב בזמן שאתם מיישמים את העיצוב ורוכשים את הפריטים.',
        ],
      },
      {
        q: 'מאיפה רוכשים את הפריטים?',
        a: [
          'לצד הפריטים שבחרנו תמצאו קישורים שיאפשרו לכם להגיע למוצר או לעמוד הרכישה הרלוונטי ולבצע את ההזמנה באופן עצמאי.',
          'חלק מהקישורים עשויים לתמוך ב־PETITE DREAMS, ללא עלות נוספת עבורכם.',
          'מחירים, מבצעים, עלויות משלוח וזמינות עשויים להשתנות, והמחיר הקובע הוא תמיד המחיר המופיע באתר הספק בזמן הרכישה.',
        ],
      },
      {
        q: 'מה קורה אם מוצר שמופיע בחבילה כבר לא זמין?',
        a: [
          'עולם הקניות אונליין משתנה כל הזמן, ולכן מלאי ודגמים עשויים להשתנות גם לאחר יצירת החבילה.',
          'אם פריט מסוים כבר אינו זמין, תוכלו להשתמש בתמונה שלו כמדריך למציאת חלופה דומה. באתרים התומכים בכך ניתן גם להשתמש בחיפוש לפי תמונה כדי לאתר את אותו הפריט או אפשרויות דומות.',
        ],
      },
      {
        q: 'מי אחראי על המוצרים, המשלוחים, ההחלפות וההחזרות?',
        a: [
          'הרכישה מתבצעת ישירות מול החנות או הספק, ו־PETITE DREAMS אינה צד לעסקה שבין הלקוח לבין הספק.',
          'המוצרים אינם עוברים דרכנו ואינם נבדקים על ידינו פיזית. זמינות, מחיר, איכות המוצר בפועל, משלוחים, מיסים, ביטולים, החזרות, החלפות ואחריות מטופלים ישירות מול הספק ובהתאם למדיניות שלו.',
          'לפני הרכישה מומלץ לעבור על פרטי המוצר, המידות, החומרים, דירוגי הספק ותנאי הרכישה באתר שממנו אתם מזמינים.',
        ],
      },
    ],
  },
  {
    id: 'service',
    tab: 'השירות שלנו',
    title: 'השירות שלנו',
    icon: User,
    items: [
      {
        q: 'האם החבילה כוללת ליווי אישי או שינויים לאחר הרכישה?',
        a: [
          'חבילות PETITE DREAMS מיועדות ליישום עצמאי ואינן כוללות ייעוץ עיצובי אישי, התאמת מוצרים חלופיים, סבבי שינויים או ליווי במהלך הביצוע.',
          'בתוך החבילה תקבלו את הקונספט, ההדמיה, פלטת הגוונים, הבחירות והכלים שנועדו לעזור לכם ליישם את העיצוב בעצמכם.',
          'אנחנו דואגים לצד העיצובי. אתם מיישמים אותו בדרך שמתאימה לכם.',
        ],
      },
      {
        q: 'האם אתם מזמינים או מתקינים עבורי את הפריטים?',
        a: [
          'לא. השירות הוא דיגיטלי ומיועד ליישום עצמאי ואינו כולל ביצוע רכישות עבורכם, התקנה, הרכבה או הגעה לבית.',
          'אנחנו נותנים לכם את הקונספט, הבחירות, הקישורים והכלים. אתם לוקחים אותם מכאן ומיישמים בזמן ובדרך שמתאימים לכם.',
        ],
      },
      {
        q: 'ומה אם יש לי בעיה טכנית?',
        a: [
          'אם נתקלתם בבעיה טכנית באתר, בתהליך הרכישה, בכניסה לחשבון או בגישה לחבילה שרכשתם, כמובן שנשמח לסייע.',
          'שירות התמיכה מיועד לנושאים טכניים ואינו כולל ייעוץ עיצובי, בחירת חלופות למוצרים, התאמות לחדר או ליווי ביישום החבילה.',
        ],
      },
    ],
  },
]

const PROMISES = [
  { icon: ShoppingBag, text: 'בוחרים, מזמינים ועושים בקצב שלכם' },
  { icon: Heart, text: 'עיצוב מקצועי בדרך פשוטה ונגישה' },
  { icon: Leaf, text: 'שפה עיצובית שלמה שגדלה יחד עם הילדים' },
  { icon: Sparkles, text: 'סטיילינג וריהוט קל מתוך ההבנה שיש לכם רהיטים גדולים קיימים' },
]

export function FaqPage() {
  const [activeTab, setActiveTab] = useState<FaqSectionId>('package')
  const [openKey, setOpenKey] = useState<string | null>(null)

  const jumpTo = (id: FaqSectionId) => {
    setActiveTab(id)
    document.getElementById(`faq-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-[#F7F2EC]">
        <div className="mx-auto grid max-w-6xl items-stretch md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="px-5 py-10 text-center sm:px-10 md:py-14">
            <h1 className="mb-2 text-4xl font-normal text-[#2F2B28] sm:text-5xl">שאלות ותשובות</h1>
            <p className="mb-4 text-lg text-[#3C3834] sm:text-xl">כל מה שכדאי לדעת לפני שמתחילים</p>
            <p className="mx-auto mb-8 max-w-lg text-sm leading-7 text-[#3C3834]">
              ריכזנו כאן את כל מה שחשוב לדעת על חבילות העיצוב של PETITE DREAMS, איך הן עובדות, מה
              תקבלו ואיך תוכלו לקחת את הקונספט שבחרתם ולהפוך אותו לחדר משלכם.
            </p>
            <div className="mx-auto grid max-w-xl grid-cols-3 overflow-hidden rounded-md border border-[#E3D8CC] bg-white">
              {SECTIONS.map(({ id, tab, icon: Icon }, index) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => jumpTo(id)}
                    className={`inline-flex items-center justify-center gap-2 px-2 py-3 text-[13px] transition-colors sm:text-sm ${
                      active ? 'bg-[#C4AE9C] text-white' : 'text-[#3C3834] hover:bg-[#F7F2EC]'
                    } ${index > 0 ? 'border-s border-[#E3D8CC]' : ''}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.4} />
                    {tab}
                  </button>
                )
              })}
            </div>
          </div>
          <img
            src="/assets/faq-hero.jpg"
            alt=""
            className="hidden h-full w-full rounded-tr-[10rem] object-cover md:block"
          />
        </div>
      </section>

      <main className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6">
        {SECTIONS.map(({ id, title, icon: Icon, items }) => (
          <section key={id} id={`faq-${id}`} className="scroll-mt-20">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-normal text-[#2F2B28]">
              <Icon className="h-6 w-6 text-[#B39A86]" strokeWidth={1.3} />
              <BrushMark className="px-3">{title}</BrushMark>
            </h2>
            <div className="space-y-2">
              {items.map((item) => {
                const key = `${id}:${item.q}`
                const open = openKey === key
                return (
                  <div key={key} className="rounded-md border border-[#ECE6DF] bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenKey(open ? null : key)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 px-5 py-3 text-right text-sm text-[#2F2B28]"
                    >
                      {item.q}
                      {open ? (
                        <Minus className="h-4 w-4 shrink-0 text-[#5A544E]" />
                      ) : (
                        <Plus className="h-4 w-4 shrink-0 text-[#5A544E]" />
                      )}
                    </button>
                    {open && (
                      <div className="space-y-2 px-5 pb-4 text-sm leading-7 text-[#5A544E]">
                        {item.a.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        <section className="grid overflow-hidden rounded-xl bg-[#F3E9DF] md:grid-cols-2">
          <div className="px-6 py-10 text-center sm:px-10">
            <Heart className="mx-auto mb-3 h-7 w-7 text-[#3C3834]" strokeWidth={1.2} />
            <h2 className="mb-4 text-2xl font-normal text-[#2F2B28] sm:text-[1.7rem]">מוכנים ליצור את החדר שלהם?</h2>
            <p className="mb-2 text-[13px] leading-6 text-[#3C3834]">
              ב־PETITE DREAMS אנחנו עושים עבורכם את החלק שלפעמים מרגיש הכי מורכב: בוחרים מתוך אינסוף
              אפשרויות ומחברים צבעים, טקסטיל, אמנות, תאורה ופריטים לשפה אחת שלמה.
            </p>
            <p className="mb-2 text-[13px] leading-6 text-[#3C3834]">
              אתם לא צריכים להתחיל מדף ריק, וגם לא להחליף חדר שלם. לפעמים כל הקסם נמצא בבחירות הנכונות.
            </p>
            <p className="mb-6 mt-4 text-lg font-medium leading-7 text-[#2F2B28]">
              אנחנו דואגים לצד העיצובי.
              <br />
              אתם הופכים אותו לחדר שלהם.
            </p>
            <Link
              to="/questionnaire"
              className="inline-block rounded-md bg-[#B39A86] px-10 py-2.5 text-sm text-white transition-colors hover:bg-[#9F8673]"
            >
              התחילו עכשיו
            </Link>
          </div>
          <img src="/assets/faq-cta.jpg" alt="" className="h-full min-h-[260px] w-full object-cover" />
        </section>

        <div className="grid grid-cols-2 gap-y-6 text-center sm:grid-cols-4">
          {PROMISES.map(({ icon: Icon, text }, index) => (
            <div
              key={text}
              className={`px-4 ${index > 0 ? 'sm:border-s sm:border-[#E3DBD2]' : ''}`}
            >
              <Icon className="mx-auto mb-2 h-6 w-6 text-[#B39A86]" strokeWidth={1.2} />
              <p className="text-[13px] leading-6 text-[#3C3834]">{text}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
