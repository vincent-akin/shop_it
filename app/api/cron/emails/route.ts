import { createClient as admin } from '@supabase/supabase-js'
import { sendMail } from '@/lib/mailgun'
import { expireStale } from '@/lib/orders'

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return new Response('unauthorized', { status: 401 })
  const db = admin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data } = await db.from('email_events').select('*').eq('status', 'queued').lt('attempts', 5).limit(20)
  for (const e of data ?? []) {
    try {
      await sendMail(e.to_email, `Order ${e.payload.order_number} received`, `<p>Thanks for your order <b>${e.payload.order_number}</b>. Total: ${e.payload.total}.</p><p><a href="${e.payload.link}">View your order</a></p>`)
      await db.from('email_events').update({ status: 'sent', attempts: e.attempts + 1 }).eq('id', e.id)
    } catch { await db.from('email_events').update({ attempts: e.attempts + 1 }).eq('id', e.id) }
  }
  await expireStale(db)   // release stock held by unpaid online orders
  return Response.json({ emails: data?.length ?? 0 })
}
