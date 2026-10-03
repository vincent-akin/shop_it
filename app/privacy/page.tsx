export const metadata = { title: 'Privacy policy · Shop_It' }

export default function Privacy() {
  return (
    <section className="card p" style={{ gap: 10 }}>
      <h1>Privacy policy</h1>
      <p><small>Last updated: October 2026</small></p>
      <h3>What we collect</h3>
      <p>When you order we collect your name, email address, phone number and delivery address, and we keep your order history. If you sign in with Google we receive your name, email address and profile photo.</p>
      <h3>How we use it</h3>
      <p>We use this information to process and deliver your orders, send order and payment emails, and answer your questions. We do not sell your information.</p>
      <h3>Payments</h3>
      <p>Payments are handled by Paystack. We never see or store your card or bank details.</p>
      <h3>Who handles your data</h3>
      <p>Your data is stored with Supabase. Order emails are sent through Mailgun. These providers process data only to run our store.</p>
      <h3>Your choices</h3>
      <p>To see, correct or delete your information, contact us at <a href="mailto:vinciakins@gmail.com">vinciakins@gmail.com</a>, or on WhatsApp or by phone at +234 906 887 7567.</p>
    </section>
  )
}
