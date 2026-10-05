'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CartTab } from '@/components/Cart'

// Bottom navigation, shown on phones only (see globals.css).
export function TabBar() {
  const p = usePathname()
  const tab = (href: string, icon: string, label: string, on = false) => (
    <Link key={label} href={href} className={on ? 'on' : ''}><i aria-hidden="true">{icon}</i><span>{label}</span></Link>
  )
  return (
    <nav className="tabbar" aria-label="Main">
      {tab('/', '🏠', 'Home', p === '/')}
      {tab('/#shop', '🗂️', 'Categories')}
      <CartTab />
      {tab('/orders', '📦', 'Orders', p === '/orders')}
      {tab('/account', '👤', 'Account', p === '/account')}
    </nav>
  )
}
