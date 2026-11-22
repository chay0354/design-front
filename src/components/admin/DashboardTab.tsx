import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { downloadFile } from '../../utils/backend'
import { BarList, ColumnChart, LoadingState, StatCard, cardClass, inputClass, secondaryButton, shekel, toDateInput, useAdminData } from './shared'

type Entry = { name: string; count: number }

interface Stats {
  from: string
  to: string
  sales: {
    totalPurchases: number
    packageOrders: number
    voucherOrders: number
    uniqueBuyers: number
    revenue: number
    voucherRevenue: number
    averageOrder: number
    packagesSold: number
    firstPackagePurchases: number
    upgradePurchases: number
    multiRoomOrders: number
    siblingDiscountOrders: number
    couponOrders: number
    voucherRedemptionOrders: number
    newPackageRevenue: number
    upgradeRevenue: number
    topPackages: Entry[]
    byTheme: Entry[]
    byColor: Entry[]
  }
  children: {
    childrenEntered: number
    childrenPurchased: number
    byAge: Record<string, number>
    byAgeBucket: Entry[]
    byGender: Record<string, number>
    themesByAgeGroup: Record<string, Entry[]>
    themesByGender: Record<string, Entry[]>
    purchasedByAgeBucket: Entry[]
    crossAgeRooms: number
  }
  rooms: {
    roomsPurchased: number
    sharedRooms: number
    familiesMultipleRooms: number
    returningCustomers: number
    upgradesForExistingRooms: number
    archivedPackages: number
  }
  questionnaire: {
    started: number
    completed: number
    reachedCart: number
    purchased: number
    conversionRate: number
    dropOffSteps: Entry[]
  }
  series: { key: string; orders: number; revenue: number; packages: number }[]
  previous: null | {
    sales: Stats['sales']
    rooms: Stats['rooms']
    questionnaire: Stats['questionnaire']
    children: { childrenEntered: number; childrenPurchased: number }
  }
}

const presets = [
  { days: 7, label: '7 ימים' },
  { days: 30, label: '30 ימים' },
  { days: 90, label: '3 חודשים' },
  { days: 365, label: 'שנה' },
]

const genderLabel: Record<string, string> = { boy: 'בנים', girl: 'בנות', unisex: 'ניטרלי', unknown: 'לא צוין' }
const stepLabel: Record<string, string> = {
  rooms: 'מספר חדרים ושמות',
  child: 'פרטי ילד',
  'design-gender': 'סוג העיצוב',
  'design-age': 'בחירת גיל לחדר משותף',
  theme: 'נושא',
  color: 'סקלת צבעים',
  wall: 'עיצוב קיר',
}

export function DashboardTab({ onShowOrders }: { onShowOrders: (filter: { from: string; to: string; label: string }) => void }) {
  const [to, setTo] = useState(toDateInput(new Date()))
  const [from, setFrom] = useState(toDateInput(new Date(Date.now() - 29 * 86400000)))
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [compare, setCompare] = useState(true)
  const [metric, setMetric] = useState<'revenue' | 'orders' | 'packages'>('revenue')

  const query = useMemo(
    () => new URLSearchParams({ from, to, granularity, compare: String(compare) }).toString(),
    [from, to, granularity, compare],
  )
  const { data, loading, error } = useAdminData<Stats>(`/api/admin/stats?${query}`)
  const prev = compare ? data?.previous : null

  const setPreset = (days: number) => {
    setTo(toDateInput(new Date()))
    setFrom(toDateInput(new Date(Date.now() - (days - 1) * 86400000)))
    setGranularity(days > 120 ? 'month' : days > 31 ? 'week' : 'day')
  }

  const drill = (label: string) => onShowOrders({ from, to, label: `${label} · ${from} – ${to}` })
  const money = (v: number) => shekel(v)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-1">
          {presets.map((p) => (
            <button key={p.days} type="button" onClick={() => setPreset(p.days)} className="rounded-full bg-[#F3EEE8] px-3 py-1 text-sm text-[#4A4A4A] hover:bg-[#E8DED2]">
              {p.label}
            </button>
          ))}
        </div>
        <label className="text-xs text-[#6B6B6B]">
          מתאריך
          <input type="date" className={`${inputClass} mt-1`} value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="text-xs text-[#6B6B6B]">
          עד תאריך
          <input type="date" className={`${inputClass} mt-1`} value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label className="text-xs text-[#6B6B6B]">
          תצוגה
          <select className={`${inputClass} mt-1`} value={granularity} onChange={(e) => setGranularity(e.target.value as typeof granularity)}>
            <option value="day">יומית</option>
            <option value="week">שבועית</option>
            <option value="month">חודשית</option>
            <option value="year">שנתית</option>
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="accent-[#C8B6A6]" />
          השוואה לתקופה קודמת
        </label>
        <button
          type="button"
          className={secondaryButton}
          onClick={() => downloadFile(`/api/admin/stats.csv?${query}`, `dashboard-${from}-${to}.csv`).catch((e) => alert(e.message))}
        >
          <Download className="h-4 w-4" /> ייצוא לאקסל
        </button>
      </div>

      <LoadingState loading={loading} error={error}>
        {data && (
          <>
            <Section title="מכירות">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard label="רכישות" value={data.sales.totalPurchases} previous={prev?.sales.totalPurchases} onClick={() => drill('רכישות')} />
                <StatCard label="לקוחות רוכשים ייחודיים" value={data.sales.uniqueBuyers} previous={prev?.sales.uniqueBuyers} />
                <StatCard label="הכנסות" value={data.sales.revenue} previous={prev?.sales.revenue} format={money} onClick={() => drill('הכנסות')} />
                <StatCard label="סכום רכישה ממוצע" value={data.sales.averageOrder} previous={prev?.sales.averageOrder} format={money} />
                <StatCard label="חבילות שנרכשו" value={data.sales.packagesSold} previous={prev?.sales.packagesSold} />
                <StatCard label="רכישות של חבילה ראשונה" value={data.sales.firstPackagePurchases} previous={prev?.sales.firstPackagePurchases} />
                <StatCard label="רכישות שדרוג" value={data.sales.upgradePurchases} previous={prev?.sales.upgradePurchases} />
                <StatCard label="הזמנות עם כמה חדרים" value={data.sales.multiRoomOrders} previous={prev?.sales.multiRoomOrders} />
                <StatCard label="הזמנות עם הנחת אחים" value={data.sales.siblingDiscountOrders} previous={prev?.sales.siblingDiscountOrders} />
                <StatCard label="הכנסות מחבילות חדשות" value={data.sales.newPackageRevenue} previous={prev?.sales.newPackageRevenue} format={money} />
                <StatCard label="הכנסות משדרוגים" value={data.sales.upgradeRevenue} previous={prev?.sales.upgradeRevenue} format={money} />
                <StatCard label="שוברי מתנה שנמכרו" value={data.sales.voucherOrders} previous={prev?.sales.voucherOrders} />
              </div>

              <div className={`${cardClass} mt-4`}>
                <div className="mb-3 flex gap-2 text-sm">
                  {(
                    [
                      ['revenue', 'הכנסות'],
                      ['orders', 'רכישות'],
                      ['packages', 'חבילות'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMetric(key)}
                      className={`rounded-full px-3 py-1 ${metric === key ? 'bg-[#3F3A36] text-white' : 'bg-[#F3EEE8]'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <ColumnChart points={data.series} valueKey={metric} format={metric === 'revenue' ? money : String} />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Panel title="החבילות הנמכרות ביותר">
                  <BarList items={data.sales.topPackages} />
                </Panel>
                <Panel title="מכירות לפי נושא">
                  <BarList items={data.sales.byTheme} />
                </Panel>
                <Panel title="מכירות לפי סקלת גוונים">
                  <BarList items={data.sales.byColor} />
                </Panel>
              </div>
            </Section>

            <Section title="ילדים וגילאים" note="ילד וחדר הם שתי יחידות שונות: שני ילדים בחדר משותף = שני ילדים וחדר אחד.">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard label="ילדים שהוזנו בשאלונים" value={data.children.childrenEntered} previous={prev?.children.childrenEntered} />
                <StatCard label="ילדים בחדרים שנרכשו" value={data.children.childrenPurchased} previous={prev?.children.childrenPurchased} />
                <StatCard label="חדרים במסלול חוצה גילאים" value={data.children.crossAgeRooms} />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Panel title="ממלאי שאלון לפי קבוצת גיל">
                  <BarList items={data.children.byAgeBucket} />
                </Panel>
                <Panel title="רוכשים בפועל לפי קבוצת גיל">
                  <BarList items={data.children.purchasedByAgeBucket} />
                </Panel>
                <Panel title="בנים ובנות (לפי השאלון)">
                  <BarList items={Object.entries(data.children.byGender).map(([name, count]) => ({ name: genderLabel[name] || name, count }))} />
                </Panel>
                <Panel title="התפלגות לפי גיל">
                  <BarList
                    items={Object.entries(data.children.byAge)
                      .sort((a, b) => Number(a[0]) - Number(b[0]))
                      .map(([age, count]) => ({ name: `גיל ${age}`, count }))}
                  />
                </Panel>
                <Panel title="נושאים אהובים לפי גיל">
                  <Nested groups={data.children.themesByAgeGroup} labelFor={(k) => (k === 'unknown' ? 'לא ידוע' : `גילאי ${k}`)} />
                </Panel>
                <Panel title="נושאים אהובים לפי מגדר">
                  <Nested groups={data.children.themesByGender} labelFor={(k) => genderLabel[k] || k} />
                </Panel>
              </div>
            </Section>

            <Section title="חדרים ומשפחות">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <StatCard label="חדרים שנרכשו עבורם חבילות" value={data.rooms.roomsPurchased} previous={prev?.rooms.roomsPurchased} />
                <StatCard label="חדרים עם יותר מילד אחד" value={data.rooms.sharedRooms} previous={prev?.rooms.sharedRooms} />
                <StatCard label="משפחות עם כמה חדרים" value={data.rooms.familiesMultipleRooms} previous={prev?.rooms.familiesMultipleRooms} />
                <StatCard label="לקוחות חוזרים" value={data.rooms.returningCustomers} previous={prev?.rooms.returningCustomers} />
                <StatCard label="שדרוגים לחדרים קיימים" value={data.rooms.upgradesForExistingRooms} previous={prev?.rooms.upgradesForExistingRooms} />
                <StatCard label="חבילות שהועברו לארכיון" value={data.rooms.archivedPackages} previous={prev?.rooms.archivedPackages} />
              </div>
            </Section>

            <Section title="שימוש בשאלון">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <StatCard label="התחלות שאלון" value={data.questionnaire.started} previous={prev?.questionnaire.started} />
                <StatCard label="שאלונים שהושלמו" value={data.questionnaire.completed} previous={prev?.questionnaire.completed} />
                <StatCard label="הגיעו לסל" value={data.questionnaire.reachedCart} previous={prev?.questionnaire.reachedCart} />
                <StatCard label="רכישות שהושלמו" value={data.questionnaire.purchased} previous={prev?.questionnaire.purchased} />
                <StatCard label="אחוז המרה" value={data.questionnaire.conversionRate} previous={prev?.questionnaire.conversionRate} format={(v) => `${v}%`} />
              </div>
              <div className="mt-4 max-w-xl">
                <Panel title="שלבים שבהם משתמשים נוטשים">
                  <BarList items={data.questionnaire.dropOffSteps.map((s) => ({ name: stepLabel[s.name] || s.name, count: s.count }))} />
                </Panel>
              </div>
            </Section>
          </>
        )}
      </LoadingState>
    </div>
  )
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-light text-[#4A4A4A]">{title}</h2>
      {note && <p className="mb-2 text-xs text-[#8B8B8B]">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={cardClass}>
      <h3 className="mb-3 text-sm text-[#4A4A4A]">{title}</h3>
      {children}
    </div>
  )
}

function Nested({ groups, labelFor }: { groups: Record<string, Entry[]>; labelFor: (key: string) => string }) {
  const keys = Object.keys(groups).sort()
  if (keys.length === 0) return <p className="text-sm text-[#A39A8F]">אין נתונים</p>
  return (
    <div className="space-y-4">
      {keys.map((key) => (
        <div key={key}>
          <p className="mb-1 text-xs text-[#8B8B8B]">{labelFor(key)}</p>
          <BarList items={groups[key].slice(0, 4)} />
        </div>
      ))}
    </div>
  )
}
