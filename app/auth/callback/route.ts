import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET(req: Request) {
  const u = new URL(req.url), code = u.searchParams.get('code')
  if (code) await (await createClient()).auth.exchangeCodeForSession(code)
  return NextResponse.redirect(u.origin)
}
