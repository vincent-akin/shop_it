import Link from 'next/link'

export function AdminTabs({ on }: { on: 'orders' | 'products' | 'customers' }) {
  const t = (k: string, href: string, label: string) => <Link key={k} className={'tab' + (on === k ? ' on' : '')} href={href}>{label}</Link>
  return <div className="bar"><div className="tabs">{t('orders', '/admin', 'Orders')}{t('products', '/admin/products', 'Products')}{t('customers', '/admin/customers', 'Customers')}</div></div>
}
