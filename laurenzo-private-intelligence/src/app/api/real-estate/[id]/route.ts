import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { valuateRealEstate } from '@/lib/valuation'
import { PLAN_LIMITS } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check subscription limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const planTier = subscription?.plan_tier || 'free'
    const limits = PLAN_LIMITS[planTier]
    const monthlyViewsUsed = subscription?.monthly_views_used || 0

    if (monthlyViewsUsed >= limits.monthlyViews) {
      return NextResponse.json(
        {
          error: 'Limit exceeded',
          message: 'You have reached your monthly view limit. Please upgrade your plan.',
        },
        { status: 403 }
      )
    }

    // Fetch property
    const { data: property, error } = await supabase
      .from('real_estate')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !property) {
      return NextResponse.json(
        { error: 'Not found', message: 'Property not found' },
        { status: 404 }
      )
    }

    // Record view
    await supabase.from('asset_views').insert({
      user_id: user.id,
      asset_type: 'real_estate',
      asset_id: params.id,
    })

    // Increment monthly views
    await supabase
      .from('subscriptions')
      .update({ monthly_views_used: monthlyViewsUsed + 1 })
      .eq('user_id', user.id)

    // Calculate fresh valuation if needed
    let valuation = null
    if (property.square_feet && property.property_type && property.city) {
      valuation = valuateRealEstate({
        propertyType: property.property_type,
        squareFeet: property.square_feet,
        city: property.city,
        state: property.state || '',
        yearBuilt: property.year_built || new Date().getFullYear(),
        occupancyRate: property.occupancy_rate || undefined,
        noi: property.noi_cents ? property.noi_cents / 100 : undefined,
      })
    }

    return NextResponse.json({
      data: {
        ...property,
        calculatedValuation: valuation,
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
