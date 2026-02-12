import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/stores/appStore'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import { Search, AlertTriangle, TrendingDown, FileText } from 'lucide-react'

export default function DistressedAssets() {
  const { distressedAssets } = useAppStore()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    return distressedAssets.filter((asset) => {
      if (search && !asset.company_name.toLowerCase().includes(search.toLowerCase())) return false
      if (typeFilter !== 'all' && asset.asset_type !== typeFilter) return false
      if (statusFilter !== 'all' && asset.status !== statusFilter) return false
      return true
    })
  }, [distressedAssets, search, typeFilter, statusFilter])

  const totalValue = filtered.reduce((s, a) => s + a.estimated_value, 0)
  const avgDiscount = filtered.length > 0 ? filtered.reduce((s, a) => s + a.discount_pct, 0) / filtered.length : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Distressed Assets & Special Situations</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} opportunities &middot; {formatCurrency(totalValue, true)} total estimated value &middot; {avgDiscount.toFixed(0)}% avg discount</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Bankruptcy">Bankruptcy</SelectItem>
            <SelectItem value="Receivership">Receivership</SelectItem>
            <SelectItem value="Turnaround">Turnaround</SelectItem>
            <SelectItem value="Tax Lien">Tax Lien</SelectItem>
            <SelectItem value="Foreclosure">Foreclosure</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Under Review">Under Review</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((asset) => (
          <Card key={asset.id} className="transition-colors hover:border-yellow-400/40">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{asset.company_name}</h3>
                    <p className="text-xs text-muted-foreground">{asset.sector} &middot; {asset.location}</p>
                  </div>
                </div>
                <Badge variant={asset.status === 'Active' ? 'success' : asset.status === 'Closed' ? 'secondary' : 'warning'}>
                  {asset.status}
                </Badge>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{asset.description}</p>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded bg-muted/50 p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Est. Value</p>
                  <p className="text-sm font-bold">{formatCurrency(asset.estimated_value, true)}</p>
                </div>
                <div className="rounded bg-muted/50 p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Discount</p>
                  <p className="text-sm font-bold text-emerald-400">{asset.discount_pct}%</p>
                </div>
                <div className="rounded bg-muted/50 p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Type</p>
                  <p className="text-sm font-bold">{asset.asset_type}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{asset.source}</span>
                <span>Filed {formatDate(asset.filing_date)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
