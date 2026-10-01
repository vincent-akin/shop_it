import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
export async function requireAdmin() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/auth/signin')
  const { data: p } = await sb.from('profiles').select('role').eq('id', user.id).single()
  if (p?.role !== 'admin') redirect('/')
  return sb
}
