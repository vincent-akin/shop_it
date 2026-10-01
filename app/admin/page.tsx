import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { setOrderStatus } from './actions'
import { naira } from '@/lib/money'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

export default async function Admin() {
  const sb = await requireAdmin()
  const { data: orders } = await sb.from('orders')
    .select('id,order_number,email,status,total_kobo,created_at,shipping_address,order_items(name,quantity)')
    .order('created_at', { ascending: false }).limit(50)
  const { count: low } = await sb.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true).lte('stock', 5)
  const revenue = (orders ?? []).filter((o: any) => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status)).reduce((s: number, o: any) => s + o.total_kobo, 0)
  return (
    <>
      <div className="row"><h1>Admin</h1><Link className="btn sm" href="/admin/products">Manage products</Link></div>
      <section className="trend">
        <div className="card chart"><h2>{orders?.length ?? 0}</h2><small>Recent orders</small></div>
        <div className="card chart"><h2>{naira(revenue)}</h2><small>Confirmed revenue (last 50 orders) · {low ?? 0} products low on stock</small></div>
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
