import { Package, Search, Sparkles } from 'lucide-react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export function TipsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FDFCFB]">
      <Header />

      <div className="mx-auto max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-light text-[#4A4A4A]">טיפים ועצות שימושיות</h1>
          <p className="text-lg text-[#6B6B6B]">
            כל מה שצריך לדעת על מציאת מוצרים, השוואת מחירים והזמנה חכמה
          </p>
        </div>

        <div className="space-y-8">
          <div className="rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#D4E7F7]">
                <Search className="h-6 w-6 text-[#6A9AC4]" />
              </div>
              <h2 className="text-2xl font-normal text-[#4A4A4A]">
                מציאת מוצר דומה במידה והמוצר אזל מהמלאי
              </h2>
            </div>

            <div className="space-y-4 text-[#6B6B6B]">
              <div className="rounded-sm border-r-4 border-[#6A9AC4] bg-[#F0F8FF] p-4">
                <h3 className="mb-2 flex items-center gap-2 font-normal text-[#4A4A4A]">
                  <Sparkles className="h-5 w-5 text-[#6A9AC4]" />
                  שימוש בתמונת המוצר לחיפוש
                </h3>
                <p className="text-sm">
                  ב-AliExpress: לחצי על אייקון המצלמה בסרגל החיפוש והעלי את תמונת המוצר מהחבילה
                  שלך. המערכת תמצא מוצרים דומים אוטומטית.
                </p>
              </div>

              <div className="rounded-sm border-r-4 border-[#6A9AC4] bg-[#F0F8FF] p-4">
                <h3 className="mb-2 flex items-center gap-2 font-normal text-[#4A4A4A]">
                  <Package className="h-5 w-5 text-[#6A9AC4]" />
                  התאמת צבעים
                </h3>
                <p className="text-sm">
                  השתמשי בלוח הצבעים שמגיע עם החבילה שלך! גם אם המוצר לא זהה לחלוטין, וודאי
                  שהצבעים מתאימים לפלטה המקורית לשמירה על הרמוניה בעיצוב.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#E8D4E8]">
                <Sparkles className="h-6 w-6 text-[#A488A4]" />
              </div>
              <h2 className="text-2xl font-normal text-[#4A4A4A]">טיפים כלליים לקנייה חכמה</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-4">
                <h3 className="mb-2 font-normal text-[#4A4A4A]">🎨 התאמת גוונים</h3>
                <p className="text-sm text-[#6B6B6B]">
                  צבעים במסך עשויים להיראות שונה מהמציאות. קראי ביקורות עם תמונות ממשתמשים
                  אחרים לראות את הצבע האמיתי.
                </p>
              </div>

              <div className="rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-4">
                <h3 className="mb-2 font-normal text-[#4A4A4A]">⏰ תכנני מראש</h3>
                <p className="text-sm text-[#6B6B6B]">
                  משלוחים בינלאומיים לוקחים זמן. הזמיני לפחות חודש לפני המועד הרצוי כדי להיות
                  בטוחה שהכל יגיע בזמן.
                </p>
              </div>

              <div className="rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-4">
                <h3 className="mb-2 font-normal text-[#4A4A4A]">💬 תקשרי עם המוכר</h3>
                <p className="text-sm text-[#6B6B6B]">
                  אל תפחדי לשאול שאלות לפני הרכישה. מוכרים טובים ישמחו לענות על שאלות לגבי
                  מידות, צבעים וזמני משלוח.
                </p>
              </div>

              <div className="rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-4">
                <h3 className="mb-2 font-normal text-[#4A4A4A]">📦 בדקי מיד בקבלה</h3>
                <p className="text-sm text-[#6B6B6B]">
                  פתחי חבילות מיד כשהן מגיעות ובדקי נזקים. יש זמן מוגבל לפתוח תביעה אם משהו לא
                  בסדר.
                </p>
              </div>

              <div className="rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-4 md:col-span-2">
                <h3 className="mb-2 font-normal text-[#4A4A4A]">🛡️ הגנת קונה</h3>
                <p className="text-sm text-[#6B6B6B]">
                  באתרים כמו AliExpress יש הגנת קונה. אל תאשרי קבלת המוצר לפני שבאמת קיבלת אותו
                  ובדקת שהוא תקין.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-sm bg-gradient-to-br from-[#F5F1ED] to-[#E8DED2] p-8 text-center">
            <h3 className="mb-3 text-2xl font-light text-[#4A4A4A]">צריכה עזרה נוספת?</h3>
            <p className="mb-4 text-[#6B6B6B]">
              אם יש לך שאלות נוספות על תהליך הקנייה או איך למצוא מוצרים, אנחנו כאן לעזור!
            </p>
            <p className="text-sm text-[#8B8B8B]">
              שלחי לנו הודעה באימייל:{' '}
              <a
                href="mailto:support@petitedreams.com"
                className="font-normal text-[#C8B6A6] hover:underline"
              >
                support@petitedreams.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
