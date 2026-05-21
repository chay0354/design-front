import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm md:p-12">
          <h1 className="mb-8 text-4xl font-light text-[#4A4A4A]">מדיניות פרטיות</h1>

          <div className="space-y-6 text-[#6B6B6B]">
            <section>
              <h2 className="mb-3 text-2xl font-normal text-[#4A4A4A]">1. מבוא</h2>
              <p>
                PETITE DREAMS (&quot;אנחנו&quot;, &quot;שלנו&quot;) מחויבת להגן על הפרטיות שלך. מדיניות
                פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגינים על המידע האישי שלך.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-normal text-[#4A4A4A]">2. מידע שאנו אוספים</h2>
              <p className="mb-2">אנו עשויים לאסוף את סוגי המידע הבאים:</p>
              <ul className="mr-6 space-y-2">
                <li>
                  <strong className="text-[#4A4A4A]">מידע אישי:</strong> שם, כתובת אימייל, פרטי
                  תשלום
                </li>
                <li>
                  <strong className="text-[#4A4A4A]">מידע על הילד:</strong> שם הילד, גיל, מגדר,
                  העדפות נושא (לצורך התאמת חבילות העיצוב)
                </li>
                <li>
                  <strong className="text-[#4A4A4A]">מידע טכני:</strong> כתובת IP, סוג דפדפן, מערכת
                  הפעלה
                </li>
                <li>
                  <strong className="text-[#4A4A4A]">מידע שימוש:</strong> דפים שביקרת, חבילות שנצפו,
                  פעולות באתר
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-normal text-[#4A4A4A]">3. כיצד אנו משתמשים במידע שלך</h2>
              <p className="mb-2">אנו משתמשים במידע שנאסף עבור:</p>
              <ul className="mr-6 space-y-1">
                <li>• עיבוד הזמנות ומתן גישה לחבילות העיצוב שלך</li>
                <li>• התאמה אישית של המלצות עיצוב לפי גיל ומגדר הילד</li>
                <li>• שליחת תזכורות לשדרוג כשהילד גדל</li>
                <li>• שיפור השירותים והתוכן שלנו</li>
                <li>• תקשורת בנוגע להזמנה שלך או שאלות תמיכה</li>
                <li>• שליחת עדכונים שיווקיים (רק עם הסכמתך)</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-normal text-[#4A4A4A]">4. אבטחת מידע</h2>
              <p>אנו מיישמים אמצעי אבטחה סטנדרטיים בתעשייה כדי להגן על המידע האישי שלך:</p>
              <ul className="mr-6 mt-2 space-y-1">
                <li>• הצפנת SSL לכל העברות נתונים</li>
                <li>• אחסון מאובטח של פרטי תשלום (לא שומרים מספרי כרטיס אשראי מלאים)</li>
                <li>• גישה מוגבלת למידע אישי רק לעובדים מורשים</li>
                <li>• ביקורות אבטחה ועדכונים שוטפים</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-normal text-[#4A4A4A]">5. שיתוף מידע עם צדדים שלישיים</h2>
              <p className="mb-2">אנו לא מוכרים את המידע האישי שלך. אנו עשויים לשתף מידע עם:</p>
              <ul className="mr-6 space-y-1">
                <li>• מעבדי תשלומים (לעיבוד עסקאות מאובטחות)</li>
                <li>• ספקי שירותים טכניים (אירוח, ניתוח נתונים)</li>
                <li>• רשויות חוק (כנדרש על פי חוק)</li>
              </ul>
              <p className="mt-2">
                <strong>חשוב:</strong> כאשר אתה לוחץ על קישורי קנייה ל-AliExpress או ספקים אחרים,
                אתה עוזב את האתר שלנו ומסכים למדיניות הפרטיות שלהם.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-normal text-[#4A4A4A]">6. עוגיות (Cookies)</h2>
              <p>אנו משתמשים בעוגיות כדי לשפר את חוויית המשתמש שלך:</p>
              <ul className="mr-6 mt-2 space-y-1">
                <li>• שמירה על העדפות התחברות</li>
                <li>• ניתוח תנועה באתר</li>
                <li>• התאמה אישית של תוכן</li>
              </ul>
              <p className="mt-2">
                ניתן לנטרל עוגיות בהגדרות הדפדפן שלך, אך זה עשוי להשפיע על הפונקציונליות של האתר.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-normal text-[#4A4A4A]">7. הזכויות שלך</h2>
              <p className="mb-2">יש לך את הזכויות הבאות לגבי המידע האישי שלך:</p>
              <ul className="mr-6 space-y-1">
                <li>
                  • <strong>גישה:</strong> לבקש עותק של המידע שלך
                </li>
                <li>
                  • <strong>תיקון:</strong> לעדכן מידע לא מדויק
                </li>
                <li>
                  • <strong>מחיקה:</strong> לבקש מחיקת החשבון והמידע שלך
                </li>
                <li>
                  • <strong>ביטול הסכמה:</strong> להפסיק לקבל אימיילים שיווקיים בכל עת
                </li>
              </ul>
              <p className="mt-2">
                ליצירת קשר בנוגע לזכויות אלה, שלח אימייל אל:{' '}
                <a href="mailto:privacy@petite-dreams.com" className="text-[#C8B6A6] hover:underline">
                  privacy@petite-dreams.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-normal text-[#4A4A4A]">8. פרטיות ילדים</h2>
              <p>
                השירותים שלנו מיועדים להורים ומבוגרים. אנו אוספים רק מידע בסיסי על ילדים (שם, גיל,
                מגדר){' '}
                <strong className="text-[#4A4A4A]">רק דרך ההורה</strong> לצורך התאמת חבילות העיצוב.
                אנו לא אוספים ישירות מידע מילדים מתחת לגיל 18.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-normal text-[#4A4A4A]">9. שינויים במדיניות הפרטיות</h2>
              <p>
                אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. נודיע לך על שינויים משמעותיים באמצעות
                אימייל או הודעה באתר. המשך השימוש באתר לאחר שינויים מהווה הסכמה למדיניות המעודכנת.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-normal text-[#4A4A4A]">10. יצירת קשר</h2>
              <p>לשאלות או חששות לגבי מדיניות פרטיות זו:</p>
              <div className="mt-2 space-y-1">
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@petite-dreams.com" className="text-[#C8B6A6] hover:underline">
                    privacy@petite-dreams.com
                  </a>
                </p>
                <p>
                  <strong>אתר:</strong> www.petite-dreams.com
                </p>
              </div>
            </section>

            <div className="mt-8 border-t border-[#E8DED2] pt-6">
              <p className="text-sm text-[#8B8B8B]">עדכון אחרון: מרץ 2026</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
