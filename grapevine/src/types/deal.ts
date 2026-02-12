export type DealStage =
  | 'Sourced'
  | 'Screening'
  | 'Due Diligence'
  | 'IC Review'
  | 'Term Sheet'
  | 'Closing'
  | 'Closed'
  | 'Passed'

export type DealPriority = 'Low' | 'Medium' | 'High' | 'Critical'

export interface DealTask {
  id: string
  deal_id: string
  title: string
  completed: boolean
  due_date?: string
}

export interface Deal {
  id: string
  company_name: string
  company_id?: string
  stage: DealStage
  priority: DealPriority
  deal_size: number
  sector: string
  assigned_to: string
  notes: string
  created_at: string
  updated_at: string
  tasks: DealTask[]
}
