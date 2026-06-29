export function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#E8DED2] border-t-[#C8B6A6]" />
        <p className="text-[#6B6B6B]">טוען...</p>
      </div>
    </div>
  )
}
