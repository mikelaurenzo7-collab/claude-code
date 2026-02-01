import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { valuateCompany } from '@/lib/valuation'
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

    // Fetch company
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !company) {
      return NextResponse.json(
        { error: 'Not found', message: 'Company not found' },
        { status: 404 }
      )
    }

    // Record view
    await supabase.from('asset_views').insert({
      user_id: user.id,
      asset_type: 'company',
      asset_id: params.id,
    })

    // Increment monthly views
    await supabase
      .from('subscriptions')
      .update({ monthly_views_used: monthlyViewsUsed + 1 })
      .eq('user_id', user.id)

    // Calculate fresh valuation if needed
    let valuation = null
    if (company.revenue_cents) {
      valuation = valuateCompany({
        revenue: company.revenue_cents / 100,
        ebitda: company.ebitda_cents ? company.ebitda_cents / 100 : undefined,
        industry: company.industry || 'Other',
        employees: company.employees || 0,
        growthRate: company.growth_rate || undefined,
      })
    }

    return NextResponse.json({
      data: {
        ...company,
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
