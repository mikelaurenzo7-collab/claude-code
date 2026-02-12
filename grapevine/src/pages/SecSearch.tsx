import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { searchSecCompanies, getSecFilings, getSecCompanyFacts, extractFinancialsFromFacts } from '@/api/sec'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { SecCompanySearch, SecFiling } from '@/types/market'
import { Search, FileText, ExternalLink, Loader2, Database, TrendingUp } from 'lucide-react'

export default function SecSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SecCompanySearch[]>([])
  const [filings, setFilings] = useState<SecFiling[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [financials, setFinancials] = useState<{ revenue: number[]; netIncome: number[]; assets: number[]; periods: string[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingFilings, setLoadingFilings] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setResults([])
    setFilings([])
    setFinancials(null)
    try {
      const res = await searchSecCompanies(query)
      setResults(res)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleSelectCompany = async (cik: string, name: string) => {
    setSelectedCompany(name)
    setLoadingFilings(true)
    try {
      const [filingsData, factsData] = await Promise.all([
        getSecFilings(cik),
        getSecCompanyFacts(cik),
      ])
      setFilings(filingsData)
      if (factsData) {
        setFinancials(extractFinancialsFromFacts(factsData))
      }
    } catch (err) {
      console.error(err)
    }
    setLoadingFilings(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SEC EDGAR Search</h1>
        <p className="text-sm text-muted-foreground">
          Search real SEC filings and extract financial data from XBRL reports — powered by live SEC EDGAR API
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search SEC filings (e.g., Apple, Tesla, Microsoft)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search SEC'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-4 w-4" /> Search Results</CardTitle>
            <CardDescription>{results.length} companies found in SEC EDGAR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((r) => (
                <button
                  key={r.cik}
                  onClick={() => handleSelectCompany(r.cik, r.name)}
                  className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent/50"
                >
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">CIK: {r.cik}{r.ticker ? ` | Ticker: ${r.ticker}` : ''}</p>
                  </div>
                  <Badge variant="outline">View Filings</Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loadingFilings && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading filings and financial data...</span>
          </CardContent>
        </Card>
      )}

      {financials && financials.revenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> XBRL Financial Data — {selectedCompany}</CardTitle>
            <CardDescription>Extracted from SEC 10-K filings (real data)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="p-2 text-left font-medium">Period</th>
                    <th className="p-2 text-right font-medium">Revenue</th>
                    <th className="p-2 text-right font-medium">Net Income</th>
                    <th className="p-2 text-right font-medium">Total Assets</th>
                  </tr>
                </thead>
                <tbody>
                  {financials.periods.map((period, i) => (
                    <tr key={period} className="border-b border-border/50">
                      <td className="p-2">{period}</td>
                      <td className="p-2 text-right">{financials.revenue[i] ? formatCurrency(financials.revenue[i], true) : '—'}</td>
                      <td className={`p-2 text-right ${(financials.netIncome[i] || 0) < 0 ? 'text-red-400' : ''}`}>
                        {financials.netIncome[i] ? formatCurrency(financials.netIncome[i], true) : '—'}
                      </td>
                      <td className="p-2 text-right">{financials.assets[i] ? formatCurrency(financials.assets[i], true) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Recent Filings — {selectedCompany}</CardTitle>
            <CardDescription>{filings.length} filings found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filings.slice(0, 30).map((filing) => (
                <a
                  key={filing.accession_number}
                  href={filing.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={filing.form_type.includes('10-K') ? 'default' : filing.form_type.includes('10-Q') ? 'secondary' : 'outline'}>
                      {filing.form_type}
                    </Badge>
                    <span className="text-sm">{filing.company_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatDate(filing.filed_date)}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
