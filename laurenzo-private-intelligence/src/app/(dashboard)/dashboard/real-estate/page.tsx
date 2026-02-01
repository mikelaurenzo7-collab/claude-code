'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCompactCurrency, formatNumber, getConfidenceLabel } from '@/lib/utils'
import { getSupportedCities, getSupportedPropertyTypes } from '@/lib/valuation'
import { Search, Home, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginatedResponse, RealEstate } from '@/types'

async function fetchRealEstate(params: URLSearchParams): Promise<PaginatedResponse<RealEstate>> {
  const response = await fetch(`/api/real-estate?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch properties')
  }
  return response.json()
}

export default function RealEstatePage() {
  const [search, setSearch] = useState('')
  const [propertyType, setPropertyType] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const params = new URLSearchParams()
  params.set('page', page.toString())
  params.set('pageSize', pageSize.toString())
  if (search) params.set('search', search)
  if (propertyType) params.set('propertyType', propertyType)
  if (city) params.set('city', city)

  const { data, isLoading, error } = useQuery({
    queryKey: ['real-estate', page, search, propertyType, city],
    queryFn: () => fetchRealEstate(params),
  })

  const cities = getSupportedCities()
  const propertyTypes = getSupportedPropertyTypes()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Real Estate</h1>
        <p className="text-muted-foreground">
          Search and analyze commercial real estate valuations
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={propertyType}
              onValueChange={(value) => {
                setPropertyType(value === 'all' ? '' : value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={city}
              onValueChange={(value) => {
                setCity(value === 'all' ? '' : value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Failed to load properties</p>
          </CardContent>
        </Card>
      ) : data?.data.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Home className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No properties found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((property) => (
              <Link key={property.id} href={`/dashboard/real-estate/${property.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{property.property_name}</CardTitle>
                      {property.confidence_score && (
                        <Badge
                          variant={
                            property.confidence_score >= 0.9
                              ? 'success'
                              : property.confidence_score >= 0.75
                                ? 'warning'
                                : 'secondary'
                          }
                        >
                          {getConfidenceLabel(property.confidence_score)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {property.property_type && (
                        <Badge variant="outline">
                          {property.property_type.charAt(0).toUpperCase() +
                            property.property_type.slice(1)}
                        </Badge>
                      )}
                      {property.property_class && (
                        <Badge variant="secondary">Class {property.property_class}</Badge>
                      )}
                      {property.city && property.state && (
                        <span>
                          {property.city}, {property.state}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {property.valuation_cents && (
                        <div>
                          <span className="text-2xl font-bold">
                            {formatCompactCurrency(property.valuation_cents)}
                          </span>
                          <span className="ml-2 text-sm text-muted-foreground">Valuation</span>
                        </div>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {property.square_feet && (
                          <span>{formatNumber(property.square_feet)} sqft</span>
                        )}
                        {property.cap_rate && <span>{property.cap_rate}% Cap Rate</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, data.total)} of {data.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
