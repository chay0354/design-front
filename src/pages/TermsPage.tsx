import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-8 shadow-xl md:p-12">
          <h1 className="mb-8 text-4xl font-bold text-gray-800">תנאי שימוש</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-800">1. קבלת התנאים</h2>
              <p>
                בגישה ושימוש באתר PETITE DREAMS, אתה מסכים להיות מחויב לתנאי שימוש אלה. אם אינך
                מסכים לתנאים אלה, אנא אל תשתמש בשירותים שלנו.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-800">2. תיאור השירות</h2>
              <p>PETITE DREAMS מספקת חבילות עיצוב פנים דיגיטליות לחדרי ילדים. השירות שלנו כולל:</p>
              <ul className="mr-6 mt-2 space-y-1">
                <li>• לוחות צבעים וקודי צבע מדויקים</li>
                <li>• מדריכי תלייה ומיקום לאלמנטים דקורטיביים</li>
                <li>• קישורים לרכישת מוצרים מומלצים</li>
                <li>• הדמיות תלת-ממדיות גנריות</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-800">3. מוצר דיגיטלי בלבד</h2>
              <p className="mb-2">
                <strong>חשוב להבין:</strong> אנו מספקים חבילות עיצוב דיגיטליות בלבד. השירות שלנו{' '}
                <strong>אינו כולל:</strong>
              </p>
              <ul className="mr-6 space-y-1">
                <li>• ליווי אישי או ייעוץ מעצב פנים</li>
                <li>• התקנה פיזית או עזרה בהרכבת החדר</li>
                <li>• אספקת מוצרים פיזיים</li>
                <li>• ביקורים בביתך או מדידות חדר</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-800">4. אחריות על מוצרים</h2>
              <p>
                <strong>PETITE DREAMS אינה אחראית על:</strong>
              </p>
              <ul className="mr-6 mt-2 space-y-1">
                <li>• איכות המוצרים שנרכשים דרך הקישורים שלנו</li>
                <li>• זמני אספקה, עיכובים או בעיות משלוח</li>
                <li>• מוצרים פגומים, שגויים או לא מתאימים</li>
                <li>• בעיות בתקשורת עם ספקים חיצוניים</li>
                <li>• מדיניות החזרות או זיכויים של ספקים</li>
              </ul>
              <p className="mt-3">
                כל בעיה הקשורה לרכישת המוצרים עצמם צריכה להיפתר ישירות בינך לבין הספק (AliExpress
                או ספקים אחרים).
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-800">5. תמחור ותשלום</h2>
              <ul className="mr-6 space-y-2">
                <li>• חבילות עיצוב עולות בין ₪480 ל-₪560</li>
                <li>• תשלום חד-פעמי מקנה גישה לכל החיים לחבילה</li>
                <li>• אנו שומרים על הזכות לשנות מחירים בכל עת</li>
                <li>• מבצעים והנחות עשויים להיות מוגבלים בזמן</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-800">6. מדיניות החזרות והחזרים</h2>
              <p>מכיוון שאנו מספקים מוצרים דיגיטליים שניתן לגשת אליהם מיד לאחר הרכישה:</p>
              <ul className="mr-6 mt-2 space-y-1">
                <li>• לא ניתן להחזיר חבילות דיגיטליות לאחר הרכישה</li>
                <li>• אנא בדקי היטב את תצוגות החבילה לפני הרכישה</li>
                <li>• במקרים חריגים, נשקול החזרים על בסיס אישי</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-800">7. קניין רוחני</h2>
              <p>כל התוכן, העיצובים והחומרים באתר הם קניין של PETITE DREAMS. אסור:</p>
              <ul className="mr-6 mt-2 space-y-1">
                <li>• לשכפל או להפיץ את החבילות ללא אישור</li>
                <li>• להשתמש בעיצובים למטרות מסחריות</li>
                <li>• למכור או להעביר את הגישה לחבילות שלך לאחרים</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-800">8. הגבלת אחריות</h2>
              <p>
                PETITE DREAMS לא תהיה אחראית לכל נזק עקיף, מקרי או תוצאתי הנובע משימוש בשירותים
                שלנו. האחריות המקסימלית שלנו מוגבלת לסכום ששולם עבור החבילה.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-800">9. שינויים בתנאים</h2>
              <p>
                אנו שומרים על הזכות לעדכן תנאים אלה בכל עת. שינויים יכנסו לתוקף מיד עם פרסומם
                באתר. המשך השימוש שלך באתר לאחר שינויים מהווה הסכמה לתנאים המעודכנים.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-gray-800">10. יצירת קשר</h2>
              <p>לשאלות לגבי תנאי שימוש אלה, אנא צור קשר:</p>
              <p className="mt-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:info@petite-dreams.com" className="text-pink-600 hover:underline">
                  info@petite-dreams.com
                </a>
              </p>
            </section>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600">עדכון אחרון: מרץ 2026</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
