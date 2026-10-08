'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function saveProfile(fd: FormData) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/account')
  const avatar = String(fd.get('avatar_url') || '')
  // Only accept a picture from the user's own storage folder, or the one Google gave them.
  const own = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.id}/`
  const ok = !avatar || avatar.startsWith(own) || avatar === user.user_metadata?.avatar_url
  await sb.from('profiles').update({
    full_name: String(fd.get('full_name') || '').trim().slice(0, 80),
    phone: String(fd.get('phone') || '').trim().slice(0, 30),
    ...(ok ? { avatar_url: avatar || null } : {}),
  }).eq('id', user.id)
  revalidatePath('/', 'layout')
  redirect('/settings?saved=1')
}
