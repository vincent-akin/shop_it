import Stripe from 'stripe'
export const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createSession(db: any, o: { id: string; order_number: string; email: string; shipping_kobo: number; access_token: string }, origin: string) {
  const { data: items } = await db.from('order_items').select('name,unit_price_kobo,quantity').eq('order_id', o.id)
  const currency = (process.env.STRIPE_CURRENCY || 'ngn').toLowerCase()
  const line = (name: string, amount: number, quantity: number) => ({ quantity, price_data: { currency, unit_amount: amount, product_data: { name } } })
  const line_items = (items ?? []).map((i: any) => line(i.name, i.unit_price_kobo, i.quantity))
  if (o.shipping_kobo > 0) line_items.push(line('Delivery', o.shipping_kobo, 1))
  const base = `${origin}/order/${o.order_number}?t=${o.access_token}`
  const s = await stripe().checkout.sessions.create({
    mode: 'payment', customer_email: o.email, client_reference_id: o.id, metadata: { order_number: o.order_number },
    line_items, success_url: base, cancel_url: base + '&cancelled=1', expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
  })
  return s.url!
}
