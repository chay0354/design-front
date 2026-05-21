import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

type PlaceholderPageProps = {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FDFCFB]">
      <Header />
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="mb-4 text-2xl font-light text-[#4A4A4A]">{title}</h1>
        <p className="mb-8 text-[#6B6B6B]">עמוד זה יתווסף בקרוב.</p>
        <Link
          to="/"
          className="rounded-md bg-[#C8B6A6] px-6 py-3 text-white transition-colors hover:bg-[#B5A99A]"
        >
          חזרה לדף הבית
        </Link>
      </main>
      <Footer />
    </div>
  )
}
