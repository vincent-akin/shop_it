import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { setOrderStatus } from './actions'
import { AdminTabs } from '@/components/AdminTabs'
import { naira } from '@/lib/money'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

export default async function Admin() {
  const sb = await requireAdmin()
  const { data: orders } = await sb.from('orders')
    .select('id,order_number,email,status,total_kobo,created_at,shipping_address,order_items(name,quantity)')
    .order('created_at', { ascending: false }).limit(50)
  const { count: low } = await sb.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true).lte('stock', 5)
  const since = new Date(Date.now() - 7 * 864e5).toISOString()
  const { data: sold } = await sb.from('order_items').select('name,quantity,orders!inner(created_at,status)')
    .gte('orders.created_at', since).in('orders.status', ['paid', 'processing', 'shipped', 'delivered'])
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], byDay = days.map(() => 0), byName = new Map<string, number>()
  for (const r of (sold ?? []) as any[]) {
    byDay[(new Date(r.orders.created_at).getDay() + 6) % 7] += r.quantity
    byName.set(r.name, (byName.get(r.name) ?? 0) + r.quantity)
  }
  const max = Math.max(...byDay), total = byDay.reduce((a, b) => a + b, 0)
  const top = [...byName.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  const revenue = (orders ?? []).filter((o: any) => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status)).reduce((s: number, o: any) => s + o.total_kobo, 0)
  return (
    <>
      <h1>Admin</h1>
      <AdminTabs on="orders" />
      <section className="trend">
        <div className="card chart"><h2>{orders?.length ?? 0}</h2><small>Recent orders</small></div>
        <div className="card chart"><h2>{naira(revenue)}</h2><small>Confirmed revenue (last 50 orders) · {low ?? 0} products low on stock</small></div>
      </section>
      <section className="trend">
        <div className="card chart"><h2>Items sold</h2><small>{total} in the last 7 days</small>
          <div className="bars">{days.map((d, i) => <div key={d} className={max && byDay[i] === max ? 'hi' : ''}><i style={{ height: `${max ? Math.max(6, (byDay[i] / max) * 100) : 6}%` }} />{d}</div>)}</div>
        </div>
        <div className="card tops">{top.length ? top.map(([n, q]) => (
          <div className="tp" key={n}><div className="t" style={{ ['--h' as any]: 12 }} aria-hidden="true">🛍️</div><div><b>{n}</b><small>{q} sold</small></div><span /></div>
        )) : <p className="empty">No sales in the last 7 days.</p>}</div>
      </section>
      {orders?.length ? orders.map((o: any) => (
        <section className="card p" key={o.id} style={{ marginBottom: 12 }}>
          <div className="row"><strong>{o.order_number}</strong><strong>{naira(o.total_kobo)}</strong></div>
          <small>{o.email} · {o.shipping_address?.name}, {o.shipping_address?.phone} · {o.shipping_address?.line1}, {o.shipping_address?.city}</small>
          <small>{o.order_items.map((i: any) => `${i.quantity} × ${i.name}`).join(', ')}</small>
          <form action={setOrderStatus} className="row">
            <input type="hidden" name="id" value={o.id} />
            <select name="status" defaultValue={o.status} aria-label="Order status">{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
            <button className="btn sm">Update status</button>
          </form>
        </section>
      )) : <p className="empty">No orders yet. New orders appear here as customers check out.</p>}
    </>
  )
}
