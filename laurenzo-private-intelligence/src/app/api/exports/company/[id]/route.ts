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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in' },
        { status: 401 }
      )
    }

    // Check subscription limits for exports
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_tier')
      .eq('user_id', user.id)
      .single()

    const planTier = subscription?.plan_tier || 'free'
    const limits = PLAN_LIMITS[planTier]

    if (limits.pdfExports === 0) {
      return NextResponse.json(
        {
          error: 'Upgrade required',
          message: 'PDF exports require a paid subscription',
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

    // Calculate valuation
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

    // Record export
    await supabase.from('exports').insert({
      user_id: user.id,
      asset_type: 'company',
      asset_id: params.id,
      export_type: 'pdf',
    })

    // Return data for PDF generation (client-side)
    return NextResponse.json({
      data: {
        company,
        valuation,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to generate export' },
      { status: 500 }
    )
  }
}
