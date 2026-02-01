import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCompactCurrency, formatNumber } from '@/lib/utils'
import { Building2, Home, Eye, BookmarkIcon } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get subscription info
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get recent views
  const { data: recentViews } = await supabase
    .from('asset_views')
    .select('*')
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false })
    .limit(5)

  // Get tracked assets count
  const { count: trackedCount } = await supabase
    .from('tracked_assets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get database stats
  const { count: companiesCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  const { count: realEstateCount } = await supabase
    .from('real_estate')
    .select('*', { count: 'exact', head: true })

  const planTier = subscription?.plan_tier || 'free'
  const viewsUsed = subscription?.monthly_views_used || 0
  const viewsLimit = subscription?.monthly_views_limit || 10

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.user_metadata?.name || user.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(companiesCount || 0)}</div>
            <p className="text-xs text-muted-foreground">Private companies in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(realEstateCount || 0)}</div>
            <p className="text-xs text-muted-foreground">Real estate assets in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Views Used</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {planTier === 'free' ? `${viewsUsed}/${viewsLimit}` : 'Unlimited'}
            </div>
            <p className="text-xs text-muted-foreground">
              {planTier === 'free' ? 'This month' : 'Professional plan'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tracked</CardTitle>
            <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(trackedCount || 0)}</div>
            <p className="text-xs text-muted-foreground">Assets being tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA for free users */}
      {planTier === 'free' && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Upgrade to Professional</CardTitle>
            <CardDescription>
              Get unlimited views, track up to 50 assets, and export PDF reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/settings">
              <Button>View Plans</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search Companies</CardTitle>
            <CardDescription>
              Find and analyze private companies with our valuation engine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/companies">
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
                Browse Companies
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search Real Estate</CardTitle>
            <CardDescription>
              Explore commercial real estate assets with accurate valuations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/real-estate">
              <Button>
                <Home className="mr-2 h-4 w-4" />
                Browse Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentViews && recentViews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recently viewed assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentViews.map((view) => (
                <div
                  key={view.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {view.asset_type === 'company' ? (
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Home className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <Badge variant="outline">
                        {view.asset_type === 'company' ? 'Company' : 'Property'}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(view.viewed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
