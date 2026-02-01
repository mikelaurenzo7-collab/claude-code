'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercent,
  getConfidenceLabel,
  getConfidenceColor,
} from '@/lib/utils'
import { ArrowLeft, Building2, BookmarkIcon, Download, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CompanyWithValuation {
  data: {
    id: string
    name: string
    industry: string | null
    description: string | null
    website: string | null
    city: string | null
    state: string | null
    country: string
    revenue_cents: number | null
    ebitda_cents: number | null
    valuation_cents: number | null
    employees: number | null
    founded_year: number | null
    growth_rate: number | null
    valuation_date: string | null
    valuation_methodology: string | null
    confidence_score: number | null
    data_sources: string[] | null
    calculatedValuation: {
      valuation: number
      low: number
      high: number
      methodology: string
      confidence: number
      industryMultiple: number
    } | null
  }
}

async function fetchCompany(id: string): Promise<CompanyWithValuation> {
  const response = await fetch(`/api/companies/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch company')
  }
  return response.json()
}

async function trackAsset(assetType: string, assetId: string) {
  const response = await fetch('/api/tracked', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetType, assetId }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to track asset')
  }
  return response.json()
}

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['company', params.id],
    queryFn: () => fetchCompany(params.id),
  })

  const trackMutation = useMutation({
    mutationFn: () => trackAsset('company', params.id),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Company added to tracked assets' })
      queryClient.invalidateQueries({ queryKey: ['tracked'] })
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/companies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </Link>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const company = data?.data
  const valuation = company?.calculatedValuation

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/companies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => trackMutation.mutate()}
            disabled={trackMutation.isPending}
          >
            <BookmarkIcon className="mr-2 h-4 w-4" />
            Track
          </Button>
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Building2 className="h-6 w-6" />
                    {company?.name}
                  </CardTitle>
                  <CardDescription className="mt-2 flex flex-wrap gap-2">
                    {company?.industry && (
                      <Badge variant="outline">{company.industry}</Badge>
                    )}
                    {company?.city && company?.state && (
                      <Badge variant="secondary">
                        {company.city}, {company.state}
                      </Badge>
                    )}
                    {company?.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Website
                      </a>
                    )}
                  </CardDescription>
                </div>
                {valuation && (
                  <Badge
                    className={getConfidenceColor(valuation.confidence)}
                    variant="outline"
                  >
                    {getConfidenceLabel(valuation.confidence)} Confidence
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {company?.description && (
                <p className="text-muted-foreground">{company.description}</p>
              )}
            </CardContent>
          </Card>

          {/* Financials */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {company?.revenue_cents && (
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">
                      {formatCompactCurrency(company.revenue_cents)}
                    </p>
                  </div>
                )}
                {company?.ebitda_cents && (
                  <div>
                    <p className="text-sm text-muted-foreground">EBITDA</p>
                    <p className="text-2xl font-bold">
                      {formatCompactCurrency(company.ebitda_cents)}
                    </p>
                  </div>
                )}
                {company?.employees && (
                  <div>
                    <p className="text-sm text-muted-foreground">Employees</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(company.employees)}
                    </p>
                  </div>
                )}
                {company?.growth_rate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                    <p className="text-2xl font-bold">{company.growth_rate}%</p>
                  </div>
                )}
                {company?.founded_year && (
                  <div>
                    <p className="text-sm text-muted-foreground">Founded</p>
                    <p className="text-2xl font-bold">{company.founded_year}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Methodology */}
          {valuation && (
            <Card>
              <CardHeader>
                <CardTitle>Valuation Methodology</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{valuation.methodology}</p>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Industry Multiple</p>
                    <p className="text-lg font-semibold">{valuation.industryMultiple}x</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Confidence Score</p>
                    <p className="text-lg font-semibold">
                      {formatPercent(valuation.confidence)}
                    </p>
                  </div>
                </div>
                {company?.data_sources && company.data_sources.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">Data Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {company.data_sources.map((source) => (
                          <Badge key={source} variant="secondary">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Valuation Card */}
        <div className="space-y-6">
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Estimated Valuation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {valuation ? (
                <>
                  <div className="text-center">
                    <p className="text-4xl font-bold">
                      {formatCompactCurrency(valuation.valuation * 100)}
                    </p>
                    <p className="text-sm text-muted-foreground">Mid Estimate</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold">
                        {formatCompactCurrency(valuation.low * 100)}
                      </p>
                      <p className="text-xs text-muted-foreground">Low</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {formatCompactCurrency(valuation.high * 100)}
                      </p>
                      <p className="text-xs text-muted-foreground">High</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground">
                  Insufficient data for valuation
                </p>
              )}
            </CardContent>
          </Card>

          {company?.valuation_date && (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">
                  Last Updated:{' '}
                  {new Date(company.valuation_date).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
