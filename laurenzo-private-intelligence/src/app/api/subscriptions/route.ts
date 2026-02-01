import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to access this resource' },
        { status: 401 }
      )
    }

    // Fetch subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    // If no subscription exists, return free tier info
    if (!subscription) {
      return NextResponse.json({
        data: {
          plan_tier: 'free',
          status: 'active',
          monthly_views_used: 0,
          monthly_views_limit: PLAN_LIMITS.free.monthlyViews,
          limits: PLAN_LIMITS.free,
        },
      })
    }

    return NextResponse.json({
      data: {
        ...subscription,
        limits: PLAN_LIMITS[subscription.plan_tier],
      },
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
