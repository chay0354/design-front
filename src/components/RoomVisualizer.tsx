import { useRef, useState } from 'react'
import { Camera, CloudUpload, Download, Info, Loader2, RefreshCw, WandSparkles } from 'lucide-react'
import { apiFetch } from '../utils/backend'

const MAX_SIDE = 1600

/** Downscales the photo to a JPEG data URL small enough for the API (Vercel caps request bodies at 4.5MB). */
function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('canvas'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('decode'))
    }
    img.src = url
  })
}

type Props = {
  packageId: string
  packageImage: string
  roomKey?: string
  cardClassName: string
}

export function RoomVisualizer({ packageId, packageImage, roomKey = '', cardClassName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const pickPhoto = () => inputRef.current?.click()

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setError('')
    try {
      setPhoto(await compressPhoto(file))
      setResult(null)
    } catch {
      setError('לא הצלחנו לקרוא את התמונה. נסו תמונה אחרת (JPG או PNG).')
    }
  }

  const loadLatest = async (since?: string) => {
    const params = new URLSearchParams({ packageId, ...(roomKey ? { roomKey } : {}), ...(since ? { since } : {}) })
    const data = await apiFetch<{ visualization: { imageUrl: string } | null }>(
      `/api/rooms/visualizations/latest?${params}`,
    )
    return data.visualization?.imageUrl ?? null
  }

  const generate = async () => {
    if (!photo) return
    setGenerating(true)
    setError('')
    const startedAt = new Date().toISOString()
    try {
      const data = await apiFetch<{ imageUrl: string }>('/api/rooms/visualize', {
        body: { packageId, packageImageUrl: packageImage, roomKey, image: photo },
      })
      setResult(data.imageUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      const dropped = /load failed|failed to fetch|networkerror|החיבור/i.test(message)
      if (dropped) {
        for (let attempt = 0; attempt < 4; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 3000))
          try {
            const saved = await loadLatest(startedAt)
            if (saved) {
              setResult(saved)
              return
            }
          } catch {
            // The result request can fail while the image is still being saved.
          }
        }
      }
      if (dropped && Date.now() - Date.parse(startedAt) > 20000) {
        setError('החיבור נותק לפני שהתמונה חזרה. נסו שוב.')
      } else {
        setError(message && !dropped ? message : 'לא הצלחנו ליצור את ההדמיה, נסו שוב')
      }
    } finally {
      setGenerating(false)
    }
  }

  const reset = () => {
    setPhoto(null)
    setResult(null)
    setError('')
    pickPhoto()
  }

  return (
    <section className={`${cardClassName.replace('bg-white', '')} bg-[#FCF8F4] px-4 py-5 sm:px-6`}>
      <div className="text-center">
        <h2 className="flex items-center justify-center gap-2 text-xl font-semibold text-[#3B302A]">
          ראו את החדר שלכם מתעורר לחיים
          <WandSparkles className="h-5 w-5 text-[#A27A5C]" strokeWidth={1.5} />
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-6 text-[#5F554C]">
          העלו תמונה של החדר שלכם וגלו איך העיצוב שבחרתם יכול להשתלב בו בעזרת בינה מלאכותית.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void onFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {result ? (
        <div className="mt-4">
          <img
            src={result}
            alt="הדמיית החדר עם חבילת העיצוב"
            className="max-h-[70vh] w-full rounded-2xl object-contain"
          />
          <div className="mt-3 flex flex-wrap justify-center gap-2.5">
            <a
              href={`${result}${result.includes('?') ? '&' : '?'}download=petite-dreams-room.png`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#9C7458] px-5 py-2 text-[13px] text-white hover:opacity-90"
            >
              <Download className="h-4 w-4" strokeWidth={1.6} />
              שמירת ההדמיה
            </a>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#D9C6B5] bg-white px-5 py-2 text-[13px] text-[#5F4B3B] hover:bg-[#FBF6F1]"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.6} />
              הדמיה עם תמונה אחרת
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#F0E6DC] bg-white px-4 py-3">
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[14px] font-semibold text-[#3B302A]">טיפ לצילום מוצלח:</p>
              <p className="text-[12px] leading-5 text-[#5F554C]">
                מומלץ לצלם מפתח החדר, בזווית רחבה ככל האפשר, כך שיראו כמה שיותר מהקירות, הרהיטים והחלל.
              </p>
            </div>
            <Camera className="h-10 w-10 shrink-0 text-[#5F4B3B]" strokeWidth={1.2} />
          </div>

          <button
            type="button"
            onClick={pickPhoto}
            disabled={generating}
            className="relative mx-auto mt-4 block w-full max-w-sm overflow-hidden rounded-2xl border-[1.5px] border-dashed border-[#C9B4A1] bg-white text-center hover:bg-[#FDFAF7] disabled:cursor-wait"
          >
            {photo ? (
              <>
                <img src={photo} alt="תמונת החדר שהעליתם" className="aspect-[4/3] w-full object-cover" />
                {generating ? (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/75 px-4 text-[13px] text-[#3B302A]">
                    <Loader2 className="h-7 w-7 animate-spin text-[#9C7458]" />
                    מלבישים את חבילת העיצוב על החדר שלכם…
                    <span className="text-[11px] text-[#7A7068]">זה יכול לקחת עד דקה</span>
                  </span>
                ) : (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-2 pt-8 pb-2.5">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] text-[#3B302A]">לחצו להחלפת התמונה</span>
                  </span>
                )}
              </>
            ) : (
              <span className="flex flex-col items-center justify-center gap-2 px-4 py-8">
                <Camera className="h-8 w-8 text-[#5F4B3B]" strokeWidth={1.2} />
                <span className="text-[14px] text-[#3B302A]">העלאת תמונת החדר</span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={photo ? generate : pickPhoto}
            disabled={generating}
            className="mx-auto mt-3 flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-[#9C7458] py-2.5 text-[14px] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : photo ? (
              <WandSparkles className="h-4 w-4" strokeWidth={1.6} />
            ) : (
              <CloudUpload className="h-4 w-4" strokeWidth={1.6} />
            )}
            {generating ? 'יוצרים את ההדמיה…' : photo ? 'יצירת ההדמיה' : 'העלאת תמונה'}
          </button>
        </>
      )}

      {error && <p className="mt-3 text-center text-[13px] text-[#B4532A]">{error}</p>}

      <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-5 text-[#4A4540]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
        <span>
          <strong className="font-semibold">חשוב לדעת:</strong> ההדמיה נוצרת באמצעות בינה מלאכותית ומיועדת להמחשה
          והשראה בלבד. היא מציגה אפשרות לשילוב העיצוב בחדר שלכם, אינה מבטיחה התאמה מדויקת למידות החדר, למיקום
          הרהיטים או לפריטים שבחבילה.
        </span>
      </p>
    </section>
  )
}
