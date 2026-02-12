import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/stores/appStore'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import { Search, Home, MapPin } from 'lucide-react'

export default function RealEstate() {
  const { realEstateListings } = useAppStore()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [listingFilter, setListingFilter] = useState('all')

  const filtered = useMemo(() => {
    return realEstateListings.filter((l) => {
      if (search && !l.property_name.toLowerCase().includes(search.toLowerCase()) && !l.city.toLowerCase().includes(search.toLowerCase())) return false
      if (typeFilter !== 'all' && l.type !== typeFilter) return false
      if (listingFilter !== 'all' && l.listing_type !== listingFilter) return false
      return true
    })
  }, [realEstateListings, search, typeFilter, listingFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Off-Market Real Estate</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} listings &middot; {formatCurrency(filtered.reduce((s, l) => s + l.asking_price, 0), true)} total value</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search properties or cities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Multifamily">Multifamily</SelectItem>
            <SelectItem value="Industrial">Industrial</SelectItem>
            <SelectItem value="Office">Office</SelectItem>
            <SelectItem value="Retail">Retail</SelectItem>
            <SelectItem value="Mixed Use">Mixed Use</SelectItem>
          </SelectContent>
        </Select>
        <Select value={listingFilter} onValueChange={setListingFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="Off-Market">Off-Market</SelectItem>
            <SelectItem value="Pocket Listing">Pocket Listing</SelectItem>
            <SelectItem value="1031 Exchange">1031 Exchange</SelectItem>
            <SelectItem value="Pre-Foreclosure">Pre-Foreclosure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((listing) => (
          <Card key={listing.id} className="transition-colors hover:border-blue-400/40">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{listing.property_name}</h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />{listing.city}, {listing.state}
                  </p>
                </div>
                <Badge variant={listing.listing_type === 'Pre-Foreclosure' ? 'warning' : 'info'}>
                  {listing.listing_type}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">{listing.description}</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded bg-muted/50 p-2">
                  <p className="text-[10px] text-muted-foreground">Asking Price</p>
                  <p className="text-lg font-bold">{formatCurrency(listing.asking_price, true)}</p>
                </div>
                <div className="rounded bg-muted/50 p-2">
                  <p className="text-[10px] text-muted-foreground">Cap Rate</p>
                  <p className="text-lg font-bold">{listing.cap_rate.toFixed(1)}%</p>
                </div>
                <div className="rounded bg-muted/50 p-2">
                  <p className="text-[10px] text-muted-foreground">Size</p>
                  <p className="text-sm font-medium">{formatNumber(listing.sqft)} SF{listing.units ? ` / ${listing.units} units` : ''}</p>
                </div>
                <div className="rounded bg-muted/50 p-2">
                  <p className="text-[10px] text-muted-foreground">Occupancy</p>
                  <p className="text-sm font-medium">{listing.occupancy_pct}%</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline">{listing.type}</Badge>
                <span className="text-xs text-muted-foreground">${(listing.asking_price / listing.sqft).toFixed(0)}/SF</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
