export async function sendMail(to: string, subject: string, html: string) {
  const base = process.env.MAILGUN_API_BASE || 'https://api.mailgun.net'
  const r = await fetch(`${base}/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from('api:' + process.env.MAILGUN_API_KEY).toString('base64') },
    body: new URLSearchParams({ from: process.env.MAILGUN_FROM!, to, subject, html }),
  })
  if (!r.ok) throw new Error('Mailgun ' + r.status)
}
