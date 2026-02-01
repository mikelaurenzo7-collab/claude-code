'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Subscription } from '@/types'

interface DashboardHeaderProps {
  user: SupabaseUser
  subscription: Subscription | null
}

export function DashboardHeader({ user, subscription }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const planTier = subscription?.plan_tier || 'free'
  const viewsUsed = subscription?.monthly_views_used || 0
  const viewsLimit = subscription?.monthly_views_limit || 10

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold lg:hidden">LPI</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <Badge variant={planTier === 'free' ? 'secondary' : 'default'}>
            {planTier.charAt(0).toUpperCase() + planTier.slice(1)}
          </Badge>
          {planTier === 'free' && (
            <span className="text-sm text-muted-foreground">
              {viewsUsed}/{viewsLimit} views
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user.user_metadata?.name || user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
