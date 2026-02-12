import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Plus, Trash2, Check } from 'lucide-react'

interface Alert {
  id: string
  name: string
  type: 'Funding Event' | 'Price Change' | 'New Filing' | 'Sector Activity'
  sector: string
  threshold: string
  active: boolean
  triggered: number
}

const defaultAlerts: Alert[] = [
  { id: 'a1', name: 'AI Sector Funding', type: 'Funding Event', sector: 'Technology', threshold: 'Any round > $100M', active: true, triggered: 3 },
  { id: 'a2', name: 'Distressed Healthcare', type: 'Sector Activity', sector: 'Healthcare', threshold: 'New bankruptcy filing', active: true, triggered: 1 },
]

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(defaultAlerts)
  const [showNew, setShowNew] = useState(false)

  const toggleAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a))
  }

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-sm text-muted-foreground">{alerts.filter((a) => a.active).length} active alerts</p>
        </div>
        <Button onClick={() => setShowNew(!showNew)}>
          <Plus className="h-4 w-4 mr-1" /> New Alert
        </Button>
      </div>

      {showNew && (
        <Card>
          <CardHeader><CardTitle>Create Alert</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Alert configuration requires backend integration. Configure your API keys in Settings to enable real-time alerts via webhooks.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Alert Name</label>
                <Input placeholder="e.g., AI Mega Round Alert" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Type</label>
                <Select defaultValue="Funding Event">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Funding Event">Funding Event</SelectItem>
                    <SelectItem value="Price Change">Price Change</SelectItem>
                    <SelectItem value="New Filing">New SEC Filing</SelectItem>
                    <SelectItem value="Sector Activity">Sector Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card key={alert.id} className={`transition-colors ${alert.active ? 'border-primary/30' : 'opacity-60'}`}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${alert.active ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Bell className={`h-5 w-5 ${alert.active ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-semibold">{alert.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{alert.type}</Badge>
                    <Badge variant="secondary">{alert.sector}</Badge>
                    <span className="text-xs text-muted-foreground">{alert.threshold}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {alert.triggered > 0 && (
                  <Badge variant="info">{alert.triggered} triggered</Badge>
                )}
                <Button variant="ghost" size="sm" onClick={() => toggleAlert(alert.id)}>
                  {alert.active ? 'Disable' : 'Enable'}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteAlert(alert.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
