import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { PageLoading } from '../components/PageLoading'
import { apiFetch } from '../utils/backend'
import { VoucherConfirmation, type PurchasedVoucher } from './GiftVoucherPage'

/** Lets the buyer reopen a voucher they bought (to share it again). */
export function GiftVoucherViewPage() {
  const { voucherId } = useParams()
  const [voucher, setVoucher] = useState<PurchasedVoucher | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    apiFetch<{ voucher: PurchasedVoucher }>(`/api/vouchers/purchased/${voucherId}`)
      .then((data) => setVoucher(data.voucher))
      .catch(() => setError(true))
  }, [voucherId])

  if (!voucher && !error) return <PageLoading />

  return (
    <div className="min-h-screen bg-[#F7F4EF]">
      <Header />
      {voucher ? (
        <VoucherConfirmation voucher={voucher} />
      ) : (
        <p className="py-24 text-center text-[#6F6A64]">לא מצאנו את השובר הזה בחשבון שלך.</p>
      )}
      <Footer />
    </div>
  )
}
