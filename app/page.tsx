import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { AddButton, CartToggle } from '@/components/Cart'
import { NativeSignIn } from '@/components/NativeSignIn'
import { naira } from '@/lib/money'

const look: Record<string, [number, string]> = { fashion: [12, '👕'], electronics: [215, '🎧'], laptops: [260, '💻'], phones: [170, '📱'] }

export default async function Home({ searchParams }: { searchParams: Promise<{ c?: string; q?: string }> }) {
  const { c, q } = await searchParams
  const inApp = ((await headers()).get('user-agent') ?? '').includes('ShopItApp')
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  const { data: cats } = await sb.from('categories').select('slug,name').order('id')
  let qb = sb.from('products').select('id,name,price_kobo,stock,image_url,categories!inner(slug,name)').eq('is_active', true).order('created_at')
  if (c) qb = qb.eq('categories.slug', c)
  if (q) qb = qb.ilike('name', `%${q.replace(/[%,]/g, '')}%`)
  const { data: products } = await qb
  return (
    <>
      <div className="top">
        <form className="search" action="/" role="search">
          <span aria-hidden="true">🔍</span>
          {c && <input type="hidden" name="c" value={c} />}
          <input name="q" type="search" defaultValue={q} placeholder="Search by name or category" aria-label="Search products" />
        </form>
        <CartToggle />
      </div>
      <section className="hero">
        <div>
          <h1>Everything you need, delivered to you</h1>
          <p>Phones, laptops, electronics and fashion in one place.</p>
          {!user && (inApp ? <NativeSignIn /> : <a className="gbtn" href="/auth/signin">Sign in with Google</a>)}
        </div>
        <div className="art" aria-hidden="true"><span className="b2">❤️</span><span className="big">🛍️</span><span className="b1">👟</span></div>
      </section>
      <div className="bar" id="shop">
        <div className="tabs">
          {[{ slug: '', name: 'All' }, ...(cats ?? [])].map(t => (
            <Link key={t.slug} className={'tab' + ((c ?? '') === t.slug ? ' on' : '')} href={t.slug ? `/?c=${t.slug}` : '/'}>{t.name}</Link>
          ))}
        </div>
      </div>
      <div className="grid">
        {products?.length ? products.map((p: any) => {
          const [h, e] = look[p.categories.slug] ?? [200, '🛍️']
          return (
            <article className="p card" key={p.id}>
              {p.image_url ? <img src={p.image_url} alt={p.name} /> : <div className="tile" style={{ ['--h' as any]: h }}><span aria-hidden="true">{e}</span></div>}
              <h3>{p.name}</h3><small>{p.categories.name}</small>
              <div className="row"><strong>{naira(p.price_kobo)}</strong><AddButton p={{ id: p.id, name: p.name, price: p.price_kobo, stock: p.stock }} /></div>
            </article>
          )
        }) : <div className="empty">No products found. Try a different search or category.</div>}
      </div>
    </>
  )
}
