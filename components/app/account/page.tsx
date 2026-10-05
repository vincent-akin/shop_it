import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { NativeSignIn } from '@/components/NativeSignIn'

export const metadata = { title: 'Account · Shop_It' }

export default async function Account() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  const inApp = ((await headers()).get('user-agent') ?? '').includes('ShopItApp')
  const role = user ? (await sb.from('profiles').select('role').eq('id', user.id).single()).data?.role : null
  return (
    <section className="card p" style={{ gap: 10 }}>
      <h1>Account</h1>
      {user ? (
        <>
          <p><strong>{user.user_metadata?.full_name ?? 'Signed in'}</strong><br /><small>{user.email}</small></p>
          <Link className="btn sm" href="/orders">My orders</Link>
          {role === 'admin' && <Link className="btn sm" href="/admin">Admin</Link>}
          <form action="/auth/signout" method="post"><button className="btn sm">Sign out</button></form>
        </>
      ) : (
        <>
          <p>Sign in to see your orders and pay on delivery.</p>
          {inApp ? <NativeSignIn /> : <a className="btn sm" href="/auth/signin">Sign in with Google</a>}
        </>
      )}
      <h3>Help</h3>
      <a href="https://wa.me/2349068877567" target="_blank" rel="noopener noreferrer">WhatsApp: +234 906 887 7567</a>
      <a href="tel:+2349068877567">Call: +234 906 887 7567</a>
      <a href="mailto:vinciakins@gmail.com">vinciakins@gmail.com</a>
      <Link href="/privacy">Privacy policy</Link>
    </section>
  )
}
