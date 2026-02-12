import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/appStore'
import { formatCurrency, getGradeColor } from '@/lib/utils'
import { computeInvestmentScore, computeSectorMultiples } from '@/lib/valuation/scoring'
import { Eye, EyeOff, ExternalLink } from 'lucide-react'

export default function Watchlists() {
  const { companies, financials, fundingRounds, precedentTransactions, watchlist, removeFromWatchlist } = useAppStore()

  const allRevenues = useMemo(() => {
    const latest = new Map<string, number>()
    financials.forEach((f) => {
      const rev = f.arr || f.revenue
      if (rev > (latest.get(f.company_id) || 0)) latest.set(f.company_id, rev)
    })
    return Array.from(latest.values())
  }, [financials])

  const watchedCompanies = useMemo(() => {
    return watchlist.map((id) => {
      const company = companies.find((c) => c.id === id)
      if (!company) return null
      const fins = financials.filter((f) => f.company_id === id)
      const rounds = fundingRounds.filter((r) => r.company_id === id)
      const latestFunding = rounds[rounds.length - 1]
      const latestFin = fins[fins.length - 1]
      const sectorMult = computeSectorMultiples(precedentTransactions, company.sector)
      const sectorTxns = precedentTransactions.filter((t) => t.sector === company.sector)
      const score = computeInvestmentScore(company, fins, latestFunding, allRevenues, sectorMult, sectorTxns.length, rounds.length, sectorTxns.length)
      return { company, score, latestFin, latestFunding }
    }).filter(Boolean) as Array<{ company: typeof companies[0]; score: ReturnType<typeof computeInvestmentScore>; latestFin: typeof financials[0] | undefined; latestFunding: typeof fundingRounds[0] | undefined }>
  }, [watchlist, companies, financials, fundingRounds, precedentTransactions, allRevenues])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Watchlists</h1>
        <p className="text-sm text-muted-foreground">{watchedCompanies.length} companies being watched</p>
      </div>

      {watchedCompanies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Eye className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No companies in your watchlist</p>
            <Link to="/companies"><Button variant="outline" className="mt-4">Browse Companies</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="p-3 font-medium">Company</th>
                <th className="p-3 font-medium">Sector</th>
                <th className="p-3 font-medium">Stage</th>
                <th className="p-3 font-medium text-right">Revenue</th>
                <th className="p-3 font-medium text-right">Valuation</th>
                <th className="p-3 font-medium text-right">Score</th>
                <th className="p-3 font-medium text-right">Grade</th>
                <th className="p-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchedCompanies.map(({ company, score, latestFin, latestFunding }) => (
                <tr key={company.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="p-3">
                    <Link to={`/companies/${company.id}`} className="font-medium hover:text-primary">{company.name}</Link>
                  </td>
                  <td className="p-3"><Badge variant="secondary">{company.sector}</Badge></td>
                  <td className="p-3"><Badge variant="outline">{company.stage}</Badge></td>
                  <td className="p-3 text-right font-mono">{latestFin ? formatCurrency(latestFin.revenue, true) : '—'}</td>
                  <td className="p-3 text-right font-mono">{latestFunding ? formatCurrency(latestFunding.post_money_valuation, true) : '—'}</td>
                  <td className="p-3 text-right font-mono">{score.overall}</td>
                  <td className={`p-3 text-right font-bold ${getGradeColor(score.grade)}`}>{score.grade}</td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => removeFromWatchlist(company.id)}>
                      <EyeOff className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
