import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Home, Minus, Palette, Plus, ShoppingBag } from 'lucide-react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

const heroBackground = '/assets/hero-background.png'

type FaqTab = 'package' | 'purchase' | 'service'

const TABS: { id: FaqTab; label: string; icon: typeof Home }[] = [
  { id: 'package', label: 'על החבילה', icon: Home },
  { id: 'purchase', label: 'רכישה ומוצרים', icon: ShoppingBag },
  { id: 'service', label: 'השירות שלנו', icon: Heart },
]

const FAQ: Record<FaqTab, { q: string; a: string }[]> = {
  package: [
    {
      q: 'מה כלול בחבילת העיצוב?',
      a: 'כל חבילה כוללת הדמיית חדר, פלטת גוונים מדויקת, רשימת קניות עם קישורים ישירים, והנחיות ליישום. אין צורך להחליף רהיטים כבדים — מתמקדים בסטיילינג.',
    },
    {
      q: 'לאיזה גיל החדר מיועד?',
      a: 'כל חבילה מותאמת לקבוצת גיל ולנושא שנבחרו בשאלון. אפשר לחזור ולרענן את העיצוב כשהילד גדל, במחיר מופחת.',
    },
    {
      q: 'האם צריך להחליף את הריהוט?',
      a: 'לא. החבילות בנויות סביב ריהוט קיים: צבע, טקסטיל, תאורה ואלמנטים דקורטיביים שמשנים את האווירה בלי פרויקט שיפוץ.',
    },
    {
      q: 'האם הפריטים בחבילה זמינים?',
      a: 'אנחנו בוחרים פריטים זמינים בזמן בניית החבילה. אם פריט אזל, אפשר לחפש תמונה זהה ב-AliExpress או להיעזר במדריך שבאזור האישי.',
    },
    {
      q: 'אפשר לבחור פריטים אחרים?',
      a: 'כן. החבילה היא כיוון מקצועי. אפשר להחליף פריט כל עוד נשמרים הגוונים והסגנון של הפלטה.',
    },
    {
      q: 'אפשר לשנות את פלטת הצבעים?',
      a: 'הפלטה נבחרת לפי השאלון. אם תרצו כיוון אחר, אפשר לעבור על השאלון שוב ולבחור חבילה בגוונים שונים.',
    },
    {
      q: 'איך בוחרים חבילה?',
      a: 'עונים על שאלון קצר — גיל, מגדר, נושא וגוונים — ומקבלים חבילה מותאמת תוך דקות.',
    },
    {
      q: 'מה קורה אם פריט אזל?',
      a: 'משתמשים בתמונת המוצר לחיפוש דומה, ומתאימים לפי לוח הצבעים של החבילה. יש מדריך מלא בארגז הכלים שבחשבון.',
    },
  ],
  purchase: [
    {
      q: 'מאיפה מזמינים את הפריטים?',
      a: 'רוב הקישורים מובילים ל-AliExpress, ולעיתים גם ל-IKEA. הרכישה מתבצעת ישירות מול החנות, לא דרכנו.',
    },
    {
      q: 'כמה זמן לוקח המשלוח?',
      a: 'משלוחים בינלאומיים יכולים לקחת כמה שבועות. מומלץ להזמין לפחות חודש לפני המועד הרצוי.',
    },
    {
      q: 'מה אם פריט לא מתאים?',
      a: 'מדיניות החלפות והחזרות היא של הספק בלבד. PETITE DREAMS לא מטפלת במשלוחים או בהחזרות מול החנויות.',
    },
    {
      q: 'מה קורה אם מוצר אזל מהמלאי?',
      a: 'מחפשים חלופה לפי התמונה והפלטה. החבילה הדיגיטלית נשארת שלכם לכל החיים, גם אם פריט בודד משתנה.',
    },
    {
      q: 'האם יש החזרות על החבילה עצמה?',
      a: 'החבילה היא מוצר דיגיטלי שנפתח מיד לאחר הרכישה, ולכן לא ניתן להחזיר אותה — למעט מקרים חריגים שייבחנו באופן אישי.',
    },
  ],
  service: [
    {
      q: 'האם הרכישה כוללת ליווי אישי?',
      a: 'לא. PETITE DREAMS מספקת חבילות עיצוב דיגיטליות בלבד: הדמיה, פלטה, קישורים והנחיות. אין ביקור בית או ליווי מעצבת.',
    },
    {
      q: 'אפשר להתאים את הפריטים לחדר שלי?',
      a: 'ההדמיה היא כיוון עיצובי לחדר סטנדרטי. אתם מיישמים אותה בחדר שלכם לפי המידות והריהוט הקיים.',
    },
    {
      q: 'מה אם יש לי בעיה או שאלה?',
      a: 'אפשר לפנות אלינו ב-info@petite-dreams.com. לשאלות על מוצר ספציפי — פנו ישירות למוכר בחנות.',
    },
  ],
}

export function FaqPage() {
  const [tab, setTab] = useState<FaqTab>('package')
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const items = FAQ[tab]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroBackground}')` }}
        />
        <div className="absolute inset-0 bg-white/80" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
          <h1 className="mb-4 text-4xl font-light text-[#4A4A4A] sm:text-5xl">שאלות ותשובות</h1>
          <p className="mx-auto max-w-xl text-sm leading-7 text-[#8B8B8B] sm:text-base">
            כל מה שחשוב לדעת לפני שבוחרים חבילת עיצוב של PETITE DREAMS, כדי שתוכלו ליצור חדר
            הרמוני בביטחון ובקלות.
          </p>
        </div>
      </section>

      <div className="relative z-20 mx-auto max-w-3xl px-4 pb-6 sm:px-6">
        <div className="-mt-6 mb-10 flex justify-center gap-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id)
                  setOpenIndex(0)
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-[#C4B8A8] text-white'
                    : 'bg-[#F7F4F0] text-[#8B8B8B] hover:text-[#4A4A4A]'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {label}
              </button>
            )
          })}
        </div>

        <div className="divide-y divide-[#F0EBE4]">
          {items.map((item, index) => {
            const open = openIndex === index
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-right"
                >
                  <span className="text-[#4A4A4A]">{item.q}</span>
                  {open ? (
                    <Minus className="h-4 w-4 flex-shrink-0 text-[#C4B8A8]" />
                  ) : (
                    <Plus className="h-4 w-4 flex-shrink-0 text-[#C4B8A8]" />
                  )}
                </button>
                {open && (
                  <p className="pb-5 text-sm leading-7 text-[#8B8B8B]">{item.a}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <section className="relative mx-auto mt-10 max-w-4xl overflow-hidden px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#F7F4F0] px-6 py-14 text-center">
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url('${heroBackground}')` }}
          />
          <div className="relative z-10">
            <Heart className="mx-auto mb-4 h-7 w-7 text-[#C4B8A8]" strokeWidth={1.25} />
            <h2 className="mb-3 text-2xl font-light text-[#4A4A4A] sm:text-3xl">
              מוכנים ליצור את החדר?
            </h2>
            <p className="mx-auto mb-8 max-w-md text-sm leading-7 text-[#8B8B8B]">
              עונים על כמה שאלות פשוטות ומקבלים חבילת עיצוב מותאמת תוך דקות.
            </p>
            <Link
              to="/questionnaire"
              className="inline-block rounded-full bg-[#C4B8A8] px-8 py-3 text-sm text-white transition-colors hover:bg-[#B5A99A]"
            >
              התחילי עכשיו
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 pb-16 text-center sm:grid-cols-4">
        {[
          { icon: ShoppingBag, text: 'מוצרים נבחרים' },
          { icon: Palette, text: 'עיצוב מקצועי' },
          { icon: Heart, text: 'שפה אחידה' },
          { icon: Home, text: 'קל ליישום' },
        ].map(({ icon: Icon, text }) => (
          <div key={text}>
            <Icon className="mx-auto mb-2 h-5 w-5 text-[#C4B8A8]" strokeWidth={1.25} />
            <p className="text-xs text-[#8B8B8B]">{text}</p>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  )
}
