import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { BrushTitle } from '../components/BrushTitle'
import { PageLoading } from '../components/PageLoading'
import { DEFAULT_APPLICATION_GUIDES, useApplicationGuides } from '../utils/guideVideos'

/** One application guide from the personal-area toolbox (text edited in the admin). */
export function GuidePage() {
  const { guideId } = useParams()
  const edited = useApplicationGuides()
  if (edited === undefined) return <PageLoading />
  const guides = edited ?? DEFAULT_APPLICATION_GUIDES
  const guide = guides.find((g) => g.id === guideId)

  if (!guide) return <Navigate to="/account" replace />
  if (!guide.body.trim()) return <Navigate to="/tips" replace />

  const blocks = guide.body.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean)

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFCFB]">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <Link to="/account" className="mb-6 inline-flex items-center gap-1 text-sm text-[#8A7A6B] hover:underline">
          חזרה לחדרים שלי
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <BrushTitle as="h1">{guide.title}</BrushTitle>
        {guide.subtitle && <p className="mt-3 text-center text-[#6B6B6B]">{guide.subtitle}</p>}
        <article className="mt-8 space-y-4 text-[15px] leading-7 text-[#3C3834]">
          {blocks.map((block, index) => {
            const lines = block.split('\n')
            if (lines.every((line) => line.trim().startsWith('- '))) {
              return (
                <ul key={index} className="list-disc space-y-1 pr-5">
                  {lines.map((line, i) => (
                    <li key={i}>{line.trim().slice(2)}</li>
                  ))}
                </ul>
              )
            }
            return (
              <p key={index} className="whitespace-pre-line">
                {block}
              </p>
            )
          })}
        </article>
      </main>
      <Footer />
    </div>
  )
}
