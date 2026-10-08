'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function AvatarField({ userId, defaultValue }: { userId: string; defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue ?? ''), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setErr('')
    if (!TYPES.includes(f.type)) return setErr('Use a JPG, PNG or WebP image.')
    if (f.size > 2 * 1024 * 1024) return setErr('The image must be under 2 MB.')
    setBusy(true)
    const sb = createClient(), path = `${userId}/${Date.now()}.${f.type.split('/')[1]}`
    const { error } = await sb.storage.from('avatars').upload(path, f, { contentType: f.type, cacheControl: '31536000' })
    setBusy(false)
    if (error) return setErr('Upload failed. Please try again.')
    setUrl(sb.storage.from('avatars').getPublicUrl(path).data.publicUrl)
  }
  return (
    <div className="f" style={{ justifyItems: 'start' }}>
      {url ? <img src={url} alt="Profile picture" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }} />
           : <span className="av" style={{ width: 96, height: 96, fontSize: 40 }} aria-hidden="true">👤</span>}
      <input type="hidden" name="avatar_url" value={url} />
      <label className="btn sm">{busy ? 'Uploading…' : 'Change picture'}<input type="file" accept={TYPES.join(',')} onChange={pick} hidden /></label>
      {err && <p className="err" role="alert">{err}</p>}
      <small>Click Save to apply.</small>
    </div>
  )
}
