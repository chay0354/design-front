import { Sparkle } from '../components/BrushTitle'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F7F3EE] text-[#3B302A]">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="grid items-center gap-8 rounded-[32px] bg-[#F3ECE5] p-4 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12 lg:p-6">
          <div className="order-2 px-2 pb-4 text-center lg:order-1 lg:px-4 lg:pb-0">
            <p className="text-[15px] tracking-[0.18em] text-[#4A403A]">PETITE DREAMS</p>
            <h1 className="mt-3 text-[1.6rem] font-medium leading-[1.35] text-[#3B302A] sm:text-[2rem] lg:whitespace-nowrap">
              עיצוב חדרי ילדים עם חשיבה גדולה
              <br />
              על הקטנים.
            </h1>

            <div className="mx-auto mt-4 flex max-w-[220px] items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-[#D9CBBE]" />
              <Sparkle className="h-3.5 w-3.5 text-[#B49A84]" />
              <span className="h-px flex-1 bg-[#D9CBBE]" />
            </div>

            <p className="mx-auto mt-5 max-w-md text-[15px] leading-8 text-[#3C3631] sm:text-base">
              סטודיו לעיצוב חדרי ילדים, שמביא את הידע, הניסיון והאהבה לעיצוב פנים – אל תוך פתרון פשוט, נגיש ומעורר
              השראה.
            </p>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-8 text-[#3C3631] sm:text-base">
              מאחורי הסטודיו ניסיון של למעלה מ-15 שנה בעיצוב חללים, עם רקע אקדמי בעיצוב באיטליה וצוות שחי את הפרטים
              הקטנים שהופכים חדר לסביבה נעימה, מעצבת ומלאת דמיון.
            </p>

            <div className="relative mx-auto mt-8 inline-block px-10 py-3">
              <img
                src="/assets/title-brush.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 h-[95%] w-[115%] max-w-none -translate-x-1/2 -translate-y-1/2 select-none opacity-50"
              />
              <p
                className="relative text-[1.9rem] leading-[1.25] text-[#3B302A] sm:text-[2.2rem]"
                style={{ fontFamily: "'Amatic SC', cursive" }}
              >
                כל המחשבה מאחורי חדר מעוצב.
                <br />
                כל הקסם, בלי כל המאמץ.
              </p>
            </div>
          </div>

          <img
            src="/assets/about-hero.jpg"
            alt="חדר ילדים מעוצב בגוונים חמים"
            className="order-1 aspect-[4/3] w-full rounded-[24px] object-cover lg:order-2 lg:aspect-auto lg:h-[440px]"
          />
        </section>
      </main>

      <Footer />
    </div>
  )
}
