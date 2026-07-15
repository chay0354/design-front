import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { buildCollageShareUrl, getCollageImageUrl, isCollageId } from '../utils/collageShare'

export function CollageViewPage() {
  const { collageId = '' } = useParams()
  const [failed, setFailed] = useState(false)

  if (!isCollageId(collageId)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFCFB] px-4 text-center text-[#4A4A4A]">
        <p className="mb-4 text-lg">קישור הקולאז אינו תקין</p>
        <Link to="/" className="text-[#8B7340] hover:underline">
          חזרה לדף הבית
        </Link>
      </div>
    )
  }

  const imageUrl = getCollageImageUrl(collageId)
  const shareUrl = buildCollageShareUrl(collageId)

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-light text-[#4A4A4A]">קולאז מוצרים</h1>
          <p className="text-sm text-[#8B8B8B]" dir="ltr">
            {shareUrl}
          </p>
        </div>

        {failed ? (
          <div className="rounded-sm border border-[#E8DED2] bg-white p-8 text-center text-[#6B6B6B]">
            <p className="mb-4">הקולאז לא נמצא. ייתכן שהקישור שגוי או שהקובץ נמחק.</p>
            <Link to="/" className="text-[#8B7340] hover:underline">
              חזרה לדף הבית
            </Link>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt="Product collage"
            className="mx-auto max-w-full rounded-sm border border-[#E8DED2] shadow-sm"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  )
}
