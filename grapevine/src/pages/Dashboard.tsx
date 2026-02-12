import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/appStore'
import { formatCurrency, formatPercent, formatRelativeDate, getSentimentColor } from '@/lib/utils'
import { demoIndicators } from '@/api/fred'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import {
  Building2, DollarSign, TrendingUp, AlertTriangle, Newspaper, Activity,
  ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4']

export default function Dashboard() {
  const { companies, deals, distressedAssets, realEstateListings, intelligenceSignals, financials } = useAppStore()

  const stats = useMemo(() => {
    const totalDealValue = deals.reduce((sum, d) => sum + d.deal_size, 0)
    const activeDeals = deals.filter((d) => !['Closed', 'Passed'].includes(d.stage)).length
    const totalCompanies = companies.length
    const activeDistressed = distressedAssets.filter((a) => a.status === 'Active').length

    return { totalDealValue, activeDeals, totalCompanies, activeDistressed }
  }, [companies, deals, distressedAssets])

  const sectorData = useMemo(() => {
    const counts: Record<string, number> = {}
    companies.forEach((c) => { counts[c.sector] = (counts[c.sector] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [companies])

  const revenueChartData = useMemo(() => {
    const periods = ['FY2022', 'FY2023', 'FY2024']
    return periods.map((period) => {
      const periodFins = financials.filter((f) => f.period === period)
      const totalRev = periodFins.reduce((sum, f) => sum + f.revenue, 0)
      return { period, revenue: totalRev / 1e9 }
    })
  }, [financials])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Private market intelligence overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Companies Tracked</p>
                <p className="text-3xl font-bold">{stats.totalCompanies}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Deal Value</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalDealValue, true)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-400 opacity-80" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{stats.activeDeals} active deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Distressed Opportunities</p>
                <p className="text-3xl font-bold">{stats.activeDistressed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">RE Listings</p>
                <p className="text-3xl font-bold">{realEstateListings.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Economic Indicators */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Market Indicators (FRED)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {demoIndicators.map((ind) => (
                <div key={ind.series_id} className="rounded-lg border bg-background p-3">
                  <p className="text-xs text-muted-foreground">{ind.title}</p>
                  <p className="text-lg font-semibold font-mono">
                    {ind.unit === '%' ? `${ind.value.toFixed(2)}%` : ind.value.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1">
                    {ind.change_pct > 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                    ) : ind.change_pct < 0 ? (
                      <ArrowDownRight className="h-3 w-3 text-red-400" />
                    ) : (
                      <Minus className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={`text-xs ${ind.change_pct > 0 ? 'text-emerald-400' : ind.change_pct < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                      {formatPercent(Math.abs(ind.change_pct))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sector Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Sector Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sectorData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 47%, 8%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-2">
              {sectorData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1 text-xs">
                  <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {s.name} ({s.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolio Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Aggregate Portfolio Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                <XAxis dataKey="period" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} tickFormatter={(v) => `$${v}B`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 47%, 8%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: '8px' }}
                  formatter={(value: number) => [`$${value.toFixed(1)}B`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Intelligence Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Latest Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {intelligenceSignals.slice(0, 5).map((signal) => (
                <Link
                  to="/intelligence"
                  key={signal.id}
                  className="block rounded-lg border p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">{signal.title}</p>
                    <Badge variant={signal.sentiment === 'positive' ? 'success' : signal.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                      {signal.signal_type}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{signal.source} &middot; {formatRelativeDate(signal.published_at)}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
