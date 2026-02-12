import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/stores/appStore'
import { formatCurrency, formatRelativeDate, generateId } from '@/lib/utils'
import type { Deal, DealStage, DealPriority } from '@/types/deal'
import { Plus, GripVertical, CheckCircle2, Circle } from 'lucide-react'

const STAGES: DealStage[] = ['Sourced', 'Screening', 'Due Diligence', 'IC Review', 'Term Sheet', 'Closing', 'Closed', 'Passed']
const STAGE_COLORS: Record<DealStage, string> = {
  Sourced: 'border-l-blue-400',
  Screening: 'border-l-cyan-400',
  'Due Diligence': 'border-l-yellow-400',
  'IC Review': 'border-l-orange-400',
  'Term Sheet': 'border-l-purple-400',
  Closing: 'border-l-emerald-400',
  Closed: 'border-l-emerald-600',
  Passed: 'border-l-red-400',
}
const PRIORITY_COLORS: Record<DealPriority, string> = {
  Low: 'secondary',
  Medium: 'info',
  High: 'warning',
  Critical: 'destructive',
}

export default function DealPipeline() {
  const { deals, addDeal, updateDeal, deleteDeal } = useAppStore()
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [newDeal, setNewDeal] = useState({
    company_name: '',
    sector: 'Technology',
    deal_size: 10000000,
    priority: 'Medium' as DealPriority,
    assigned_to: '',
    notes: '',
  })

  const handleCreateDeal = () => {
    const deal: Deal = {
      id: generateId(),
      ...newDeal,
      stage: 'Sourced',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks: [],
    }
    addDeal(deal)
    setShowNewDeal(false)
    setNewDeal({ company_name: '', sector: 'Technology', deal_size: 10000000, priority: 'Medium', assigned_to: '', notes: '' })
  }

  const moveDeal = (dealId: string, newStage: DealStage) => {
    updateDeal(dealId, { stage: newStage })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deal Pipeline</h1>
          <p className="text-sm text-muted-foreground">{deals.length} deals tracked &middot; {formatCurrency(deals.reduce((s, d) => s + d.deal_size, 0), true)} total value</p>
        </div>
        <Button onClick={() => setShowNewDeal(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Deal
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage)
          return (
            <div key={stage} className="min-w-[280px] flex-shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{stage}</h3>
                <Badge variant="outline" className="text-xs">{stageDeals.length}</Badge>
              </div>
              <div className="space-y-3">
                {stageDeals.map((deal) => (
                  <Card key={deal.id} className={`border-l-4 ${STAGE_COLORS[stage]}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{deal.company_name}</p>
                          <p className="text-xs text-muted-foreground">{deal.sector}</p>
                        </div>
                        <Badge variant={PRIORITY_COLORS[deal.priority] as 'secondary' | 'destructive' | 'outline'}>
                          {deal.priority}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm font-mono font-medium">{formatCurrency(deal.deal_size, true)}</p>
                      {deal.notes && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{deal.notes}</p>}
                      {deal.tasks.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          {deal.tasks.filter((t) => t.completed).length === deal.tasks.length ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Circle className="h-3 w-3" />
                          )}
                          {deal.tasks.filter((t) => t.completed).length}/{deal.tasks.length} tasks
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-1">
                        <Select value={deal.stage} onValueChange={(v) => moveDeal(deal.id, v as DealStage)}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground">Updated {formatRelativeDate(deal.updated_at)}</p>
                    </CardContent>
                  </Card>
                ))}
                {stageDeals.length === 0 && (
                  <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                    No deals
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* New Deal Dialog */}
      <Dialog open={showNewDeal} onOpenChange={setShowNewDeal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Company Name</label>
              <Input value={newDeal.company_name} onChange={(e) => setNewDeal({ ...newDeal, company_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Deal Size ($)</label>
              <Input type="number" value={newDeal.deal_size} onChange={(e) => setNewDeal({ ...newDeal, deal_size: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Sector</label>
              <Input value={newDeal.sector} onChange={(e) => setNewDeal({ ...newDeal, sector: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Priority</label>
              <Select value={newDeal.priority} onValueChange={(v) => setNewDeal({ ...newDeal, priority: v as DealPriority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Assigned To</label>
              <Input value={newDeal.assigned_to} onChange={(e) => setNewDeal({ ...newDeal, assigned_to: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Notes</label>
              <Input value={newDeal.notes} onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDeal(false)}>Cancel</Button>
            <Button onClick={handleCreateDeal} disabled={!newDeal.company_name}>Create Deal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
