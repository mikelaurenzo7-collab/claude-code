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
import { formatCompactCurrency, getConfidenceLabel } from '@/lib/utils'
import { getSupportedIndustries } from '@/lib/valuation'
import { Search, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginatedResponse, Company } from '@/types'

async function fetchCompanies(params: URLSearchParams): Promise<PaginatedResponse<Company>> {
  const response = await fetch(`/api/companies?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch companies')
  }
  return response.json()
}

export default function CompaniesPage() {
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState<string>('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const params = new URLSearchParams()
  params.set('page', page.toString())
  params.set('pageSize', pageSize.toString())
  if (search) params.set('search', search)
  if (industry) params.set('industry', industry)

  const { data, isLoading, error } = useQuery({
    queryKey: ['companies', page, search, industry],
    queryFn: () => fetchCompanies(params),
  })

  const industries = getSupportedIndustries()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Companies</h1>
        <p className="text-muted-foreground">
          Search and analyze private company valuations
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={industry}
              onValueChange={(value) => {
                setIndustry(value === 'all' ? '' : value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
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
            <p className="text-destructive">Failed to load companies</p>
          </CardContent>
        </Card>
      ) : data?.data.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No companies found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((company) => (
              <Link key={company.id} href={`/dashboard/companies/${company.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      {company.confidence_score && (
                        <Badge
                          variant={
                            company.confidence_score >= 0.9
                              ? 'success'
                              : company.confidence_score >= 0.75
                                ? 'warning'
                                : 'secondary'
                          }
                        >
                          {getConfidenceLabel(company.confidence_score)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {company.industry && <Badge variant="outline">{company.industry}</Badge>}
                      {company.city && company.state && (
                        <span>
                          {company.city}, {company.state}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {company.valuation_cents && (
                        <div>
                          <span className="text-2xl font-bold">
                            {formatCompactCurrency(company.valuation_cents)}
                          </span>
                          <span className="ml-2 text-sm text-muted-foreground">Valuation</span>
                        </div>
                      )}
                      {company.revenue_cents && (
                        <div className="text-sm text-muted-foreground">
                          Revenue: {formatCompactCurrency(company.revenue_cents)}
                        </div>
                      )}
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
