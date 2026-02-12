import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Calculator,
  Kanban,
  AlertTriangle,
  Home,
  Brain,
  Newspaper,
  Settings,
  TrendingUp,
  Search,
  Bell,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/valuations', icon: Calculator, label: 'Valuations' },
  { to: '/deals', icon: Kanban, label: 'Deal Pipeline' },
  { to: '/distressed', icon: AlertTriangle, label: 'Distressed Assets' },
  { to: '/real-estate', icon: Home, label: 'Real Estate' },
  { to: '/fund-intelligence', icon: TrendingUp, label: 'Fund Intelligence' },
  { to: '/research', icon: Brain, label: 'AI Research' },
  { to: '/intelligence', icon: Newspaper, label: 'Intelligence Feed' },
  { to: '/watchlists', icon: Eye, label: 'Watchlists' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/sec-search', icon: Search, label: 'SEC EDGAR' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <TrendingUp className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Grapevine</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Private Markets
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-md bg-sidebar-accent/50 px-3 py-2">
          <p className="text-xs font-medium text-primary">Professional Plan</p>
          <p className="text-[10px] text-muted-foreground">$399/mo &middot; Real Data</p>
        </div>
      </div>
    </aside>
  )
}
