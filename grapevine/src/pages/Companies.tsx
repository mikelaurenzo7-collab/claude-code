import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/stores/appStore'
import { formatCurrency, getGradeColor } from '@/lib/utils'
import { computeInvestmentScore, computeSectorMultiples } from '@/lib/valuation/scoring'
import { Search, Building2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import type { Sector, Stage } from '@/types/company'

export default function Companies() {
  const { companies, financials, fundingRounds, precedentTransactions, watchlist, addToWatchlist, removeFromWatchlist } = useAppStore()

  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState<string>('all')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'revenue'>('score')

  const allRevenues = useMemo(() => {
    const latestByCompany = new Map<string, number>()
    financials.forEach((f) => {
      const rev = f.arr || f.revenue
      const existing = latestByCompany.get(f.company_id) || 0
      if (rev > existing) latestByCompany.set(f.company_id, rev)
    })
    return Array.from(latestByCompany.values())
  }, [financials])

  const companiesWithScores = useMemo(() => {
    return companies.map((company) => {
      const companyFins = financials.filter((f) => f.company_id === company.id)
      const companyRounds = fundingRounds.filter((r) => r.company_id === company.id)
      const latestFunding = companyRounds.length > 0 ? companyRounds[companyRounds.length - 1] : undefined
      const sectorMultiples = computeSectorMultiples(precedentTransactions, company.sector)
      const sectorTxns = precedentTransactions.filter((t) => t.sector === company.sector)

      const score = computeInvestmentScore(
        company,
        companyFins,
        latestFunding,
        allRevenues,
        sectorMultiples,
        sectorTxns.length,
        companyRounds.length,
        sectorTxns.length
      )

      const latestFin = companyFins.length > 0 ? companyFins[companyFins.length - 1] : null

      return { company, score, latestFin, latestFunding }
    })
  }, [companies, financials, fundingRounds, precedentTransactions, allRevenues])

  const filtered = useMemo(() => {
    return companiesWithScores
      .filter((item) => {
        if (search && !item.company.name.toLowerCase().includes(search.toLowerCase())) return false
        if (sectorFilter !== 'all' && item.company.sector !== sectorFilter) return false
        if (stageFilter !== 'all' && item.company.stage !== stageFilter) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.company.name.localeCompare(b.company.name)
        if (sortBy === 'score') return b.score.overall - a.score.overall
        if (sortBy === 'revenue') return (b.latestFin?.revenue || 0) - (a.latestFin?.revenue || 0)
        return 0
      })
  }, [companiesWithScores, search, sectorFilter, stageFilter, sortBy])

  const sectors: Sector[] = ['Technology', 'Healthcare', 'Financial Services', 'Consumer', 'Industrial', 'Energy', 'Real Estate', 'Media']
  const stages: Stage[] = ['Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Growth', 'Pre-IPO']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} private companies tracked</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sector" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {sectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Sort: Score</SelectItem>
            <SelectItem value="name">Sort: Name</SelectItem>
            <SelectItem value="revenue">Sort: Revenue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Company Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(({ company, score, latestFin, latestFunding }) => {
          const isWatched = watchlist.includes(company.id)
          return (
            <Card key={company.id} className="transition-colors hover:border-primary/40">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Link to={`/companies/${company.id}`} className="flex items-center gap-3 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                      {company.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold">{company.name}</h3>
                      <p className="text-xs text-muted-foreground">{company.sector} &middot; {company.stage}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => isWatched ? removeFromWatchlist(company.id) : addToWatchlist(company.id)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isWatched ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getGradeColor(score.grade)}`}>{score.grade}</p>
                      <p className="text-xs text-muted-foreground">{score.overall}/100</p>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{company.description}</p>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded bg-muted/50 p-2">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-sm font-semibold">{latestFin ? formatCurrency(latestFin.revenue, true) : 'N/A'}</p>
                  </div>
                  <div className="rounded bg-muted/50 p-2">
                    <p className="text-xs text-muted-foreground">Valuation</p>
                    <p className="text-sm font-semibold">{latestFunding ? formatCurrency(latestFunding.post_money_valuation, true) : 'N/A'}</p>
                  </div>
                  <div className="rounded bg-muted/50 p-2">
                    <p className="text-xs text-muted-foreground">Employees</p>
                    <p className="text-sm font-semibold">{company.employee_count.toLocaleString()}</p>
                  </div>
                </div>

                {score.insights.length > 0 && (
                  <p className="mt-2 text-xs text-primary/80 italic">{score.insights[0]}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
