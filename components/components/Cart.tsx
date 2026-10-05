'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { naira } from '@/lib/money'

type Item = { id: string; name: string; price: number; stock: number; qty: number }
const Ctx = createContext<any>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, set] = useState<Item[]>([])
  const [open, setOpen] = useState(false)
  useEffect(() => { try { set(JSON.parse(localStorage.getItem('shopit_cart') || '[]')) } catch {} }, [])
  const save = (n: Item[]) => { set(n); try { localStorage.setItem('shopit_cart', JSON.stringify(n)) } catch {} }
  const add = (p: Omit<Item, 'qty'>, d = 1) => {
    const f = items.find(i => i.id === p.id), q = (f?.qty ?? 0) + d
    if (q > p.stock) return
    save(q <= 0 ? items.filter(i => i.id !== p.id) : f ? items.map(i => (i.id === p.id ? { ...i, qty: q } : i)) : [...items, { ...p, qty: q }])
  }
  return <Ctx.Provider value={{ items, add, open, setOpen, clear: () => save([]) }}>{children}</Ctx.Provider>
}

export const AddButton = ({ p }: { p: Omit<Item, 'qty'> }) => {
  const c = useContext(Ctx)
  return <button className="btn sm" type="button" disabled={p.stock < 1} onClick={() => { c.add(p); c.setOpen(true) }}>{p.stock < 1 ? 'Sold out' : 'Add'}</button>
}

export const CartToggle = () => {
  const c = useContext(Ctx)
  return <button className="ic cartbtn" type="button" aria-label="Open cart" onClick={() => c.setOpen(true)}>🛒<span className="badge">{c.items.reduce((s: number, i: Item) => s + i.qty, 0)}</span></button>
}

export function CartPanel({ name, email, online }: { name?: string; email?: string; online: boolean }) {
  const c = useContext(Ctx), router = useRouter()
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const [method, setMethod] = useState(online ? 'online' : 'cod')
  const sub = c.items.reduce((s: number, i: Item) => s + i.price * i.qty, 0)
  const ship = sub && sub < 15000000 ? 350000 : 0
  async function checkout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr('')
    const f: any = Object.fromEntries(new FormData(e.currentTarget))
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: c.items.map((i: Item) => ({ id: i.id, qty: i.qty })), address: { name: f.name, phone: f.phone, line1: f.line1, city: f.city }, email: f.email, hp_field: f.hp_field, method }) })
    const j = await res.json().catch(() => ({})); setBusy(false)
    if (res.status === 401) { setErr(j.error || 'Please sign in to continue'); return }
    if (!res.ok) { setErr(j.error || 'Something went wrong. Try again.'); return }
    c.clear(); c.setOpen(false); if (j.payUrl) location.href = j.payUrl; else router.push('/orders')
  }
  return (
    <aside className={'cart card' + (c.open ? ' open' : '')} aria-label="Cart">
      <div className="who"><span className="av" aria-hidden="true">👤</span><b>Hi, {name || 'Guest'}</b></div>
      <h2>Your cart <button className="ic x" type="button" aria-label="Close cart" onClick={() => c.setOpen(false)}>✕</button></h2>
      {c.items.length === 0 && <p className="sum">Your cart is empty. Add a product to get started.</p>}
      {c.items.map((i: Item) => (
        <div className="item" key={i.id}>
          <div className="t" aria-hidden="true">🛍️</div>
          <div><b>{i.name}</b><div className="qty">
            <button type="button" aria-label="Decrease quantity" onClick={() => c.add(i, -1)}>−</button><span>{i.qty}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => c.add(i, 1)}>+</button></div></div>
          <strong>{naira(i.price * i.qty)}</strong>
        </div>
      ))}
      <div className="sum"><span>Subtotal</span><span>{naira(sub)}</span></div>
      <div className="sum"><span>Delivery</span><span>{ship ? naira(ship) : 'Free'}</span></div>
      <div className="sum tot"><span>Total</span><span>{naira(sub + ship)}</span></div>
      {c.items.length > 0 && !online && !email && (<><p className="err">Sign in to place an order.</p><a className="btn" href="/auth/signin">Sign in with Google</a></>)}
      {c.items.length > 0 && (online || email) && (
        <form className="f" onSubmit={checkout}>
          {!email && <input name="email" type="email" placeholder="Email for your receipt" required autoComplete="email" />}
          <input name="hp_field" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
          <input name="name" placeholder="Full name" required autoComplete="name" />
          <input name="phone" placeholder="Phone number" required autoComplete="tel" />
          <input name="line1" placeholder="Delivery address" required autoComplete="street-address" />
          <input name="city" placeholder="City" required />
          {err && <p className="err" role="alert">{err}</p>}
          {email && online && <label><input type="checkbox" checked={method === 'cod'} onChange={e => setMethod(e.target.checked ? 'cod' : 'online')} /> Pay on delivery instead</label>}
          <button className="btn" disabled={busy}>{busy ? 'Please wait…' : method === 'online' ? 'Pay now' : 'Place order (pay on delivery)'}</button>
        </form>
      )}
    </aside>
  )
}

export const CartTab = () => {
  const c = useContext(Ctx)
  return (
    <button type="button" onClick={() => c.setOpen(true)}>
      <i aria-hidden="true">🛒<span className="badge">{c.items.reduce((s: number, i: Item) => s + i.qty, 0)}</span></i><span>Cart</span>
    </button>
  )
}
