import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/stores/appStore'
import { formatCurrency, formatPercent, getGradeColor, cagr } from '@/lib/utils'
import { computeInvestmentScore, computeSectorMultiples } from '@/lib/valuation/scoring'
import { computeFootballField } from '@/lib/valuation/footballField'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { ArrowLeft, ExternalLink, MapPin, Users, Calendar, Eye, EyeOff } from 'lucide-react'

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const {
    getCompanyWithFinancials, financials, fundingRounds, precedentTransactions,
    watchlist, addToWatchlist, removeFromWatchlist,
  } = useAppStore()

  const company = id ? getCompanyWithFinancials(id) : null

  const allRevenues = useMemo(() => {
    const latest = new Map<string, number>()
    financials.forEach((f) => {
      const rev = f.arr || f.revenue
      if (rev > (latest.get(f.company_id) || 0)) latest.set(f.company_id, rev)
    })
    return Array.from(latest.values())
  }, [financials])

  const score = useMemo(() => {
    if (!company) return null
    const sectorMult = computeSectorMultiples(precedentTransactions, company.sector)
    const sectorTxns = precedentTransactions.filter((t) => t.sector === company.sector)
    return computeInvestmentScore(
      company, company.financials, company.latest_funding, allRevenues,
      sectorMult, sectorTxns.length, company.funding_rounds.length, sectorTxns.length
    )
  }, [company, allRevenues, precedentTransactions])

  const footballField = useMemo(() => {
    if (!company?.latest_financial) return []
    const sectorMult = computeSectorMultiples(precedentTransactions, company.sector)
    return computeFootballField(company.latest_financial.revenue, company.latest_financial.ebitda, sectorMult)
  }, [company, precedentTransactions])

  if (!company) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Company not found</div>
  }

  const isWatched = watchlist.includes(company.id)
  const revenueData = company.financials.map((f) => ({
    period: f.period,
    revenue: f.revenue / 1e6,
    ebitda: f.ebitda / 1e6,
    margin: f.gross_margin * 100,
  }))

  const radarData = score ? [
    { metric: 'Scale', value: score.subscores.scale },
    { metric: 'Valuation', value: score.subscores.valuation },
    { metric: 'Growth', value: score.subscores.growth },
    { metric: 'Momentum', value: score.subscores.momentum },
    { metric: 'Efficiency', value: score.subscores.efficiency },
    { metric: 'Capital', value: score.subscores.capital },
  ] : []

  return (
    <div className="space-y-6">
      <Link to="/companies" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Companies
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
            {company.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <Badge variant="outline">{company.stage}</Badge>
              <Badge variant="secondary">{company.sector}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{company.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.hq_city}, {company.hq_state}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Founded {company.founded}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{company.employee_count.toLocaleString()} employees</span>
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> Website
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => isWatched ? removeFromWatchlist(company.id) : addToWatchlist(company.id)}>
            {isWatched ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
            {isWatched ? 'Watching' : 'Watch'}
          </Button>
          {score && (
            <div className="text-center">
              <p className={`text-4xl font-bold ${getGradeColor(score.grade)}`}>{score.grade}</p>
              <p className="text-xs text-muted-foreground">{score.overall}/100</p>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Key Metrics */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Key Metrics</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {company.latest_financial && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-xl font-bold">{formatCurrency(company.latest_financial.revenue, true)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ARR</p>
                        <p className="text-xl font-bold">{company.latest_financial.arr ? formatCurrency(company.latest_financial.arr, true) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">EBITDA</p>
                        <p className="text-xl font-bold">{formatCurrency(company.latest_financial.ebitda, true)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Gross Margin</p>
                        <p className="text-xl font-bold">{formatPercent(company.latest_financial.gross_margin, 0)}</p>
                      </div>
                    </>
                  )}
                  {company.latest_funding && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">Valuation</p>
                        <p className="text-xl font-bold">{formatCurrency(company.latest_funding.post_money_valuation, true)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Round</p>
                        <p className="text-xl font-bold">{company.latest_funding.round_type}</p>
                      </div>
                    </>
                  )}
                  {score && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">EV/Revenue</p>
                        <p className="text-xl font-bold">{score.implied_ev_revenue?.toFixed(1)}x</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Rule of 40</p>
                        <p className="text-xl font-bold">{score.rule_of_40?.toFixed(0)}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Score Radar */}
            <Card>
              <CardHeader><CardTitle>Score Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(217, 33%, 17%)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} />
                    <PolarRadiusAxis tick={false} domain={[0, 100]} />
                    <Radar dataKey="value" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          {score && score.insights.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Investment Insights</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {score.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="financials" className="space-y-6 mt-4">
          <Card>
            <CardHeader><CardTitle>Revenue & EBITDA Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis dataKey="period" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} tickFormatter={(v) => `$${v}M`} />
                  <Tooltip contentStyle={{ background: 'hsl(222, 47%, 8%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: '8px' }} />
                  <Bar dataKey="revenue" name="Revenue ($M)" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ebitda" name="EBITDA ($M)" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Financial History</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="py-2 text-left font-medium">Period</th>
                      <th className="py-2 text-right font-medium">Revenue</th>
                      <th className="py-2 text-right font-medium">ARR</th>
                      <th className="py-2 text-right font-medium">EBITDA</th>
                      <th className="py-2 text-right font-medium">Gross Margin</th>
                      <th className="py-2 text-right font-medium">Net Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.financials.map((f) => (
                      <tr key={f.id} className="border-b border-border/50">
                        <td className="py-2 font-medium">{f.period}</td>
                        <td className="py-2 text-right font-mono">{formatCurrency(f.revenue, true)}</td>
                        <td className="py-2 text-right font-mono">{f.arr ? formatCurrency(f.arr, true) : '—'}</td>
                        <td className={`py-2 text-right font-mono ${f.ebitda < 0 ? 'text-red-400' : ''}`}>{formatCurrency(f.ebitda, true)}</td>
                        <td className="py-2 text-right font-mono">{formatPercent(f.gross_margin, 0)}</td>
                        <td className={`py-2 text-right font-mono ${f.net_income < 0 ? 'text-red-400' : ''}`}>{formatCurrency(f.net_income, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funding" className="space-y-6 mt-4">
          <Card>
            <CardHeader><CardTitle>Funding History</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {company.funding_rounds.length === 0 && <p className="text-sm text-muted-foreground">No funding data available</p>}
                {company.funding_rounds.map((round) => (
                  <div key={round.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {round.round_type.substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{round.round_type}</p>
                        <Badge variant="outline">{new Date(round.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Led by {round.lead_investor} &middot; {round.investors.length} investors
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(round.amount_raised, true)}</p>
                      <p className="text-xs text-muted-foreground">@ {formatCurrency(round.post_money_valuation, true)} post</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valuation" className="space-y-6 mt-4">
          {/* Football Field */}
          {footballField.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Valuation Football Field</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {footballField.map((range) => {
                    const maxVal = Math.max(...footballField.map((r) => r.high))
                    const scale = (v: number) => (v / maxVal) * 100
                    return (
                      <div key={range.methodology} className="flex items-center gap-3">
                        <p className="w-32 text-xs font-medium text-right">{range.methodology}</p>
                        <div className="flex-1 relative h-8">
                          <div className="absolute inset-y-0 rounded" style={{
                            left: `${scale(range.low)}%`,
                            width: `${scale(range.high) - scale(range.low)}%`,
                            backgroundColor: range.color + '30',
                            border: `1px solid ${range.color}`,
                          }}>
                            <div className="absolute top-1/2 -translate-y-1/2 h-4 w-0.5 rounded" style={{
                              left: `${((range.mid - range.low) / (range.high - range.low)) * 100}%`,
                              backgroundColor: range.color,
                            }} />
                          </div>
                        </div>
                        <div className="w-44 text-xs text-muted-foreground font-mono">
                          {formatCurrency(range.low, true)} – {formatCurrency(range.high, true)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Link to={`/valuations?company=${company.id}&tool=dcf`}>
              <Button variant="outline">Open DCF Calculator</Button>
            </Link>
            <Link to={`/valuations?company=${company.id}&tool=lbo`}>
              <Button variant="outline">Open LBO Model</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
