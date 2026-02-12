import type { Company, Financial, FundingRound, PrecedentTransaction } from '@/types/company'
import type { InvestmentScore, Grade, SubScores, SectorMultiples } from '@/types/valuation'
import { percentile, cagr, clamp } from '@/lib/utils'

/**
 * 6-Factor Investment Scoring Engine
 * Weights: Scale 18%, Valuation 22%, Growth 18%, Momentum 12%, Efficiency 15%, Capital 15%
 */
export function computeInvestmentScore(
  company: Company,
  financials: Financial[],
  latestFunding: FundingRound | undefined,
  allRevenues: number[],
  sectorMultiples: SectorMultiples | null,
  sectorDealCount: number,
  sectorFundingCount: number,
  precedentCount: number
): InvestmentScore {
  const latest = financials.length > 0 ? financials[financials.length - 1] : null
  if (!latest) {
    return emptyScore()
  }

  const revenue = latest.arr || latest.revenue
  const valuation = latestFunding?.post_money_valuation || 0
  const ebitda = latest.ebitda
  const grossMargin = latest.gross_margin
  const burnRate = latest.burn_rate
  const runwayMonths = latest.runway_months
  const employees = latest.employees || company.employee_count

  // Derived metrics
  const impliedEvRevenue = revenue > 0 && valuation > 0 ? valuation / revenue : null
  const impliedEvEbitda = ebitda > 0 && valuation > 0 ? valuation / ebitda : null
  const revenueGrowth = computeGrowth(financials)
  const ruleOf40 = (revenueGrowth * 100) + ((ebitda / Math.max(revenue, 1)) * 100)
  const forwardMultiple = revenue > 0 && valuation > 0 && revenueGrowth > 0
    ? valuation / (revenue * Math.pow(1 + revenueGrowth, 2))
    : null

  // Sub-scores
  const scaleScore = computeScaleScore(revenue, allRevenues)
  const valuationScore = computeValuationScore(impliedEvRevenue, impliedEvEbitda, sectorMultiples, forwardMultiple, company.stage, revenueGrowth)
  const growthScore = computeGrowthScore(revenueGrowth)
  const momentumScore = computeMomentumScore(sectorDealCount, sectorFundingCount, precedentCount, company.sector)
  const efficiencyScore = computeEfficiencyScore(grossMargin, revenue, employees, ruleOf40)
  const capitalScore = computeCapitalScore(revenue, burnRate, runwayMonths)

  const subscores: SubScores = {
    scale: Math.round(scaleScore),
    valuation: Math.round(valuationScore),
    growth: Math.round(growthScore),
    momentum: Math.round(momentumScore),
    efficiency: Math.round(efficiencyScore),
    capital: Math.round(capitalScore),
  }

  const overall = Math.round(
    scaleScore * 0.18 +
    valuationScore * 0.22 +
    growthScore * 0.18 +
    momentumScore * 0.12 +
    efficiencyScore * 0.15 +
    capitalScore * 0.15
  )

  const grade = assignGrade(overall)
  const insights = generateInsights(company, revenue, impliedEvRevenue, sectorMultiples, revenueGrowth, ruleOf40, grossMargin, forwardMultiple)

  return {
    overall,
    grade,
    subscores,
    insights,
    implied_ev_revenue: impliedEvRevenue,
    implied_ev_ebitda: impliedEvEbitda,
    forward_multiple: forwardMultiple,
    rule_of_40: ruleOf40,
  }
}

function computeGrowth(financials: Financial[]): number {
  if (financials.length < 2) return 0
  const first = financials[0].arr || financials[0].revenue
  const last = financials[financials.length - 1].arr || financials[financials.length - 1].revenue
  return cagr(first, last, financials.length - 1)
}

function computeScaleScore(revenue: number, allRevenues: number[]): number {
  let score = percentile(allRevenues, revenue)
  if (revenue >= 1e9) score = Math.min(100, score + 10)
  else if (revenue >= 1e8) score = Math.min(100, score + 5)
  return clamp(score, 0, 100)
}

function computeValuationScore(
  evRevenue: number | null,
  evEbitda: number | null,
  multiples: SectorMultiples | null,
  forwardMultiple: number | null,
  stage: string,
  growth: number
): number {
  if (!evRevenue) return 50 // neutral if no data

  let score: number
  if (multiples && multiples.ev_revenue_median > 0) {
    const ratio = evRevenue / multiples.ev_revenue_median
    if (ratio <= 0.5) score = 98
    else if (ratio <= 0.75) score = 88
    else if (ratio <= 1.0) score = 75
    else if (ratio <= 1.25) score = 60
    else if (ratio <= 1.5) score = 45
    else if (ratio <= 2.0) score = 30
    else if (ratio <= 2.5) score = 20
    else score = 15

    // Blend in EV/EBITDA if available
    if (evEbitda && multiples.ev_ebitda_median > 0) {
      const ebitdaRatio = evEbitda / multiples.ev_ebitda_median
      let ebitdaScore: number
      if (ebitdaRatio <= 0.5) ebitdaScore = 95
      else if (ebitdaRatio <= 1.0) ebitdaScore = 75
      else if (ebitdaRatio <= 1.5) ebitdaScore = 50
      else ebitdaScore = 25
      score = score * 0.65 + ebitdaScore * 0.35
    }
  } else {
    // Fallback: absolute thresholds adjusted by stage
    const stageAdjust = stage.includes('Growth') || stage.includes('Pre-IPO') ? 0.8 : 1.0
    if (evRevenue * stageAdjust <= 5) score = 85
    else if (evRevenue * stageAdjust <= 10) score = 70
    else if (evRevenue * stageAdjust <= 20) score = 50
    else if (evRevenue * stageAdjust <= 40) score = 30
    else score = 15

    if (growth > 1.0) score = Math.min(100, score + 10)
  }

  if (forwardMultiple && forwardMultiple < 10) score = Math.min(100, score + 8)

  return clamp(score, 0, 100)
}

function computeGrowthScore(growth: number): number {
  const pct = growth * 100
  if (pct >= 300) return 100
  if (pct >= 200) return 95
  if (pct >= 100) return 85
  if (pct >= 75) return 78
  if (pct >= 50) return 70
  if (pct >= 30) return 60
  if (pct >= 20) return 50
  if (pct >= 10) return 40
  if (pct >= 0) return 25
  return 10
}

function computeMomentumScore(dealCount: number, fundingCount: number, precedentDepth: number, sector: string): number {
  const dealScore = Math.min(100, dealCount * 8)
  const fundingScore = Math.min(100, fundingCount * 6)
  const depthScore = Math.min(100, precedentDepth * 10)

  let score = dealScore * 0.40 + fundingScore * 0.35 + depthScore * 0.25

  // Fallback boost for hot sectors
  const hotSectors = ['Technology', 'Healthcare', 'Energy']
  const coldSectors = ['Media', 'Education']
  if (dealCount === 0 && fundingCount === 0) {
    score = hotSectors.includes(sector) ? 60 : coldSectors.includes(sector) ? 25 : 40
  }

  return clamp(score, 0, 100)
}

function computeEfficiencyScore(grossMargin: number, revenue: number, employees: number, ruleOf40: number): number {
  // Gross margin tier
  let marginScore: number
  if (grossMargin >= 0.80) marginScore = 95
  else if (grossMargin >= 0.70) marginScore = 80
  else if (grossMargin >= 0.60) marginScore = 65
  else if (grossMargin >= 0.50) marginScore = 50
  else if (grossMargin >= 0.30) marginScore = 35
  else marginScore = 15

  // Revenue per employee
  const revPerEmployee = employees > 0 ? revenue / employees : 0
  let employeeScore: number
  if (revPerEmployee >= 500000) employeeScore = 95
  else if (revPerEmployee >= 300000) employeeScore = 80
  else if (revPerEmployee >= 200000) employeeScore = 65
  else if (revPerEmployee >= 100000) employeeScore = 45
  else employeeScore = 20

  // Rule of 40
  let r40Score: number
  if (ruleOf40 >= 60) r40Score = 100
  else if (ruleOf40 >= 40) r40Score = 85
  else if (ruleOf40 >= 25) r40Score = 65
  else if (ruleOf40 >= 10) r40Score = 40
  else r40Score = 15

  return (marginScore + employeeScore + r40Score) / 3
}

function computeCapitalScore(revenue: number, burnRate: number | null, runwayMonths: number | null): number {
  let burnScore = 70 // default for profitable companies
  if (burnRate && burnRate > 0) {
    const burnMultiple = revenue / burnRate
    if (burnMultiple >= 3) burnScore = 95
    else if (burnMultiple >= 2) burnScore = 80
    else if (burnMultiple >= 1) burnScore = 60
    else if (burnMultiple >= 0.5) burnScore = 40
    else burnScore = 15
  }

  let runwayScore = 80 // default for profitable
  if (runwayMonths !== null) {
    if (runwayMonths >= 36) runwayScore = 95
    else if (runwayMonths >= 24) runwayScore = 80
    else if (runwayMonths >= 18) runwayScore = 65
    else if (runwayMonths >= 12) runwayScore = 45
    else runwayScore = 15
  }

  return (burnScore + runwayScore) / 2
}

function assignGrade(score: number): Grade {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'A-'
  if (score >= 62) return 'B+'
  if (score >= 55) return 'B'
  if (score >= 48) return 'B-'
  if (score >= 40) return 'C+'
  if (score >= 32) return 'C'
  if (score >= 25) return 'C-'
  if (score >= 15) return 'D'
  return 'F'
}

function generateInsights(
  company: Company,
  revenue: number,
  evRevenue: number | null,
  multiples: SectorMultiples | null,
  growth: number,
  ruleOf40: number,
  grossMargin: number,
  forwardMultiple: number | null
): string[] {
  const insights: string[] = []

  if (evRevenue && multiples && multiples.ev_revenue_median > 0) {
    const pctOfMedian = Math.round((evRevenue / multiples.ev_revenue_median) * 100)
    insights.push(`Trading at ${pctOfMedian}% of ${company.sector} sector median EV/Revenue`)
  }

  if (growth >= 1.0) insights.push(`Exceptional revenue growth: ${Math.round(growth * 100)}% CAGR`)
  else if (growth >= 0.5) insights.push(`Strong revenue growth: ${Math.round(growth * 100)}% CAGR`)
  else if (growth >= 0.25) insights.push(`Solid revenue growth: ${Math.round(growth * 100)}% CAGR`)

  if (ruleOf40 >= 40) insights.push(`Rule of 40: ${Math.round(ruleOf40)} — best-in-class efficiency`)
  else if (ruleOf40 >= 25) insights.push(`Rule of 40: ${Math.round(ruleOf40)} — healthy`)

  if (grossMargin >= 0.75) insights.push(`Premium gross margins at ${Math.round(grossMargin * 100)}%`)

  if (forwardMultiple && forwardMultiple < 10) {
    insights.push(`Attractive forward multiple: ${forwardMultiple.toFixed(1)}x (2-year forward)`)
  }

  if (revenue >= 1e9) insights.push(`$${(revenue / 1e9).toFixed(1)}B+ ARR — at scale`)

  return insights.slice(0, 5)
}

function emptyScore(): InvestmentScore {
  return {
    overall: 0,
    grade: 'F',
    subscores: { scale: 0, valuation: 0, growth: 0, momentum: 0, efficiency: 0, capital: 0 },
    insights: ['Insufficient data for scoring'],
    implied_ev_revenue: null,
    implied_ev_ebitda: null,
    forward_multiple: null,
    rule_of_40: null,
  }
}

export function computeSectorMultiples(transactions: PrecedentTransaction[], sector: string): SectorMultiples {
  const sectorTxns = transactions.filter((t) => t.sector === sector)
  const evRevenues = sectorTxns.map((t) => t.ev_revenue).filter((v): v is number => v !== null).sort((a, b) => a - b)
  const evEbitdas = sectorTxns.map((t) => t.ev_ebitda).filter((v): v is number => v !== null).sort((a, b) => a - b)

  const p = (arr: number[], pct: number) => {
    if (arr.length === 0) return 0
    const idx = Math.floor(arr.length * pct)
    return arr[Math.min(idx, arr.length - 1)]
  }

  return {
    sector,
    ev_revenue_p25: p(evRevenues, 0.25),
    ev_revenue_median: p(evRevenues, 0.50),
    ev_revenue_p75: p(evRevenues, 0.75),
    ev_ebitda_p25: p(evEbitdas, 0.25),
    ev_ebitda_median: p(evEbitdas, 0.50),
    ev_ebitda_p75: p(evEbitdas, 0.75),
    deal_count: sectorTxns.length,
    sample_size: sectorTxns.length,
  }
}
