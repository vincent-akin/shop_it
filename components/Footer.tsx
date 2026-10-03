import Link from 'next/link'

const CATS = [['fashion', 'Fashion'], ['electronics', 'Electronics'], ['laptops', 'Laptops'], ['phones', 'Phones']]

export function Footer({ signedIn, inApp }: { signedIn: boolean; inApp: boolean }) {
  return (
    <footer className="foot">
      <div className="card">
        <div>
          <div className="logo" style={{ padding: 0 }}>
            <svg width="32" height="32" viewBox="0 0 40 40" aria-hidden="true"><path d="M6 14h28l-2.5 20a3 3 0 0 1-3 2.6H11.5a3 3 0 0 1-3-2.6z" fill="#f9735b" /><path d="M13 14v-2a7 7 0 0 1 14 0v2" fill="none" stroke="#ff9b6a" strokeWidth="3.2" strokeLinecap="round" /><path d="M14 25h12" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" /></svg>
            <span>Shop<b>_</b>It</span>
          </div>
          <p style={{ color: 'var(--mut)', margin: '10px 0 0' }}>Phones, laptops, electronics and fashion, delivered to you.</p>
        </div>
        <nav aria-label="Shop"><h4>Shop</h4>{CATS.map(([s, n]) => <Link key={s} href={`/?c=${s}`}>{n}</Link>)}</nav>
        {!inApp && <nav aria-label="Account"><h4>Account</h4>
          <Link href="/orders">My orders</Link>
          {signedIn ? <form action="/auth/signout" method="post"><button style={{ color: 'var(--mut)', padding: '3px 0' }}>Sign out</button></form> : <a href="/auth/signin">Sign in</a>}
        </nav>}
        <nav aria-label="Help"><h4>Help</h4>
          <a href="https://wa.me/2349068877567" target="_blank" rel="noopener noreferrer">WhatsApp: +234 906 887 7567</a>
          <a href="tel:+2349068877567">Call: +234 906 887 7567</a>
          <a href="mailto:vinciakins@gmail.com">vinciakins@gmail.com</a>
          <Link href="/privacy">Privacy policy</Link>
          <span style={{ color: 'var(--mut)' }}>Secure payment with Paystack</span>
          <span style={{ color: 'var(--mut)' }}>Free delivery above ₦150,000</span>
        </nav>
        <div className="copy"><span>© {new Date().getFullYear()} Shop_It. All rights reserved.</span><span>Made in Nigeria 🇳🇬</span></div>
      </div>
    </footer>
  )
}
