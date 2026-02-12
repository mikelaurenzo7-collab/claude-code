export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F'

export interface SubScores {
  scale: number
  valuation: number
  growth: number
  momentum: number
  efficiency: number
  capital: number
}

export interface InvestmentScore {
  overall: number
  grade: Grade
  subscores: SubScores
  insights: string[]
  implied_ev_revenue: number | null
  implied_ev_ebitda: number | null
  forward_multiple: number | null
  rule_of_40: number | null
}

export interface DCFInputs {
  revenue: number
  growth_rate: number
  ebitda_margin: number
  tax_rate: number
  capex_pct: number
  nwc_pct: number
  wacc: number
  terminal_growth: number
  projection_years: number
}

export interface DCFResult {
  enterprise_value: number
  equity_value: number
  implied_price: number | null
  fcf_projections: number[]
  terminal_value: number
  sensitivity_matrix: number[][]
  wacc_range: number[]
  growth_range: number[]
}

export interface LBOInputs {
  entry_ebitda: number
  entry_multiple: number
  equity_pct: number
  debt_pct: number
  interest_rate: number
  ebitda_growth: number
  exit_multiple: number
  hold_years: number
  debt_paydown_pct: number
}

export interface LBOResult {
  irr: number
  moic: number
  entry_ev: number
  exit_ev: number
  equity_invested: number
  equity_at_exit: number
  debt_schedule: Array<{
    year: number
    beginning_debt: number
    interest: number
    paydown: number
    ending_debt: number
    ebitda: number
  }>
}

export interface FootballFieldRange {
  methodology: string
  low: number
  mid: number
  high: number
  color: string
}

export interface SectorMultiples {
  sector: string
  ev_revenue_p25: number
  ev_revenue_median: number
  ev_revenue_p75: number
  ev_ebitda_p25: number
  ev_ebitda_median: number
  ev_ebitda_p75: number
  deal_count: number
  sample_size: number
}
