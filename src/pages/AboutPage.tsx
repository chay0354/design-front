import { Link } from 'react-router-dom'
import { Heart, Palette, Sparkles, Users } from 'lucide-react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-light text-[#4A4A4A]">אודות PETITE DREAMS</h1>
        </div>

        <div className="mb-8 rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm md:p-12">
          <h2 className="mb-8 text-center text-3xl font-light text-[#4A4A4A]">
            נעים מאוד, אני הגר ברגיל.
          </h2>

          <div className="mx-auto max-w-3xl space-y-6 text-lg leading-relaxed text-[#6B6B6B]">
            <p>
              כמעצבת פנים עם למעלה מ-15 שנות ניסיון ורקע מקצועי בלימודי עיצוב באיטליה, ליוויתי
              אינספור פרויקטים של מגורי יוקרה וחללים מורכבים. לאורך השנים, זיהיתי פער משמעותי:
              בעוד שהחללים המרכזיים בבית זוכים לתכנון מדוקדק, חדר הילדים — החלל שמשפיע יותר מכל על
              הביטחון והתפתחות הילד — נותר ללא מענה מקצועי בשל עלויות גבוהות או חוסר זמן.
            </p>

            <h3 className="pt-4 text-2xl font-normal text-[#4A4A4A]">
              הפילוסופיה שלי: עיצוב אינטליגנטי הוא עיצוב שמשתנה.
            </h3>

            <p>
              מתוך המומחיות שלי בעולם העיצוב הגבוה, הבנתי שחדר ילדים מוצלח הוא לא זה שנכלא בתוך
              נגרויות יקרות או חיפויי קיר קבועים ומחייבים. הילדים שלנו גדלים, הטעם שלהם משתנה,
              והחדר צריך לנשום ולהתפתח יחד איתם.
            </p>

            <p>
              יצרתי את PETITE DREAMS כדי להנגיש את ה&quot;עין המקצועית&quot; שלי לכל הורה שמחפש
              חדר מעוצב ברמה הגבוהה ביותר — ללא צורך בליווי צמוד או בהוצאות עתק.
            </p>

            <h3 className="pt-4 text-2xl font-normal text-[#4A4A4A]">
              הנוסחה המדויקת לחדר החלומות שלכם
            </h3>

            <p>
              כל חבילה ב-PETITE DREAMS היא תוצר של אוצרות (Curation) קפדנית. השתמשתי בניסיון שלי
              כדי לסנן עבורכם את הרעש, לבחור פלטות צבעים מדויקות ולמצוא את הפריטים שנראים נהדר
              ומשתלבים בהרמוניה מושלמת.
            </p>

            <p>
              אני מאמינה שעיצוב יוקרתי נמדד בדיוק של הפרטים הקטנים ובאנרגיה שהחלל מייצר, ולאו דווקא
              במחיר של הרהיט. כאן, אתם מקבלים את ה&quot;קוד&quot; המקצועי שלי — מעוצב, נגיש, ומוכן
              לביצוע מיידי.
            </p>

            <h3 className="pt-4 text-2xl font-normal text-[#4A4A4A]">
              אני מזמינה אתכם להפסיק להתלבט ולהתחיל לעצב.
            </h3>

            <p>
              החזון שלי הוא שכל ילד יגדל בחלל שמעורר בו השראה, וכל הורה יוכל להגשים את החלום הזה
              בקלות ובביטחון מלא. המערכת שבניתי כאן תעזור לכם לדייק את הבחירות שלכם וליצור חדר
              הרמוני בתוך דקות.
            </p>

            <p className="border-t border-[#E8DED2] pt-6 text-center text-xl font-normal text-[#4A4A4A]">
              בואו נתחיל לעצב את החלום הקטן שלכם,
              <br />
              הגר.
            </p>
          </div>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Heart,
              gradient: 'from-[#E8B6A6] to-[#C8B6A6]',
              title: 'יוקרה במחיר נגיש',
              text: 'איכות עיצוב מקצועי במחירים ידידותיים לתקציב',
            },
            {
              icon: Palette,
              gradient: 'from-[#D4C4B0] to-[#C8B6A6]',
              title: 'אוצרות מקצועית',
              text: 'כל חבילה מעוצבת על ידי מעצבת פנים מקצועית',
            },
            {
              icon: Sparkles,
              gradient: 'from-[#C8C6B6] to-[#B5A99A]',
              title: 'התאמה לגיל',
              text: 'עיצובים שגדלים עם הילד שלך לאורך השנים',
            },
            {
              icon: Users,
              gradient: 'from-[#A8C4A8] to-[#7BA05B]',
              title: 'ממוקדי משפחה',
              text: 'נוצר במיוחד עבור הורים שרוצים הטוב ביותר לילדים שלהם',
            },
          ].map(({ icon: Icon, gradient, title, text }) => (
            <div
              key={title}
              className="rounded-sm border border-[#E8DED2] bg-white p-6 text-center shadow-sm"
            >
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${gradient}`}
              >
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-normal text-[#4A4A4A]">{title}</h3>
              <p className="text-sm text-[#6B6B6B]">{text}</p>
            </div>
          ))}
        </div>

        <div className="mb-8 rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm md:p-12">
          <h2 className="mb-8 text-center text-3xl font-light text-[#4A4A4A]">מה אנחנו מציעים</h2>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-xl font-normal text-[#4A4A4A]">✨ חבילות עיצוב מקיפות</h3>
              <ul className="space-y-2 text-[#6B6B6B]">
                <li>• לוחות צבעים מדויקים עם קודי צבע מלאים</li>
                <li>• מדריכי תלייה ומיקום לכל אלמנט</li>
                <li>• קישורים ישירים לרכישת כל המוצרים</li>
                <li>• הדמיות תלת-ממדיות של החדר המעוצב</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xl font-normal text-[#4A4A4A]">🎯 מיקוד בעיצוב והסגנון</h3>
              <ul className="space-y-2 text-[#6B6B6B]">
                <li>• התמקדות באלמנטים דקורטיביים בלבד</li>
                <li>• אין צורך להחליף רהיטים כבדים</li>
                <li>• שינוי קל כשהילד גדל</li>
                <li>• תקציב נשלט ומנוהל</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xl font-normal text-[#4A4A4A]">💰 מחירים הוגנים</h3>
              <ul className="space-y-2 text-[#6B6B6B]">
                <li>• ₪480-₪560 לחבילה מלאה</li>
                <li>• חוסכים מעל ₪1,500 לעומת מעצבת פנים</li>
                <li>• הנחות לשדרוגים עתידיים</li>
                <li>• הנחות משפחתיות לאחים</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xl font-normal text-[#4A4A4A]">🔄 תמיכה מתמשכת</h3>
              <ul className="space-y-2 text-[#6B6B6B]">
                <li>• גישה לכל החיים לחבילות שנרכשו</li>
                <li>• תזכורות לשדרוג כשהילד גדל</li>
                <li>• טיפים ומדריכים לקנייה חכמה</li>
                <li>• אזור אישי עם מעקב אחר חבילות</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-sm border border-[#F5E6B3] bg-[#FFF9E6] p-8">
          <h2 className="mb-4 text-center text-2xl font-normal text-[#4A4A4A]">חשוב לדעת</h2>
          <div className="mx-auto max-w-3xl space-y-3 text-[#6B6B6B]">
            <p>
              <strong className="text-[#4A4A4A]">
                PETITE DREAMS מספקת חבילות עיצוב דיגיטליות בלבד.
              </strong>{' '}
              אנחנו לא מציעים:
            </p>
            <ul className="mr-6 space-y-2">
              <li>• ליווי אישי או שירותי ייעוץ עיצוב</li>
              <li>• התקנה או עזרה פיזית בהרכבת החדר</li>
              <li>• אחריות על איכות המוצרים שנרכשים מהספקים</li>
              <li>• טיפול בבעיות משלוח או החלפות מול ספקים</li>
            </ul>
            <p className="mt-4">
              התפקיד שלנו הוא לספק לך את כל המידע והכלים שתצטרכי כדי ליצור את החדר המושלם בעצמך.
              את אחראית על רכישת המוצרים והתקנתם.
            </p>
          </div>
        </div>

        <div className="rounded-sm bg-gradient-to-br from-[#C8B6A6] to-[#B5A99A] p-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-light">מוכנה להתחיל?</h2>
          <p className="mb-8 text-xl opacity-90">צרי את חדר החלומות של הילד שלך תוך דקות</p>
          <Link
            to="/questionnaire"
            className="inline-block rounded-sm bg-white px-8 py-4 text-lg font-normal text-[#C8B6A6] shadow-sm transition-colors hover:bg-[#F9F7F4]"
          >
            התחילי עכשיו
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
