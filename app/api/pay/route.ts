import { NextResponse } from 'next/server'
import { createClient as admin } from '@supabase/supabase-js'
import { initPayment } from '@/lib/paystack'

export async function GET(req: Request) {
  const u = new URL(req.url)
  const db = admin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: o } = await db.from('orders').select('order_number,email,total_kobo,access_token,status,payment_method')
    .eq('order_number', u.searchParams.get('n') ?? '').single()
  if (!o || o.access_token !== u.searchParams.get('t') || o.status !== 'pending' || o.payment_method !== 'online') return new Response('Not available', { status: 404 })
  try { return NextResponse.redirect(await initPayment(o, u.origin), 303) } catch { return new Response('Payment could not be started. Try again.', { status: 502 }) }
}
