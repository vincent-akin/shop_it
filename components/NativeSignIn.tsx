'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Google sign-in inside the mobile app: Google signs the user in on the phone itself (Google blocks web sign-in
// in app web views), then the Google ID token is exchanged for a Supabase session.
export function NativeSignIn() {
  const [native, setNative] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  useEffect(() => { setNative(!!(window as any).Capacitor?.isNativePlatform?.()) }, [])
  if (!native) return null
  async function go() {
    setBusy(true); setErr('')
    try {
      const SL = (window as any).Capacitor.Plugins.SocialLogin
      await SL.initialize({ google: {
        webClientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iOSClientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        iOSServerClientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        mode: 'online',
      } })
      const res = await SL.login({ provider: 'google', options: { scopes: ['profile', 'email'] } })
      const token = res?.result?.idToken
      if (!token) throw new Error('No Google token')
      const { error } = await createClient().auth.signInWithIdToken({ provider: 'google', token })
      if (error) throw error
      location.reload()
    } catch { setErr('Google sign-in failed. Please try again.'); setBusy(false) }
  }
  return (
    <>
      <button className="gbtn" type="button" onClick={go} disabled={busy}>{busy ? 'Signing in…' : 'Sign in with Google'}</button>
      {err && <p className="err" role="alert">{err}</p>}
    </>
  )
}
