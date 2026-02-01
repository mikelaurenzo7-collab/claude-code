'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Check } from 'lucide-react'
import { PLAN_LIMITS } from '@/types'

interface SubscriptionData {
  data: {
    plan_tier: string
    status: string
    monthly_views_used: number
    monthly_views_limit: number | null
    current_period_end?: string
    cancel_at_period_end?: boolean
    limits: {
      monthlyViews: number
      trackedAssets: number
      pdfExports: number
      csvExports: boolean
      apiAccess: boolean
    }
  }
}

async function fetchSubscription(): Promise<SubscriptionData> {
  const response = await fetch('/api/subscriptions')
  if (!response.ok) throw new Error('Failed to fetch subscription')
  return response.json()
}

async function createCheckout(plan: string, interval: string) {
  const response = await fetch('/api/subscriptions/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, interval }),
  })
  if (!response.ok) throw new Error('Failed to create checkout')
  return response.json()
}

async function createPortal() {
  const response = await fetch('/api/subscriptions/portal', {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to create portal')
  return response.json()
}

const plans = [
  {
    name: 'Free',
    tier: 'free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '10 asset views per month',
      'Basic search',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    tier: 'professional',
    monthlyPrice: 2500,
    yearlyPrice: 25000,
    features: [
      'Unlimited searches',
      'Track up to 50 assets',
      '20 PDF exports per month',
      'Weekly valuation updates',
      'Email support',
    ],
  },
  {
    name: 'Enterprise',
    tier: 'enterprise',
    monthlyPrice: 5000,
    yearlyPrice: 50000,
    features: [
      'Everything in Professional',
      'Unlimited tracking',
      'Unlimited exports',
      'Daily valuation updates',
      'API access',
      'Priority support',
      'Custom onboarding',
    ],
  },
]

export default function SettingsPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('yearly')
  const { toast } = useToast()

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
  })

  const checkoutMutation = useMutation({
    mutationFn: ({ plan, interval }: { plan: string; interval: string }) =>
      createCheckout(plan, interval),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to start checkout',
        variant: 'destructive',
      })
    },
  })

  const portalMutation = useMutation({
    mutationFn: createPortal,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to open billing portal',
        variant: 'destructive',
      })
    },
  })

  const currentPlan = subscription?.data?.plan_tier || 'free'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your subscription and account settings
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold capitalize">{currentPlan}</span>
                <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'}>
                  {subscription?.data?.status || 'Active'}
                </Badge>
              </div>
              {subscription?.data?.current_period_end && (
                <p className="text-sm text-muted-foreground">
                  {subscription.data.cancel_at_period_end
                    ? `Cancels on ${new Date(subscription.data.current_period_end).toLocaleDateString()}`
                    : `Renews on ${new Date(subscription.data.current_period_end).toLocaleDateString()}`}
                </p>
              )}
            </div>
            {currentPlan !== 'free' && (
              <Button
                variant="outline"
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
              >
                Manage Billing
              </Button>
            )}
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Views Used</p>
              <p className="text-lg font-semibold">
                {subscription?.data?.monthly_views_used || 0}
                {subscription?.data?.monthly_views_limit && (
                  <span className="text-muted-foreground">
                    /{subscription.data.monthly_views_limit}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tracked Assets</p>
              <p className="text-lg font-semibold">
                {subscription?.data?.limits?.trackedAssets === Infinity
                  ? 'Unlimited'
                  : subscription?.data?.limits?.trackedAssets || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PDF Exports</p>
              <p className="text-lg font-semibold">
                {subscription?.data?.limits?.pdfExports === Infinity
                  ? 'Unlimited'
                  : subscription?.data?.limits?.pdfExports || 0}
                /month
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">API Access</p>
              <p className="text-lg font-semibold">
                {subscription?.data?.limits?.apiAccess ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Plans</h2>
          <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
            <button
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setBillingInterval('monthly')}
            >
              Monthly
            </button>
            <button
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                billingInterval === 'yearly'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setBillingInterval('yearly')}
            >
              Yearly
              <Badge variant="secondary" className="ml-2">
                Save 17%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const price =
              billingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
            const isCurrentPlan = currentPlan === plan.tier

            return (
              <Card
                key={plan.tier}
                className={isCurrentPlan ? 'border-primary' : ''}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {isCurrentPlan && <Badge>Current</Badge>}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      ${(price / 100).toLocaleString()}
                    </span>
                    {plan.tier !== 'free' && (
                      <span className="text-muted-foreground">
                        /{billingInterval === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.tier === 'free' ? (
                    <Button variant="outline" className="w-full" disabled>
                      {isCurrentPlan ? 'Current Plan' : 'Downgrade'}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={isCurrentPlan || checkoutMutation.isPending}
                      onClick={() =>
                        checkoutMutation.mutate({
                          plan: plan.tier,
                          interval: billingInterval,
                        })
                      }
                    >
                      {isCurrentPlan
                        ? 'Current Plan'
                        : currentPlan === 'free'
                          ? 'Upgrade'
                          : 'Switch Plan'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
