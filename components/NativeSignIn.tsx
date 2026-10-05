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
    let stage = 'start'
    try {
      const SL = (window as any).Capacitor?.Plugins?.SocialLogin
      if (!SL) throw new Error('The Google sign-in plugin is missing from this app build')
      const webClientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID
      if (!webClientId) throw new Error('NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID is empty in this deployment')
      stage = 'setup'
      await SL.initialize({ google: {
        webClientId,
        iOSClientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        iOSServerClientId: webClientId,
        mode: 'online',
      } })
      stage = 'google'
      const res = await SL.login({ provider: 'google', options: { scopes: ['profile', 'email'] } })
      const token = res?.result?.idToken
      if (!token) throw new Error('Google returned no ID token')
      stage = 'supabase'
      const { error } = await createClient().auth.signInWithIdToken({ provider: 'google', token })
      if (error) throw error
      location.reload()
    } catch (e: any) {
      setErr(`Sign-in failed at "${stage}": ${e?.message || e?.code || JSON.stringify(e)}`)
      setBusy(false)
    }
  }
  return (
    <>
      <button className="gbtn" type="button" onClick={go} disabled={busy}>{busy ? 'Signing in…' : 'Sign in with Google'}</button>
      {err && <p className="err" role="alert">{err}</p>}
    </>
  )
}
