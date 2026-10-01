import crypto from 'crypto'
import { sendMail } from '@/lib/mailgun'

const auth = () => ({ Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY })

// Starts a Paystack payment for an order and returns the hosted payment page URL.
export async function initPayment(o: { order_number: string; email: string; total_kobo: number; access_token: string }, origin: string) {
  const r = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST', headers: { ...auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: o.email, amount: o.total_kobo, currency: 'NGN',
      reference: `${o.order_number}-${crypto.randomBytes(3).toString('hex')}`,   // unique per attempt, so "Pay now" can retry
      callback_url: `${origin}/order/${o.order_number}?t=${o.access_token}`,
      metadata: { order_number: o.order_number },
    }),
  })
  const j = await r.json().catch(() => null)
  if (!r.ok || !j?.data?.authorization_url) throw new Error('Paystack could not start the payment')
  return j.data.authorization_url as string
}

// Confirms a payment with Paystack (never trusts the browser or the webhook body alone) and marks the order paid.
export async function settle(db: any, reference: string) {
  const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: auth() })
  const d = (await r.json().catch(() => null))?.data
  if (!r.ok || d?.status !== 'success') return
  const { data: o } = await db.from('orders').select('id,email,order_number,total_kobo,status,access_token').eq('order_number', d.metadata?.order_number ?? '').single()
  if (!o || d.amount !== o.total_kobo || d.currency !== 'NGN') return
  if (o.status === 'pending') {
    const { data: u } = await db.from('orders').update({ status: 'paid', payment_ref: String(d.reference) }).eq('id', o.id).eq('status', 'pending').select('id')
    if (!u?.length) return                                                         // another request already settled it
    const link = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/order/${o.order_number}?t=${o.access_token}`
    try { await sendMail(o.email, `Payment received for ${o.order_number}`, `<p>We received your payment for order <b>${o.order_number}</b>.</p><p><a href="${link}">View your order</a></p>`) } catch {}
  } else if (o.status === 'cancelled') {
    // Paid after the order expired and its stock was released: flag it so you can refund in the Paystack dashboard.
    await db.from('email_events').insert({ kind: 'late_payment', to_email: o.email, status: 'needs_review', payload: { order_number: o.order_number, reference: d.reference } })
  }
}
