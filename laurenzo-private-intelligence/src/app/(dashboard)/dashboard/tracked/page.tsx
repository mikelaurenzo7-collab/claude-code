'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Building2, Home, Trash2, BookmarkIcon } from 'lucide-react'
import type { TrackedAsset } from '@/types'

interface TrackedAssetsResponse {
  data: TrackedAsset[]
}

async function fetchTrackedAssets(): Promise<TrackedAssetsResponse> {
  const response = await fetch('/api/tracked')
  if (!response.ok) throw new Error('Failed to fetch tracked assets')
  return response.json()
}

async function deleteTrackedAsset(id: string) {
  const response = await fetch(`/api/tracked?id=${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete tracked asset')
  return response.json()
}

export default function TrackedAssetsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['tracked'],
    queryFn: fetchTrackedAssets,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTrackedAsset,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Asset removed from tracking' })
      queryClient.invalidateQueries({ queryKey: ['tracked'] })
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tracked Assets</h1>
          <p className="text-muted-foreground">Assets you are monitoring</p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tracked Assets</h1>
          <p className="text-muted-foreground">Assets you are monitoring</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const trackedAssets = data?.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tracked Assets</h1>
        <p className="text-muted-foreground">Assets you are monitoring</p>
      </div>

      {trackedAssets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookmarkIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No tracked assets</h3>
            <p className="mt-2 text-muted-foreground">
              Start tracking companies and properties to monitor their valuations
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/dashboard/companies">
                <Button>
                  <Building2 className="mr-2 h-4 w-4" />
                  Browse Companies
                </Button>
              </Link>
              <Link href="/dashboard/real-estate">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Browse Properties
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {trackedAssets.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="flex items-center justify-between py-4">
                <Link
                  href={
                    asset.asset_type === 'company'
                      ? `/dashboard/companies/${asset.asset_id}`
                      : `/dashboard/real-estate/${asset.asset_id}`
                  }
                  className="flex items-center gap-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {asset.asset_type === 'company' ? (
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Home className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {asset.asset_type === 'company' ? 'Company' : 'Property'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ID: {asset.asset_id.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Added {new Date(asset.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(asset.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
