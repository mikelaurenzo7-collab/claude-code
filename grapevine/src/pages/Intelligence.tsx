import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/stores/appStore'
import { formatRelativeDate, getSentimentColor } from '@/lib/utils'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function Intelligence() {
  const { intelligenceSignals } = useAppStore()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sentimentFilter, setSentimentFilter] = useState('all')

  const filtered = useMemo(() => {
    return intelligenceSignals.filter((s) => {
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false
      if (typeFilter !== 'all' && s.signal_type !== typeFilter) return false
      if (sentimentFilter !== 'all' && s.sentiment !== sentimentFilter) return false
      return true
    })
  }, [intelligenceSignals, search, typeFilter, sentimentFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Intelligence Feed</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} market signals</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search signals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Funding">Funding</SelectItem>
            <SelectItem value="M&A">M&A</SelectItem>
            <SelectItem value="IPO">IPO</SelectItem>
            <SelectItem value="Regulatory">Regulatory</SelectItem>
            <SelectItem value="Market Shift">Market Shift</SelectItem>
            <SelectItem value="Personnel">Personnel</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiment</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.map((signal) => (
          <Card key={signal.id} className="transition-colors hover:border-primary/30">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${getSentimentColor(signal.sentiment)}`}>
                    {signal.sentiment === 'positive' ? <TrendingUp className="h-5 w-5" /> : signal.sentiment === 'negative' ? <TrendingDown className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{signal.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{signal.summary}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{signal.signal_type}</Badge>
                      <Badge variant="secondary">{signal.sector}</Badge>
                      {signal.companies.map((c) => (
                        <Badge key={c} variant="outline" className="text-primary">{c}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                  <p>{signal.source}</p>
                  <p>{formatRelativeDate(signal.published_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
