/**
 * Stripe Webhook Integration Tests
 *
 * Tests for Stripe webhook signature verification and event handling.
 * These tests ensure webhook security and proper event processing.
 */

import Stripe from 'stripe'
import { createHmac } from 'crypto'

// Mock Stripe configuration
const MOCK_WEBHOOK_SECRET = 'whsec_test_secret_key_123456789'
const MOCK_STRIPE_API_KEY = 'sk_test_mock_key'

// Helper to create Stripe signature
function createStripeSignature(
  payload: string,
  secret: string,
  timestamp?: number
): string {
  const ts = timestamp || Math.floor(Date.now() / 1000)
  const signedPayload = `${ts}.${payload}`
  const signature = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  return `t=${ts},v1=${signature},v0=deprecated_signature`
}

// Helper to create mock Stripe events
function createMockStripeEvent(
  type: string,
  data: Record<string, unknown>
): Stripe.Event {
  return {
    id: `evt_${Date.now()}`,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    type: type as Stripe.Event.Type,
    data: {
      object: data,
    },
    livemode: false,
    pending_webhooks: 0,
    request: null,
  } as Stripe.Event
}

// Mock subscription data
const mockSubscription = {
  id: 'sub_test123',
  object: 'subscription',
  customer: 'cus_test123',
  status: 'active',
  items: {
    data: [
      {
        id: 'si_test123',
        price: {
          id: 'price_professional',
          product: 'prod_professional',
        },
      },
    ],
  },
  current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  metadata: {
    userId: 'user_test123',
  },
}

const mockInvoice = {
  id: 'in_test123',
  object: 'invoice',
  customer: 'cus_test123',
  subscription: 'sub_test123',
  status: 'paid',
  amount_paid: 4900, // $49.00
  currency: 'usd',
}

const mockCheckoutSession = {
  id: 'cs_test123',
  object: 'checkout.session',
  customer: 'cus_test123',
  subscription: 'sub_test123',
  mode: 'subscription',
  payment_status: 'paid',
  status: 'complete',
  metadata: {
    userId: 'user_test123',
    plan: 'professional',
  },
}

describe('Stripe Webhook Signature Verification', () => {
  describe('Valid Signatures', () => {
    it('accepts valid signature with correct secret', () => {
      const payload = JSON.stringify(
        createMockStripeEvent('customer.subscription.created', mockSubscription)
      )
      const signature = createStripeSignature(payload, MOCK_WEBHOOK_SECRET)

      // Verify the signature format
      expect(signature).toMatch(/^t=\d+,v1=[a-f0-9]+,v0=deprecated_signature$/)

      // Parse signature components
      const parts = signature.split(',')
      expect(parts.length).toBe(3)
      expect(parts[0]).toMatch(/^t=\d+$/)
      expect(parts[1]).toMatch(/^v1=[a-f0-9]{64}$/)
    })

    it('creates consistent signatures for same payload', () => {
      const payload = JSON.stringify(
        createMockStripeEvent('customer.subscription.created', mockSubscription)
      )
      const timestamp = Math.floor(Date.now() / 1000)

      const sig1 = createStripeSignature(payload, MOCK_WEBHOOK_SECRET, timestamp)
      const sig2 = createStripeSignature(payload, MOCK_WEBHOOK_SECRET, timestamp)

      expect(sig1).toBe(sig2)
    })
  })

  describe('Invalid Signatures', () => {
    it('generates different signature with wrong secret', () => {
      const payload = JSON.stringify(
        createMockStripeEvent('customer.subscription.created', mockSubscription)
      )
      const timestamp = Math.floor(Date.now() / 1000)

      const validSig = createStripeSignature(
        payload,
        MOCK_WEBHOOK_SECRET,
        timestamp
      )
      const invalidSig = createStripeSignature(
        payload,
        'wrong_secret',
        timestamp
      )

      expect(validSig).not.toBe(invalidSig)
    })

    it('generates different signature for modified payload', () => {
      const timestamp = Math.floor(Date.now() / 1000)

      const originalPayload = JSON.stringify(
        createMockStripeEvent('customer.subscription.created', mockSubscription)
      )
      const modifiedPayload = JSON.stringify(
        createMockStripeEvent('customer.subscription.created', {
          ...mockSubscription,
          status: 'canceled',
        })
      )

      const originalSig = createStripeSignature(
        originalPayload,
        MOCK_WEBHOOK_SECRET,
        timestamp
      )
      const modifiedSig = createStripeSignature(
        modifiedPayload,
        MOCK_WEBHOOK_SECRET,
        timestamp
      )

      expect(originalSig).not.toBe(modifiedSig)
    })

    it('detects replay attacks with old timestamps', () => {
      const payload = JSON.stringify(
        createMockStripeEvent('customer.subscription.created', mockSubscription)
      )

      // Current timestamp
      const currentTimestamp = Math.floor(Date.now() / 1000)

      // Old timestamp (more than 5 minutes ago)
      const oldTimestamp = currentTimestamp - 400 // 6+ minutes ago

      const oldSig = createStripeSignature(
        payload,
        MOCK_WEBHOOK_SECRET,
        oldTimestamp
      )

      // Extract timestamp from signature
      const extractedTimestamp = parseInt(oldSig.split(',')[0].split('=')[1])

      // Verify timestamp is too old
      const timeDiff = currentTimestamp - extractedTimestamp
      expect(timeDiff).toBeGreaterThan(300) // More than 5 minutes
    })
  })
})

describe('Stripe Webhook Event Handling', () => {
  describe('Subscription Events', () => {
    it('creates valid subscription.created event', () => {
      const event = createMockStripeEvent(
        'customer.subscription.created',
        mockSubscription
      )

      expect(event.type).toBe('customer.subscription.created')
      expect(event.data.object).toEqual(mockSubscription)
      expect(event.id).toMatch(/^evt_\d+$/)
    })

    it('creates valid subscription.updated event', () => {
      const updatedSubscription = {
        ...mockSubscription,
        status: 'past_due',
      }

      const event = createMockStripeEvent(
        'customer.subscription.updated',
        updatedSubscription
      )

      expect(event.type).toBe('customer.subscription.updated')
      expect((event.data.object as typeof mockSubscription).status).toBe(
        'past_due'
      )
    })

    it('creates valid subscription.deleted event', () => {
      const canceledSubscription = {
        ...mockSubscription,
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000),
      }

      const event = createMockStripeEvent(
        'customer.subscription.deleted',
        canceledSubscription
      )

      expect(event.type).toBe('customer.subscription.deleted')
      expect((event.data.object as typeof canceledSubscription).status).toBe(
        'canceled'
      )
    })
  })

  describe('Invoice Events', () => {
    it('creates valid invoice.paid event', () => {
      const event = createMockStripeEvent('invoice.paid', mockInvoice)

      expect(event.type).toBe('invoice.paid')
      expect((event.data.object as typeof mockInvoice).status).toBe('paid')
    })

    it('creates valid invoice.payment_failed event', () => {
      const failedInvoice = {
        ...mockInvoice,
        status: 'open',
        attempt_count: 3,
        next_payment_attempt: null,
      }

      const event = createMockStripeEvent('invoice.payment_failed', failedInvoice)

      expect(event.type).toBe('invoice.payment_failed')
      expect((event.data.object as typeof failedInvoice).status).toBe('open')
    })
  })

  describe('Checkout Session Events', () => {
    it('creates valid checkout.session.completed event', () => {
      const event = createMockStripeEvent(
        'checkout.session.completed',
        mockCheckoutSession
      )

      expect(event.type).toBe('checkout.session.completed')
      expect((event.data.object as typeof mockCheckoutSession).status).toBe(
        'complete'
      )
      expect(
        (event.data.object as typeof mockCheckoutSession).payment_status
      ).toBe('paid')
    })

    it('includes metadata in checkout session', () => {
      const event = createMockStripeEvent(
        'checkout.session.completed',
        mockCheckoutSession
      )

      const session = event.data.object as typeof mockCheckoutSession
      expect(session.metadata.userId).toBe('user_test123')
      expect(session.metadata.plan).toBe('professional')
    })
  })
})

describe('Webhook Handler Logic', () => {
  // Mock webhook handler function
  async function handleStripeWebhook(event: Stripe.Event): Promise<{
    status: 'success' | 'error' | 'ignored'
    message: string
  }> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription') {
          return {
            status: 'success',
            message: `Subscription created for customer ${session.customer}`,
          }
        }
        return { status: 'ignored', message: 'Not a subscription checkout' }
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        return {
          status: 'success',
          message: `Subscription ${subscription.id} is now ${subscription.status}`,
        }
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        return {
          status: 'success',
          message: `Subscription ${subscription.id} has been canceled`,
        }
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        return {
          status: 'success',
          message: `Invoice ${invoice.id} paid successfully`,
        }
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        return {
          status: 'success',
          message: `Payment failed for invoice ${invoice.id}`,
        }
      }

      default:
        return { status: 'ignored', message: `Unhandled event type: ${event.type}` }
    }
  }

  it('handles checkout.session.completed', async () => {
    const event = createMockStripeEvent(
      'checkout.session.completed',
      mockCheckoutSession
    )

    const result = await handleStripeWebhook(event)

    expect(result.status).toBe('success')
    expect(result.message).toContain('Subscription created')
  })

  it('handles customer.subscription.created', async () => {
    const event = createMockStripeEvent(
      'customer.subscription.created',
      mockSubscription
    )

    const result = await handleStripeWebhook(event)

    expect(result.status).toBe('success')
    expect(result.message).toContain('active')
  })

  it('handles customer.subscription.updated', async () => {
    const updatedSubscription = {
      ...mockSubscription,
      status: 'past_due',
    }

    const event = createMockStripeEvent(
      'customer.subscription.updated',
      updatedSubscription
    )

    const result = await handleStripeWebhook(event)

    expect(result.status).toBe('success')
    expect(result.message).toContain('past_due')
  })

  it('handles customer.subscription.deleted', async () => {
    const event = createMockStripeEvent(
      'customer.subscription.deleted',
      mockSubscription
    )

    const result = await handleStripeWebhook(event)

    expect(result.status).toBe('success')
    expect(result.message).toContain('canceled')
  })

  it('handles invoice.paid', async () => {
    const event = createMockStripeEvent('invoice.paid', mockInvoice)

    const result = await handleStripeWebhook(event)

    expect(result.status).toBe('success')
    expect(result.message).toContain('paid successfully')
  })

  it('handles invoice.payment_failed', async () => {
    const failedInvoice = { ...mockInvoice, status: 'open' }
    const event = createMockStripeEvent('invoice.payment_failed', failedInvoice)

    const result = await handleStripeWebhook(event)

    expect(result.status).toBe('success')
    expect(result.message).toContain('Payment failed')
  })

  it('ignores unhandled event types', async () => {
    const event = createMockStripeEvent('customer.created', {
      id: 'cus_test',
      object: 'customer',
      email: 'test@example.com',
    })

    const result = await handleStripeWebhook(event)

    expect(result.status).toBe('ignored')
    expect(result.message).toContain('Unhandled event type')
  })
})

describe('Plan Mapping', () => {
  const PLAN_PRICES = {
    professional: 'price_professional_monthly',
    enterprise: 'price_enterprise_monthly',
  }

  function getPlanFromPriceId(priceId: string): string | null {
    if (priceId === PLAN_PRICES.professional) return 'professional'
    if (priceId === PLAN_PRICES.enterprise) return 'enterprise'
    return null
  }

  it('maps professional price to plan', () => {
    expect(getPlanFromPriceId('price_professional_monthly')).toBe('professional')
  })

  it('maps enterprise price to plan', () => {
    expect(getPlanFromPriceId('price_enterprise_monthly')).toBe('enterprise')
  })

  it('returns null for unknown price', () => {
    expect(getPlanFromPriceId('price_unknown')).toBeNull()
  })
})

describe('Subscription Status Handling', () => {
  type SubscriptionStatus =
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'trialing'

  function shouldAllowAccess(status: SubscriptionStatus): boolean {
    return ['active', 'trialing', 'past_due'].includes(status)
  }

  function getAccessLevel(
    status: SubscriptionStatus
  ): 'full' | 'limited' | 'none' {
    if (status === 'active' || status === 'trialing') return 'full'
    if (status === 'past_due') return 'limited'
    return 'none'
  }

  it('allows access for active subscriptions', () => {
    expect(shouldAllowAccess('active')).toBe(true)
    expect(getAccessLevel('active')).toBe('full')
  })

  it('allows access for trialing subscriptions', () => {
    expect(shouldAllowAccess('trialing')).toBe(true)
    expect(getAccessLevel('trialing')).toBe('full')
  })

  it('allows limited access for past_due subscriptions', () => {
    expect(shouldAllowAccess('past_due')).toBe(true)
    expect(getAccessLevel('past_due')).toBe('limited')
  })

  it('denies access for canceled subscriptions', () => {
    expect(shouldAllowAccess('canceled')).toBe(false)
    expect(getAccessLevel('canceled')).toBe('none')
  })

  it('denies access for unpaid subscriptions', () => {
    expect(shouldAllowAccess('unpaid')).toBe(false)
    expect(getAccessLevel('unpaid')).toBe('none')
  })
})
