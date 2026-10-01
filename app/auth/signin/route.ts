import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET(req: Request) {
  const origin = new URL(req.url).origin
  const sb = await createClient()
  const { data } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/auth/callback' } })
  return NextResponse.redirect(data.url ?? origin)
}
