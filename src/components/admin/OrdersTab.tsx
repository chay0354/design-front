import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Download, X } from 'lucide-react'
import { apiFetch, downloadFile } from '../../utils/backend'
import { Badge, LoadingState, cardClass, formatDate, inputClass, secondaryButton, shekel, toDateInput, useAdminData } from './shared'

export interface OrdersFilter {
  influencerId?: string
  couponId?: string
  from?: string
  to?: string
  label?: string
}

interface OrderItem {
  id: string
  package_name: string
  theme: string
  color_preference: string
  children: { name: string; age: number }[]
  list_price: number
  price: number
  discount_type: string
  is_upgrade: boolean
  archived_at: string | null
}

interface Order {
  id: string
  order_number: number
  created_at: string
  email: string
  kind: 'packages' | 'gift_voucher'
  status: 'paid' | 'cancelled' | 'refunded' | 'pending'
  subtotal: number
  discount_total: number
  total: number
  coupon_code: string
  attribution: string
  influencer?: { name: string } | null
  commission_amount: number
  voucher_packages_used: number
  payment_provider: string
  items: OrderItem[]
}

const statusTone = { paid: 'ok', cancelled: 'bad', refunded: 'warn', pending: 'neutral' } as const
const statusLabel = { paid: 'שולם', cancelled: 'בוטל', refunded: 'הוחזר', pending: 'ממתין' }
const discountLabel: Record<string, string> = {
  sibling: 'הנחת חדר נוסף',
  upgrade: 'הנחת עיצוב מחדש',
  coupon: 'קופון',
  voucher: 'שובר מתנה',
}

export function OrdersTab({ filter, onClearFilter }: { filter: OrdersFilter; onClearFilter: () => void }) {
  const [from, setFrom] = useState(filter.from || toDateInput(new Date(Date.now() - 90 * 86400000)))
  const [to, setTo] = useState(filter.to || toDateInput(new Date()))
  const [kind, setKind] = useState('')
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const query = useMemo(() => {
    const params = new URLSearchParams({ from, to })
    if (kind) params.set('kind', kind)
    if (status) params.set('status', status)
    if (filter.influencerId) params.set('influencerId', filter.influencerId)
    if (filter.couponId) params.set('couponId', filter.couponId)
    return params.toString()
  }, [from, to, kind, status, filter.influencerId, filter.couponId])

  const { data, loading, error, reload } = useAdminData<{ orders: Order[] }>(`/api/admin/orders?${query}`)

  const changeStatus = async (order: Order, next: 'cancelled' | 'refunded' | 'paid') => {
    const verb = next === 'cancelled' ? 'לבטל' : next === 'refunded' ? 'לסמן כהחזר' : 'להחזיר לסטטוס שולם'
    if (!confirm(`${verb} את הזמנה ${order.order_number}? ${next !== 'paid' ? 'העמלה והסטטיסטיקה יתעדכנו, וחבילות שמומשו משובר יוחזרו לשובר.' : ''}`)) return
    try {
      await apiFetch(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: { status: next } })
      await reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'העדכון נכשל')
    }
  }

  const orders = data?.orders || []
  const paidTotal = orders.filter((o) => o.status === 'paid').reduce((s, o) => s + Number(o.total), 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-[#6B6B6B]">
          מתאריך
          <input type="date" className={`${inputClass} mt-1`} value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="text-xs text-[#6B6B6B]">
          עד תאריך
          <input type="date" className={`${inputClass} mt-1`} value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label className="text-xs text-[#6B6B6B]">
          סוג
          <select className={`${inputClass} mt-1`} value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">הכל</option>
            <option value="packages">חבילות</option>
            <option value="gift_voucher">שוברי מתנה</option>
          </select>
        </label>
        <label className="text-xs text-[#6B6B6B]">
          סטטוס
          <select className={`${inputClass} mt-1`} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">הכל</option>
            <option value="paid">שולם</option>
            <option value="cancelled">בוטל</option>
            <option value="refunded">הוחזר</option>
          </select>
        </label>
        <button
          type="button"
          className={secondaryButton}
          onClick={() => downloadFile(`/api/admin/orders.csv?${query}`, `orders-${from}-${to}.csv`).catch((e) => alert(e.message))}
        >
          <Download className="h-4 w-4" /> ייצוא לאקסל
        </button>
      </div>

      {filter.label && (
        <p className="flex items-center gap-2 text-sm text-[#4A4A4A]">
          <Badge>{filter.label}</Badge>
          <button type="button" onClick={onClearFilter} aria-label="הסרת הסינון" className="text-[#8B8B8B]">
            <X className="h-4 w-4" />
          </button>
        </p>
      )}

      <LoadingState loading={loading} error={error}>
        <p className="text-sm text-[#6B6B6B]">
          {orders.length} הזמנות · {shekel(paidTotal)} ששולמו
        </p>
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className={`${cardClass} p-0`}>
              <button
                type="button"
                onClick={() => setOpen(open === order.id ? null : order.id)}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 p-4 text-right text-sm"
              >
                <span className="font-medium text-[#3C3834]">#{order.order_number}</span>
                <span className="text-[#8B8B8B]">{formatDate(order.created_at)}</span>
                <span className="truncate">{order.email}</span>
                <Badge tone={statusTone[order.status]}>{statusLabel[order.status]}</Badge>
                {order.kind === 'gift_voucher' ? <Badge>שובר מתנה</Badge> : <span>{order.items.length} חבילות</span>}
                {order.coupon_code && <Badge>{order.coupon_code}</Badge>}
                {order.influencer && <span className="text-xs text-[#8B8B8B]">{order.influencer.name} ({order.attribution === 'coupon' ? 'קוד' : 'קישור'})</span>}
                <span className="ms-auto font-medium">{shekel(order.total)}</span>
                {open === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {open === order.id && (
                <div className="border-t border-[#F1ECE5] p-4 text-sm">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex flex-wrap gap-x-4 gap-y-1 border-b border-[#F7F3EE] py-2 last:border-0">
                      <span className="text-[#3C3834]">{item.package_name || item.theme}</span>
                      <span className="text-[#8B8B8B]">{item.children.map((c) => `${c.name} (${c.age})`).join(', ')}</span>
                      {item.color_preference && <span className="text-[#8B8B8B]">{item.color_preference}</span>}
                      {item.is_upgrade && <Badge tone="warn">שדרוג חדר קיים</Badge>}
                      {item.archived_at && <Badge>בארכיון</Badge>}
                      <span className="ms-auto">
                        {item.discount_type && <span className="me-2 text-xs text-[#7BA05B]">{discountLabel[item.discount_type]}</span>}
                        {shekel(item.price)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B6B6B]">
                    <span>מחירון {shekel(order.subtotal)}</span>
                    <span>הנחה {shekel(order.discount_total)}</span>
                    {order.voucher_packages_used > 0 && <span>{order.voucher_packages_used} חבילות משובר</span>}
                    {Number(order.commission_amount) > 0 && <span>עמלה {shekel(order.commission_amount)}</span>}
                    <span>תשלום: {order.payment_provider}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {order.status === 'paid' ? (
                      <>
                        <button type="button" className={secondaryButton} onClick={() => changeStatus(order, 'cancelled')}>
                          ביטול הזמנה
                        </button>
                        <button type="button" className={secondaryButton} onClick={() => changeStatus(order, 'refunded')}>
                          סימון החזר כספי
                        </button>
                      </>
                    ) : (
                      <button type="button" className={secondaryButton} onClick={() => changeStatus(order, 'paid')}>
                        החזרה לסטטוס שולם
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </LoadingState>
    </div>
  )
}
