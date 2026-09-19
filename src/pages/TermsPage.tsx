import { Link } from 'react-router-dom'
import { Box, CreditCard, Info, Palette, RefreshCw, Ruler, Shield, ShoppingBag } from 'lucide-react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

const termsImage = '/assets/hero-background.png'

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-3 text-center text-2xl font-light text-[#4A4A4A] sm:text-3xl">
      {children}
    </h2>
  )
}

export function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h1 className="mb-4 text-4xl font-light tracking-wide text-[#4A4A4A] sm:text-5xl">
            תקנון שימוש PETITE DREAMS
          </h1>
          <div className="mx-auto mb-5 h-px w-10 bg-[#E4DDD3]" />
          <p className="text-sm text-[#8B8B8B] sm:text-base">
            עיצוב מקצועי לחדר ילדים, פשוט ונגיש — והתנאים שחשוב להכיר
          </p>
        </div>

        <div className="mb-20 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <img
            src={termsImage}
            alt=""
            className="aspect-[4/5] w-full rounded-2xl object-cover"
          />

          <div className="space-y-5 text-sm leading-7 text-[#8B8B8B] sm:text-base sm:leading-8">
            <p>
              בגישה ושימוש באתר PETITE DREAMS, אתם מסכימים להיות מחויבים לתקנון זה. אם אינכם
              מסכימים לתנאים, אנא אל תשתמשו בשירותים שלנו.
            </p>
            <p>
              PETITE DREAMS מספקת חבילות עיצוב פנים דיגיטליות לחדרי ילדים. השירות כולל לוחות צבעים
              וקודי צבע מדויקים, מדריכי תלייה ומיקום, קישורים לרכישת מוצרים מומלצים, והדמיות של
              החדר המעוצב.
            </p>
            <p>
              חשוב להבין: אנו מספקים חבילות עיצוב דיגיטליות בלבד. השירות אינו כולל ליווי אישי,
              ייעוץ מעצב פנים, התקנה פיזית, אספקת מוצרים, ביקורים בבית או מדידות חדר.
            </p>
            <p>
              PETITE DREAMS אינה אחראית לאיכות המוצרים שנרכשים דרך הקישורים, לזמני אספקה, למוצרים
              פגומים או למדיניות ההחזרות של הספקים. כל בעיה הקשורה לרכישה עצמה צריכה להיפתר מול
              הספק (AliExpress או אחרים).
            </p>
            <p>
              חבילות העיצוב עולות בין ₪480 ל-₪560. תשלום חד-פעמי מקנה גישה לכל החיים לחבילה.
              מכיוון שמדובר במוצר דיגיטלי שנפתח מיד לאחר הרכישה, לא ניתן להחזיר חבילות לאחר
              הרכישה — למעט מקרים חריגים שייבחנו באופן אישי.
            </p>
            <p>
              כל התוכן, העיצובים והחומרים באתר הם קניין של PETITE DREAMS. אסור לשכפל או להפיץ את
              החבילות, להשתמש בהן למטרות מסחריות, או להעביר את הגישה לאחרים.
            </p>
          </div>
        </div>

        <section className="mb-20">
          <SectionTitle>השירות שלנו</SectionTitle>
          <p className="mx-auto mb-12 max-w-xl text-center text-sm leading-7 text-[#8B8B8B]">
            מה כלול בחבילה הדיגיטלית — ומה נשאר באחריותכם.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Palette, title: 'צבעים', text: 'לוח צבעים מדויק עם קודי צבע מלאים' },
              { icon: ShoppingBag, title: 'קנייה', text: 'קישורים ישירים למוצרים מומלצים' },
              { icon: Ruler, title: 'מיקום', text: 'מדריך תלייה ומיקום לכל אלמנט' },
              { icon: Box, title: 'הדמיה', text: 'תצוגת החדר המוכן עם הפריטים שנבחרו' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center">
                <Icon className="mx-auto mb-4 h-7 w-7 text-[#C4B8A8]" strokeWidth={1.25} />
                <h3 className="mb-2 font-light text-[#4A4A4A]">{title}</h3>
                <p className="text-sm leading-6 text-[#8B8B8B]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <SectionTitle>עקרונות התקנון</SectionTitle>
          <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-7 text-[#8B8B8B]">
            התקנון מגדיר את גבולות השירות, התשלום, והאחריות — כדי שתוכלו לרכוש בביטחון.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: 'דיגיטלי בלבד', text: 'אין ליווי אישי, התקנה או אספקת מוצרים' },
              { icon: CreditCard, title: 'תשלום חד-פעמי', text: 'גישה לכל החיים לחבילה שנרכשה' },
              { icon: RefreshCw, title: 'ללא החזרות', text: 'מוצר דיגיטלי שנפתח מיד לאחר הרכישה' },
              { icon: Shield, title: 'אחריות ספקים', text: 'בעיות משלוח ואיכות מול החנות בלבד' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center">
                <Icon className="mx-auto mb-4 h-7 w-7 text-[#C4B8A8]" strokeWidth={1.25} />
                <h3 className="mb-2 font-light text-[#4A4A4A]">{title}</h3>
                <p className="text-sm leading-6 text-[#8B8B8B]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-2xl bg-[#FBF9F6] px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <Info className="h-5 w-5 flex-shrink-0 text-[#C4B8A8]" strokeWidth={1.5} />
            <div className="text-sm leading-7 text-[#8B8B8B]">
              <h2 className="mb-3 text-lg font-light text-[#4A4A4A]">חשוב לדעת</h2>
              <p className="mb-3">
                PETITE DREAMS לא תהיה אחראית לנזק עקיף, מקרי או תוצאתי הנובע משימוש בשירות.
                האחריות המקסימלית מוגבלת לסכום ששולם עבור החבילה.
              </p>
              <p className="mb-3">
                אנו רשאים לעדכן תקנון זה בכל עת. שינויים נכנסים לתוקף עם פרסומם באתר, והמשך
                השימוש מהווה הסכמה לתנאים המעודכנים.
              </p>
              <p>
                לשאלות:{' '}
                <a href="mailto:info@petite-dreams.com" className="text-[#8B7340] hover:underline">
                  info@petite-dreams.com
                </a>
                {' · '}
                עדכון אחרון: מרץ 2026
              </p>
            </div>
          </div>
        </section>

        <section className="pb-8 text-center">
          <h2 className="mb-3 text-2xl font-light text-[#4A4A4A]">מוכנים להתחיל?</h2>
          <p className="mb-6 text-sm text-[#8B8B8B]">צרו את חדר החלומות של הילד תוך דקות.</p>
          <Link
            to="/questionnaire"
            className="inline-block rounded-full bg-[#C4B8A8] px-8 py-3 text-sm text-white transition-colors hover:bg-[#B5A99A]"
          >
            לכל החבילות
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  )
}
