import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  createCheckoutSession,
  createCustomer,
  getPriceId,
  type PlanType,
  type BillingInterval,
} from '@/lib/stripe'

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { plan, interval } = body as {
      plan: PlanType
      interval: BillingInterval
    }

    if (!plan || !interval) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Plan and interval are required' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let stripeCustomerId = subscription?.stripe_customer_id

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await createCustomer(user.email!, user.user_metadata?.name)
      stripeCustomerId = customer.id

      // Save customer ID
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        plan_tier: 'free',
        status: 'active',
        monthly_views_used: 0,
        monthly_views_limit: 10,
      })
    }

    // Create checkout session
    const priceId = getPriceId(plan, interval)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await createCheckoutSession(
      stripeCustomerId,
      priceId,
      `${appUrl}/dashboard/settings?success=true`,
      `${appUrl}/dashboard/settings?canceled=true`
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
