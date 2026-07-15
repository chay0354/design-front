import { useEffect, useMemo, useState } from 'react'
import { Download, ExternalLink, ImageIcon, Loader2, Upload } from 'lucide-react'
import { Header } from '../components/Header'
import { useData } from '../contexts/DataContext'
import { buildCollageCanvas, canvasToBlob } from '../utils/collage'
import { getCollageApiOverride, setCollageApiOverride } from '../utils/api'
import {
  COLLAGE_BOOKMARKLET,
  fetchProductImageUrl,
  parseProductEntries,
  proxyImageUrl,
  type ProductImageResult,
} from '../utils/productImage'

const inputClass =
  'w-full rounded-sm border border-[#E8DED2] bg-white px-3 py-2 text-sm text-[#4A4A4A] outline-none focus:border-[#C8B6A6]'

export function AdminCollagePage() {
  const { uploadImage } = useData()
  const [linksText, setLinksText] = useState('')
  const [apiOverride, setApiOverride] = useState('')
  const [columns, setColumns] = useState(4)
  const [cellSize, setCellSize] = useState(240)
  const [results, setResults] = useState<ProductImageResult[]>([])
  const [collageUrl, setCollageUrl] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [building, setBuilding] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const entries = useMemo(() => parseProductEntries(linksText), [linksText])
  const successfulImages = results.filter((item) => item.imageUrl)

  useEffect(() => {
    setApiOverride(getCollageApiOverride())
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const payload = event.data as {
        type?: string
        source?: string
        imageUrl?: string
      }
      if (payload?.type !== 'petite-collage-image' || !payload.imageUrl || !payload.source) return

      setResults((current) => {
        const index = current.findIndex((item) => item.sourceUrl === payload.source)
        if (index === -1) return current
        const next = [...current]
        next[index] = {
          ...next[index],
          imageUrl: payload.imageUrl!,
          error: undefined,
        }
        return next
      })
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleSaveApiOverride = () => {
    setCollageApiOverride(apiOverride)
    setError(null)
    alert('Backend override saved. Reload the page before fetching images again.')
  }

  const handleFetchImages = async () => {
    if (entries.length === 0) {
      setError('הדביקו לפחות קישור מוצר אחד או כתובת תמונה מ-alicdn.com')
      return
    }

    setFetching(true)
    setError(null)
    setCollageUrl(null)
    setResults([])

    const nextResults: ProductImageResult[] = []
    for (const entry of entries) {
      const result = await fetchProductImageUrl(entry.url)
      nextResults.push(result)
      setResults([...nextResults])
    }

    setFetching(false)

    if (!nextResults.some((item) => item.imageUrl)) {
      setError(
        'AliExpress חוסם שליפה אוטומטית מהשרת בפרודקשן. אפשרויות: 1) להגדיר SCRAPINGBEE_API_KEY ב-Vercel של design-back, 2) להריץ back מקומית ולהדביק כאן ngrok/local URL, 3) להדביק ישירות קישורי alicdn.com, 4) לפתוח מוצרים ולהשתמש בסימניה.',
      )
    }
  }

  const handleOpenProducts = () => {
    for (const entry of entries) {
      if (entry.kind === 'product') {
        window.open(entry.url, '_blank', 'noopener,noreferrer')
      }
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
            הדביקו קישורי מוצרים מ-AliExpress, או ישירות כתובות תמונה מ-alicdn.com.
            בפרודקשן AliExpress חוסם שליפה מהשרת — אפשר להשתמש ב-backend מקומי/ngrok,
            ב-ScrapingBee, או בסימניה לשליפה מהדפדפן.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-4">
            <label className="mb-2 block text-sm text-[#6B6B6B]">
              Backend override לשליפת תמונות (אופציונלי)
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                value={apiOverride}
                onChange={(e) => setApiOverride(e.target.value)}
                placeholder="https://xxxx.ngrok-free.app or http://localhost:3001"
                dir="ltr"
                className={`${inputClass} text-left`}
              />
              <button
                type="button"
                onClick={handleSaveApiOverride}
                className="rounded-sm border border-[#C8B6A6] px-4 py-2 text-sm text-[#4A4A4A] hover:bg-white"
              >
                שמור
              </button>
            </div>
            <p className="mt-2 text-xs text-[#8B8B8B]">
              אם זה עובד לכם locally, הריצו `npm run dev` בתיקיית back ושימו כאן ngrok URL.
              אחרי שמירה — רענון עמוד.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#6B6B6B]">קישורי מוצרים / תמונות</label>
            <textarea
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              rows={10}
              dir="ltr"
              placeholder={'https://a.aliexpress.com/_c4cWHbe9\nhttps://ae01.alicdn.com/kf/....jpg'}
              className={`${inputClass} font-mono text-left`}
            />
            <p className="mt-2 text-sm text-[#8B8B8B]">{entries.length} פריטים</p>
          </div>

          <div className="rounded-sm border border-[#E8DED2] p-4 text-sm text-[#6B6B6B]">
            <p className="mb-2">אם השליפה האוטומטית נכשלת:</p>
            <ol className="list-decimal space-y-1 pr-5">
              <li>גררו את הסימניה הזו לסרגל המועדפים:</li>
            </ol>
            <a
              href={COLLAGE_BOOKMARKLET}
              className="mt-2 inline-block rounded-sm bg-[#4A4A4A] px-3 py-2 text-xs text-white"
            >
              Petite Collage Image
            </a>
            <p className="mt-2">
              פתחו כל מוצר, לחצו על הסימניה, והתמונה תחזור לכאן אוטומטית.
            </p>
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
              disabled={fetching || entries.length === 0}
              className="flex items-center gap-2 rounded-sm bg-[#C8B6A6] px-5 py-2.5 text-white transition-colors hover:bg-[#B5A99A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              משוך תמונות
            </button>

            <button
              type="button"
              onClick={handleOpenProducts}
              disabled={entries.every((entry) => entry.kind !== 'product')}
              className="flex items-center gap-2 rounded-sm border border-[#E8DED2] px-5 py-2.5 text-[#4A4A4A] transition-colors hover:bg-[#F9F7F4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ExternalLink className="h-4 w-4" />
              פתח מוצרים
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
                        src={proxyImageUrl(item.imageUrl)}
                        alt=""
                        className="aspect-square w-full rounded-sm object-cover"
                      />
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-[#A05A5A]">{item.error ?? 'לא נמצאה תמונה'}</p>
                        {item.productUrl && (
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#6B6B6B] hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            פתח מוצר
                          </a>
                        )}
                      </div>
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
