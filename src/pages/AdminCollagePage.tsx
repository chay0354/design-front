import { useMemo, useState } from 'react'
import { Download, ImageIcon, Loader2, Upload } from 'lucide-react'
import { Header } from '../components/Header'
import { useData } from '../contexts/DataContext'
import { buildCollageCanvas, canvasToBlob } from '../utils/collage'
import {
  fetchProductImageUrl,
  parseProductLinks,
  type ProductImageResult,
} from '../utils/productImage'

const inputClass =
  'w-full rounded-sm border border-[#E8DED2] bg-white px-3 py-2 text-sm text-[#4A4A4A] outline-none focus:border-[#C8B6A6]'

export function AdminCollagePage() {
  const { uploadImage } = useData()
  const [linksText, setLinksText] = useState('')
  const [columns, setColumns] = useState(4)
  const [cellSize, setCellSize] = useState(240)
  const [results, setResults] = useState<ProductImageResult[]>([])
  const [collageUrl, setCollageUrl] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [building, setBuilding] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const links = useMemo(() => parseProductLinks(linksText), [linksText])
  const successfulImages = results.filter((item) => item.imageUrl)

  const handleFetchImages = async () => {
    if (links.length === 0) {
      setError('הדביקו לפחות קישור מוצר אחד')
      return
    }

    setFetching(true)
    setError(null)
    setCollageUrl(null)
    setResults([])

    const nextResults: ProductImageResult[] = []
    for (const link of links) {
      const result = await fetchProductImageUrl(link)
      nextResults.push(result)
      setResults([...nextResults])
    }

    setFetching(false)

    if (!nextResults.some((item) => item.imageUrl)) {
      setError('לא הצלחנו למשוך תמונות מהקישורים. בדקו שהקישורים תקינים.')
    }
  }

  const handleBuildCollage = async () => {
    const imageUrls = successfulImages.map((item) => item.imageUrl!).filter(Boolean)
    if (imageUrls.length === 0) {
      setError('אין תמונות זמינות לקולאז')
      return
    }

    setBuilding(true)
    setError(null)

    try {
      if (collageUrl) {
        URL.revokeObjectURL(collageUrl)
      }

      const canvas = await buildCollageCanvas(imageUrls, {
        columns,
        cellSize,
        gap: 8,
        background: '#FFFFFF',
      })
      const blob = await canvasToBlob(canvas)
      setCollageUrl(URL.createObjectURL(blob))
    } catch {
      setError('יצירת הקולאז נכשלה')
    } finally {
      setBuilding(false)
    }
  }

  const handleDownload = () => {
    if (!collageUrl) return
    const anchor = document.createElement('a')
    anchor.href = collageUrl
    anchor.download = `collage-${Date.now()}.png`
    anchor.click()
  }

  const handleUpload = async () => {
    if (!collageUrl) return

    setUploading(true)
    setError(null)

    try {
      const response = await fetch(collageUrl)
      const blob = await response.blob()
      const file = new File([blob], `collage-${Date.now()}.png`, { type: 'image/png' })
      const url = await uploadImage(file, 'package-gallery')
      await navigator.clipboard.writeText(url)
      alert('הקולאז הועלה בהצלחה. הקישור הועתק ללוח.')
    } catch {
      setError('העלאת הקולאז נכשלה')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-light text-[#4A4A4A]">צור קולאז</h1>
          <p className="text-[#6B6B6B]">
            הדביקו קישורי מוצרים — אפשר גם להדביק ישירות את טקסט השיתוף מ-AliExpress
            (&quot;I just found this on AliExpress...&quot;). המערכת תזהה את הקישורים
            ותמשוך את תמונות המוצר (og:image).
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm text-[#6B6B6B]">קישורי מוצרים</label>
            <textarea
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              rows={10}
              dir="ltr"
              placeholder="הדביקו כאן קישורים או טקסט שיתוף מ-AliExpress&#10;https://a.aliexpress.com/_c4cWHbe9"
              className={`${inputClass} font-mono text-left`}
            />
            <p className="mt-2 text-sm text-[#8B8B8B]">{links.length} קישורים</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-[#6B6B6B]">עמודות</label>
              <input
                type="number"
                min={1}
                max={8}
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value) || 1)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#6B6B6B]">גודל תא (px)</label>
              <input
                type="number"
                min={80}
                max={600}
                step={20}
                value={cellSize}
                onChange={(e) => setCellSize(Number(e.target.value) || 240)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleFetchImages}
              disabled={fetching || links.length === 0}
              className="flex items-center gap-2 rounded-sm bg-[#C8B6A6] px-5 py-2.5 text-white transition-colors hover:bg-[#B5A99A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              משוך תמונות
            </button>

            <button
              type="button"
              onClick={handleBuildCollage}
              disabled={building || successfulImages.length === 0}
              className="flex items-center gap-2 rounded-sm border border-[#C8B6A6] px-5 py-2.5 text-[#4A4A4A] transition-colors hover:bg-[#F9F7F4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              צור קולאז
            </button>

            {collageUrl && (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-sm border border-[#E8DED2] px-5 py-2.5 text-[#4A4A4A] transition-colors hover:bg-[#F9F7F4]"
                >
                  <Download className="h-4 w-4" />
                  הורד PNG
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-sm border border-[#E8DED2] px-5 py-2.5 text-[#4A4A4A] transition-colors hover:bg-[#F9F7F4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  העלה לענן
                </button>
              </>
            )}
          </div>

          {error && <p className="text-sm text-[#A05A5A]">{error}</p>}

          {results.length > 0 && (
            <div className="rounded-sm border border-[#E8DED2] p-4">
              <h2 className="mb-3 text-lg font-light text-[#4A4A4A]">
                תמונות שנמשכו ({successfulImages.length}/{results.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((item) => (
                  <div key={item.sourceUrl} className="rounded-sm bg-[#F9F7F4] p-3">
                    <p className="mb-2 truncate text-xs text-[#8B8B8B]" dir="ltr" title={item.sourceUrl}>
                      {item.sourceUrl}
                    </p>
                    {item.imageUrl ? (
                      <img
                        src={`/api/image-proxy?url=${encodeURIComponent(item.imageUrl)}`}
                        alt=""
                        className="aspect-square w-full rounded-sm object-cover"
                      />
                    ) : (
                      <p className="text-sm text-[#A05A5A]">{item.error ?? 'לא נמצאה תמונה'}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {collageUrl && (
            <div className="rounded-sm border border-[#E8DED2] p-4">
              <h2 className="mb-3 text-lg font-light text-[#4A4A4A]">תצוגה מקדימה</h2>
              <img src={collageUrl} alt="Collage preview" className="max-w-full rounded-sm border border-[#E8DED2]" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
