import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AvatarField } from '@/components/AvatarField'
import { saveProfile } from './actions'

export const metadata = { title: 'Settings · Shop_It' }

export default async function Settings({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/account')
  const { data: p } = await sb.from('profiles').select('full_name,phone,avatar_url,email').eq('id', user.id).single()
  return (
    <form className="card p f" action={saveProfile}>
      <h1>Settings</h1>
      {saved && <p role="status">Profile saved.</p>}
      <AvatarField userId={user.id} defaultValue={p?.avatar_url ?? ''} />
      <input name="full_name" placeholder="Full name" defaultValue={p?.full_name ?? ''} aria-label="Full name" autoComplete="name" />
      <input name="phone" placeholder="Phone number" defaultValue={p?.phone ?? ''} aria-label="Phone number" autoComplete="tel" />
      <small>Email: {p?.email ?? user.email} (from your Google account)</small>
      <button className="btn">Save</button>
    </form>
  )
}
