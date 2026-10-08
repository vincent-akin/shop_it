import { requireAdmin } from '@/lib/admin'
import { AdminTabs } from '@/components/AdminTabs'
import { naira } from '@/lib/money'

export default async function Customers() {
  const sb = await requireAdmin()
  const { data: people } = await sb.from('profiles').select('id,email,full_name,phone,avatar_url,role,created_at').order('created_at', { ascending: false }).limit(100)
  const { data: orders } = await sb.from('orders').select('user_id,total_kobo,status').not('user_id', 'is', null).limit(2000)
  const stats = new Map<string, { n: number; spent: number }>()
  for (const o of orders ?? []) {
    const s = stats.get(o.user_id) ?? { n: 0, spent: 0 }
    s.n++
    if (['paid', 'processing', 'shipped', 'delivered'].includes(o.status)) s.spent += o.total_kobo
    stats.set(o.user_id, s)
  }
  return (
    <>
      <h1>Customers</h1>
      <AdminTabs on="customers" />
      {people?.map((p: any) => {
        const s = stats.get(p.id)
        return (
          <section className="card p" key={p.id} style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {p.avatar_url ? <img className="av" src={p.avatar_url} alt="" style={{ objectFit: 'cover' }} /> : <span className="av" aria-hidden="true">👤</span>}
            <div style={{ flex: 1, minWidth: 0 }}><b>{p.full_name || p.email}</b>{p.role === 'admin' && ' · admin'}<br /><small>{p.email}{p.phone ? ` · ${p.phone}` : ''}</small></div>
            <div style={{ textAlign: 'right' }}><strong>{s?.n ?? 0} orders</strong><br /><small>{naira(s?.spent ?? 0)}</small></div>
          </section>
        )
      })}
    </>
  )
}
