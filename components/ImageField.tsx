'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function ImageField({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue ?? ''), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setErr('')
    if (!TYPES.includes(f.type)) return setErr('Use a JPG, PNG or WebP image.')
    if (f.size > 2 * 1024 * 1024) return setErr('The image must be under 2 MB.')
    setBusy(true)
    const sb = createClient(), path = `${crypto.randomUUID()}.${f.type.split('/')[1]}`
    const { error } = await sb.storage.from('products').upload(path, f, { contentType: f.type, cacheControl: '31536000' })
    setBusy(false)
    if (error) return setErr('Upload failed. Make sure you are signed in as an admin.')
    setUrl(sb.storage.from('products').getPublicUrl(path).data.publicUrl)
  }
  return (
    <div className="f">
      {url && <img src={url} alt="Product preview" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 12 }} />}
      <input type="hidden" name={name} value={url} />
      <label className="btn sm" style={{ textAlign: 'center' }}>
        {busy ? 'Uploading…' : url ? 'Replace image' : 'Upload image'}
        <input type="file" accept={TYPES.join(',')} onChange={pick} hidden />
      </label>
      {url && <button type="button" className="btn sm" onClick={() => setUrl('')}>Remove image</button>}
      {err && <p className="err" role="alert">{err}</p>}
      <small>After choosing an image, click Save to apply it.</small>
    </div>
  )
}
