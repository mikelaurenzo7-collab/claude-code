import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent, stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const supabase = createServiceRoleClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        // Get subscription details from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = stripeSubscription.items.data[0]?.price.id

        // Determine plan tier based on price ID
        let planTier: 'professional' | 'enterprise' = 'professional'
        if (
          priceId === process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ||
          priceId === process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID
        ) {
          planTier = 'enterprise'
        }

        // Update subscription in database
        await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            plan_tier: planTier,
            status: 'active',
            current_period_start: new Date(
              stripeSubscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              stripeSubscription.current_period_end * 1000
            ).toISOString(),
            monthly_views_limit: planTier === 'enterprise' ? null : null, // Unlimited
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id

        // Determine plan tier
        let planTier: 'free' | 'professional' | 'enterprise' = 'professional'
        if (
          priceId === process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ||
          priceId === process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID
        ) {
          planTier = 'enterprise'
        }

        // Map Stripe status to our status
        let status: 'active' | 'canceled' | 'past_due' | 'trialing' = 'active'
        if (subscription.status === 'canceled') status = 'canceled'
        else if (subscription.status === 'past_due') status = 'past_due'
        else if (subscription.status === 'trialing') status = 'trialing'

        await supabase
          .from('subscriptions')
          .update({
            stripe_price_id: priceId,
            plan_tier: planTier,
            status,
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Downgrade to free tier
        await supabase
          .from('subscriptions')
          .update({
            plan_tier: 'free',
            status: 'canceled',
            stripe_subscription_id: null,
            stripe_price_id: null,
            monthly_views_limit: 10,
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Reset monthly views at the start of each billing period
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            monthly_views_used: 0,
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
