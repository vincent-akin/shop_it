import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient as admin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { sendMail } from '@/lib/mailgun'
import { initPayment } from '@/lib/paystack'
import { expireStale } from '@/lib/orders'
import { naira } from '@/lib/money'

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })
const clean = (v: unknown, max = 120) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max)

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  if (body.website) return bad('Could not place order')                                   // honeypot: real people never fill this
  const { data: { user } } = await (await createClient()).auth.getUser()
  const method = body.method === 'cod' ? 'cod' : 'online'
  if (method === 'cod' && !user) return bad('Sign in to pay on delivery', 401)             // guests must pay online
  if (method === 'online' && !process.env.PAYSTACK_SECRET_KEY) return bad('Online payment is not available yet. Sign in to pay on delivery.', 401)

  const email = clean(user?.email ?? body.email, 200).toLowerCase()
  const a = body.address ?? {}
  const address = { name: clean(a.name), phone: clean(a.phone, 30), line1: clean(a.line1, 200), city: clean(a.city) }
  const raw = Array.isArray(body.items) ? body.items : []
  const items = raw.map((i: any) => ({ id: String(i.id), qty: Math.floor(Number(i.qty)) }))
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !address.name || !address.phone || !address.line1 || !address.city)
    return bad('Enter a valid email and complete your delivery details')
  if (!items.length || items.length > 10 || new Set(items.map((i: any) => i.id)).size !== items.length || items.some((i: any) => !(i.qty >= 1 && i.qty <= 5)))
    return bad('You can order up to 10 products, with up to 5 of each')

  const db = admin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
  const ipHash = crypto.createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!).update(ip).digest('hex')
  await expireStale(db)
  const since = new Date(Date.now() - 3600e3).toISOString()
  const pending = (col: string, val: string) => db.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending').eq(col, val).gte('created_at', since)
  const [{ count: byEmail }, { count: byIp }] = await Promise.all([pending('email', email), pending('ip_hash', ipHash)])
  if ((byEmail ?? 0) >= 2 || (byIp ?? 0) >= 4) return bad('You have unpaid orders waiting. Complete payment or try again later.', 429)

  const { data, error } = await db.rpc('place_order', { p_user: user?.id ?? null, p_email: email, p_items: items, p_address: address })
  if (error || !data?.[0]) return bad(error?.message ?? 'Could not place order', 409)
  const { data: o } = await db.from('orders').update({ payment_method: method, is_guest: !user, ip_hash: ipHash })
    .eq('id', data[0].o_id).select('id,order_number,email,total_kobo,access_token').single()
  if (!o) return bad('Could not place order', 500)
  const link = `${new URL(req.url).origin}/order/${o.order_number}?t=${o.access_token}`

  if (method === 'online') {
    try { return NextResponse.json({ payUrl: await initPayment(o, new URL(req.url).origin) }) }
    catch { await db.from('orders').update({ status: 'cancelled' }).eq('id', o.id); return bad('Payment could not be started. Please try again.', 502) }
  }
  const payload = { order_number: o.order_number, total: naira(data[0].o_total), link }
  const { data: ev } = await db.from('email_events').insert({ kind: 'order_confirmation', to_email: email, payload }).select('id').single()
  try {
    await sendMail(email, `Order ${o.order_number} received`, `<p>Thanks for your order <b>${o.order_number}</b>. Total: ${payload.total}. Pay on delivery.</p><p><a href="${link}">View your order</a></p>`)
    if (ev) await db.from('email_events').update({ status: 'sent' }).eq('id', ev.id)
  } catch { /* stays 'queued' for the retry job */ }
  return NextResponse.json({ orderNumber: o.order_number })
}
