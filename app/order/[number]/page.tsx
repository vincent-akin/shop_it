import { notFound } from 'next/navigation'
import { createClient as admin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { settle } from '@/lib/paystack'
import { naira } from '@/lib/money'

type SP = { t?: string; cancelled?: string; reference?: string; trxref?: string }

export default async function OrderPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<SP> }) {
  const { number } = await params, { t, reference, trxref } = await searchParams
  const db = admin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: o } = await db.from('orders').select('order_number,status,total_kobo,payment_method,access_token,user_id,order_items(name,quantity)').eq('order_number', number).single()
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!o || !((user && o.user_id === user.id) || (t && t === o.access_token))) notFound()
  let status = o.status
  const ref = reference ?? trxref
  if (status === 'pending' && o.payment_method === 'online' && ref) {      // customer just returned from Paystack: confirm right away
    await settle(db, ref)
    status = (await db.from('orders').select('status').eq('order_number', number).single()).data?.status ?? status
  }
  const waiting = status === 'pending' && o.payment_method === 'online'
  return (
    <section className="card p">
      <h1>Order {o.order_number}</h1>
      <p><strong>Status:</strong> {waiting ? 'Waiting for payment' : status}</p>
      {waiting && <p>Your items are held for a short time. <a className="btn sm" href={`/api/pay?n=${o.order_number}&t=${o.access_token}`}>Pay now</a></p>}
      {status === 'cancelled' && <p className="err">This order was cancelled. Place a new order to buy these items.</p>}
      <ul>{o.order_items.map((i: any, k: number) => <li key={k}>{i.quantity} × {i.name}</li>)}</ul>
      <strong>{naira(o.total_kobo)}</strong>
      <small>Keep this page&apos;s link to check your order later.</small>
    </section>
  )
}
