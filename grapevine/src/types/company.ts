export type Sector =
  | 'Technology'
  | 'Healthcare'
  | 'Financial Services'
  | 'Consumer'
  | 'Industrial'
  | 'Energy'
  | 'Real Estate'
  | 'Media'
  | 'Education'
  | 'Other'

export type Stage =
  | 'Pre-Seed'
  | 'Seed'
  | 'Series A'
  | 'Series B'
  | 'Series C'
  | 'Series D+'
  | 'Growth'
  | 'Pre-IPO'
  | 'Public'

export interface Company {
  id: string
  name: string
  description: string
  sector: Sector
  stage: Stage
  founded: number
  hq_city: string
  hq_state: string
  website: string
  employee_count: number
  logo_url?: string
  cik_number?: string
  created_at: string
}

export interface Financial {
  id: string
  company_id: string
  period: string
  period_date: string
  revenue: number
  arr: number | null
  ebitda: number
  gross_margin: number
  net_income: number
  burn_rate: number | null
  runway_months: number | null
  employees: number
}

export interface FundingRound {
  id: string
  company_id: string
  round_type: string
  date: string
  amount_raised: number
  pre_money_valuation: number | null
  post_money_valuation: number
  lead_investor: string
  investors: string[]
}

export interface Investor {
  id: string
  name: string
  type: 'PE' | 'VC' | 'Family Office' | 'Hedge Fund' | 'Sovereign Wealth' | 'Other'
  aum: number | null
  hq: string
  website: string
  portfolio_count: number
  focus_sectors: string[]
}

export interface CompanyEnrichment {
  id: string
  company_id: string
  source: string
  content: string
  scraped_at: string
}

export interface CompanyWithFinancials extends Company {
  financials: Financial[]
  funding_rounds: FundingRound[]
  latest_financial?: Financial
  latest_funding?: FundingRound
}

export interface PrecedentTransaction {
  id: string
  acquirer: string
  target: string
  sector: Sector
  date: string
  deal_value: number
  ev_revenue: number | null
  ev_ebitda: number | null
  deal_type: string
}
