import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/appStore'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { TrendingUp, Building2 } from 'lucide-react'

export default function FundIntelligence() {
  const { investors, fundingRounds } = useAppStore()

  const investorActivity = useMemo(() => {
    return investors.slice(0, 8).map((inv) => ({
      name: inv.name.split(' ').slice(0, 2).join(' '),
      aum: (inv.aum || 0) / 1e9,
      deals: inv.portfolio_count,
      type: inv.type,
    }))
  }, [investors])

  const roundsByType = useMemo(() => {
    const counts: Record<string, { count: number; total: number }> = {}
    fundingRounds.forEach((r) => {
      if (!counts[r.round_type]) counts[r.round_type] = { count: 0, total: 0 }
      counts[r.round_type].count++
      counts[r.round_type].total += r.amount_raised
    })
    return Object.entries(counts).map(([name, data]) => ({ name, ...data }))
  }, [fundingRounds])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fund Intelligence</h1>
        <p className="text-sm text-muted-foreground">LP/GP analytics, fund performance, and commitment tracking</p>
      </div>

      {/* Investor Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Tracked Investors</p>
            <p className="text-3xl font-bold">{investors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Total AUM</p>
            <p className="text-3xl font-bold">{formatCurrency(investors.reduce((s, i) => s + (i.aum || 0), 0), true)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Funding Rounds Tracked</p>
            <p className="text-3xl font-bold">{fundingRounds.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Investor AUM Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investorActivity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                <XAxis type="number" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} tickFormatter={(v) => `$${v}B`} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ background: 'hsl(222, 47%, 8%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: '8px' }} formatter={(v: number) => [`$${v.toFixed(0)}B`, 'AUM']} />
                <Bar dataKey="aum" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Funding by Round Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roundsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1e9).toFixed(0)}B`} />
                <Tooltip contentStyle={{ background: 'hsl(222, 47%, 8%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: '8px' }} formatter={(v: number) => [formatCurrency(v, true), 'Total Raised']} />
                <Bar dataKey="total" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Investor Table */}
      <Card>
        <CardHeader><CardTitle>Investor Profiles</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="p-3 font-medium">Investor</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium text-right">AUM</th>
                  <th className="p-3 font-medium text-right">Portfolio</th>
                  <th className="p-3 font-medium">Focus</th>
                  <th className="p-3 font-medium">HQ</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="p-3 font-medium">{inv.name}</td>
                    <td className="p-3"><Badge variant="outline">{inv.type}</Badge></td>
                    <td className="p-3 text-right font-mono">{inv.aum ? formatCurrency(inv.aum, true) : '—'}</td>
                    <td className="p-3 text-right">{inv.portfolio_count}</td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {inv.focus_sectors.slice(0, 2).map((s) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{inv.hq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
