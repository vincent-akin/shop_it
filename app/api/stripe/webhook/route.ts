import { createClient as admin } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { sendMail } from '@/lib/mailgun'

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return new Response('not configured', { status: 404 })
  let ev: Stripe.Event
  try { ev = stripe().webhooks.constructEvent(await req.text(), req.headers.get('stripe-signature') ?? '', process.env.STRIPE_WEBHOOK_SECRET) }
  catch { return new Response('bad signature', { status: 400 }) }
  if (ev.type === 'checkout.session.completed' || ev.type === 'checkout.session.async_payment_succeeded') {
    const s = ev.data.object as Stripe.Checkout.Session
    if (s.payment_status === 'paid' && s.client_reference_id) {
      const db = admin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      const { data: o } = await db.from('orders').select('id,email,order_number,total_kobo,status,access_token').eq('id', s.client_reference_id).single()
      if (o && o.status === 'pending' && o.total_kobo === s.amount_total) {
        await db.from('orders').update({ status: 'paid', payment_ref: String(s.payment_intent ?? s.id) }).eq('id', o.id)
        const link = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/order/${o.order_number}?t=${o.access_token}`
        try { await sendMail(o.email, `Payment received for ${o.order_number}`, `<p>We received your payment for order <b>${o.order_number}</b>.</p><p><a href="${link}">View your order</a></p>`) } catch {}
      }
    }
  }
  return new Response('ok')
}
