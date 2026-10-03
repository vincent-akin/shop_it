import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { NativeSignIn } from '@/components/NativeSignIn'
import { createClient } from '@/lib/supabase/server'
import { naira } from '@/lib/money'

export default async function Orders() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) {
    if (!((await headers()).get('user-agent') ?? '').includes('ShopItApp')) redirect('/auth/signin')
    return <section className="card p"><h1>My orders</h1><p>Sign in to see your orders.</p><NativeSignIn /></section>
  }
  const { data: orders } = await sb.from('orders')
    .select('order_number,status,total_kobo,created_at,order_items(name,quantity)').order('created_at', { ascending: false })
  return (
    <>
      <h1>My orders</h1>
      {orders?.length ? orders.map((o: any) => (
        <section className="card p" key={o.order_number} style={{ marginBottom: 14 }}>
          <div className="row"><strong>{o.order_number}</strong><span>{o.status}</span></div>
          <small>{new Date(o.created_at).toLocaleDateString('en-NG')}</small>
          <ul>{o.order_items.map((i: any, k: number) => <li key={k}>{i.quantity} × {i.name}</li>)}</ul>
          <strong>{naira(o.total_kobo)}</strong>
        </section>
      )) : <p className="empty">You have no orders yet. Add something to your cart to get started.</p>}
    </>
  )
}
