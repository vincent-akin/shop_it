import crypto from 'crypto'
import { createClient as admin } from '@supabase/supabase-js'
import { settle } from '@/lib/paystack'

export async function POST(req: Request) {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) return new Response('not configured', { status: 404 })
  const raw = await req.text()
  const sig = Buffer.from(crypto.createHmac('sha512', key).update(raw).digest('hex'))
  const got = Buffer.from(req.headers.get('x-paystack-signature') ?? '')
  if (sig.length !== got.length || !crypto.timingSafeEqual(sig, got)) return new Response('bad signature', { status: 401 })
  const ev = JSON.parse(raw)
  if (ev.event === 'charge.success' && ev.data?.reference)
    await settle(admin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!), ev.data.reference)
  return new Response('ok')
}
