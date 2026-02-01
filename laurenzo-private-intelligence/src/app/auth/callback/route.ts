import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Create free subscription for new users
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!existingSubscription) {
          await supabase.from('subscriptions').insert({
            user_id: user.id,
            plan_tier: 'free',
            status: 'active',
            monthly_views_used: 0,
            monthly_views_limit: 10,
          })
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Return to login page with error
  return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
}
