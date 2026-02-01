import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in' },
        { status: 401 }
      )
    }

    const { data: trackedAssets, error } = await supabase
      .from('tracked_assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: trackedAssets })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in' },
        { status: 401 }
      )
    }

    // Check subscription limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_tier')
      .eq('user_id', user.id)
      .single()

    const planTier = subscription?.plan_tier || 'free'
    const limits = PLAN_LIMITS[planTier]

    if (limits.trackedAssets === 0) {
      return NextResponse.json(
        { error: 'Upgrade required', message: 'Asset tracking requires a paid plan' },
        { status: 403 }
      )
    }

    // Count current tracked assets
    const { count } = await supabase
      .from('tracked_assets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (count && count >= limits.trackedAssets && limits.trackedAssets !== Infinity) {
      return NextResponse.json(
        { error: 'Limit exceeded', message: 'You have reached your tracked assets limit' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { assetType, assetId, notes } = body

    if (!assetType || !assetId) {
      return NextResponse.json(
        { error: 'Bad request', message: 'assetType and assetId are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('tracked_assets')
      .insert({
        user_id: user.id,
        asset_type: assetType,
        asset_id: assetId,
        notes,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'Already tracked', message: 'This asset is already being tracked' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Bad request', message: 'id is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('tracked_assets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
