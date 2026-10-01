'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { sendMail } from '@/lib/mailgun'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

export async function setOrderStatus(fd: FormData) {
  const sb = await requireAdmin()
  const id = String(fd.get('id')), status = String(fd.get('status'))
  if (!STATUSES.includes(status)) return
  const { data: o } = await sb.from('orders').update({ status }).eq('id', id).select('email,order_number').single()
  if (o) { try { await sendMail(o.email, `Order ${o.order_number} is ${status}`, `<p>Your order <b>${o.order_number}</b> is now <b>${status}</b>.</p>`) } catch {} }
  revalidatePath('/admin')
}

export async function saveProduct(fd: FormData) {
  const sb = await requireAdmin()
  const id = String(fd.get('id') || ''), name = String(fd.get('name') || '').trim()
  const row = {
    name, description: String(fd.get('description') || ''),
    price_kobo: Math.round(Number(fd.get('price')) * 100), stock: Math.max(0, Math.floor(Number(fd.get('stock')))),
    image_url: String(fd.get('image_url') || '') || null, is_active: fd.get('active') === 'on',
  }
  if (!name || !(row.price_kobo >= 0) || Number.isNaN(row.stock)) return
  if (id) await sb.from('products').update(row).eq('id', id)
  else {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-4)
    await sb.from('products').insert({ ...row, slug, category_id: Number(fd.get('category_id')) })
  }
  revalidatePath('/admin/products'); revalidatePath('/')
}
