import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F7F3F0]">
      <Header />
      <img
        src="/assets/about-screen.jpg"
        alt="אודות PETITE DREAMS"
        className="mx-auto block w-full max-w-[1242px]"
      />
      <Footer />
    </div>
  )
}
