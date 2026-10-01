import './globals.css'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CartProvider, CartPanel } from '@/components/Cart'
import { ThemeToggle } from '@/components/Client'

export const metadata: Metadata = { title: 'Shop_It', description: 'Phones, laptops, electronics and fashion.' }
const themeInit = `try{var t=localStorage.getItem('shopit_theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  const isAdmin = user ? (await sb.from('profiles').select('role').eq('id', user.id).single()).data?.role === 'admin' : false
  const name = user?.user_metadata?.full_name?.split(' ')[0]
  return (
    <html lang="en" suppressHydrationWarning>
      <head><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" /><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body>
        <CartProvider>
          <div className="app">
            <aside className="side card">
              <div className="logo">
                <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true"><path d="M6 14h28l-2.5 20a3 3 0 0 1-3 2.6H11.5a3 3 0 0 1-3-2.6z" fill="#f9735b" /><path d="M13 14v-2a7 7 0 0 1 14 0v2" fill="none" stroke="#ff9b6a" strokeWidth="3.2" strokeLinecap="round" /><path d="M14 25h12" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" /></svg>
                <span>Shop<b>_</b>It</span>
              </div>
              <nav className="nav" aria-label="Main">
                <Link className="on" href="/" title="Home"><i>🏠</i><span>Home</span></Link>
                <Link href="/#shop" title="Products"><i>🛍️</i><span>Products</span></Link>
                <Link href="/orders" title="My orders"><i>📦</i><span>My orders</span></Link>
                {isAdmin && <Link href="/admin" title="Admin"><i>⚙️</i><span>Admin</span></Link>}
              </nav>
              <div className="promo">🚚<p>Free delivery on orders above ₦150,000</p>
                {user ? <form action="/auth/signout" method="post"><button className="btn sm">Sign out</button></form> : <a className="btn sm" href="/auth/signin">Sign in</a>}
              </div>
              <ThemeToggle />
            </aside>
            <main>{children}</main>
            <CartPanel name={name} email={user?.email} online={!!process.env.PAYSTACK_SECRET_KEY} />
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
