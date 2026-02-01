import type { CompanyValuationInput, CompanyValuationResult } from '@/types'

// Industry-specific multiples (researched from actual PE deals)
export const INDUSTRY_MULTIPLES: Record<
  string,
  { revenue: number; ebitda: number }
> = {
  'Business Services': { revenue: 2.5, ebitda: 8.5 },
  'Industrial Distribution': { revenue: 0.8, ebitda: 6.5 },
  'IT Services': { revenue: 3.0, ebitda: 10.0 },
  Manufacturing: { revenue: 1.2, ebitda: 7.0 },
  Logistics: { revenue: 1.0, ebitda: 7.5 },
  Healthcare: { revenue: 2.0, ebitda: 9.0 },
  'Financial Services': { revenue: 2.8, ebitda: 9.5 },
  Retail: { revenue: 0.6, ebitda: 5.5 },
  'Food & Beverage': { revenue: 1.5, ebitda: 7.0 },
  Construction: { revenue: 0.7, ebitda: 5.0 },
  Technology: { revenue: 4.0, ebitda: 12.0 },
  'Professional Services': { revenue: 1.8, ebitda: 7.5 },
}

const DEFAULT_MULTIPLES = { revenue: 2.0, ebitda: 8.0 }

// Growth adjustment factors
const GROWTH_WEIGHT = 0.5 // 50% weight on growth
const EBITDA_WEIGHT = 0.7 // 70% weight on EBITDA when available
const REVENUE_WEIGHT = 0.3 // 30% weight on revenue when EBITDA available

// Valuation range percentages
const LOW_RANGE_FACTOR = 0.8 // -20%
const HIGH_RANGE_FACTOR = 1.2 // +20%

// Confidence scores
const CONFIDENCE_WITH_EBITDA = 0.9
const CONFIDENCE_WITHOUT_EBITDA = 0.75

export function getIndustryMultiples(
  industry: string
): { revenue: number; ebitda: number } {
  return INDUSTRY_MULTIPLES[industry] || DEFAULT_MULTIPLES
}

export function calculateGrowthAdjustment(growthRate?: number): number {
  if (!growthRate) return 1

  // Apply growth adjustment with weight
  return 1 + (growthRate / 100) * GROWTH_WEIGHT
}

export function valuateCompany(
  data: CompanyValuationInput
): CompanyValuationResult {
  const { revenue, ebitda, industry, growthRate } = data

  // Get industry-specific multiples
  const multiples = getIndustryMultiples(industry)

  // Calculate valuations using both approaches
  const revenueValuation = revenue * multiples.revenue
  const ebitdaValuation = ebitda ? ebitda * multiples.ebitda : revenueValuation

  // Weight: 70% EBITDA, 30% revenue (if EBITDA available)
  const midValuation = ebitda
    ? ebitdaValuation * EBITDA_WEIGHT + revenueValuation * REVENUE_WEIGHT
    : revenueValuation

  // Apply growth adjustment
  const growthAdjustment = calculateGrowthAdjustment(growthRate)
  const adjustedValuation = midValuation * growthAdjustment

  // Calculate range (±20%)
  const lowValuation = adjustedValuation * LOW_RANGE_FACTOR
  const highValuation = adjustedValuation * HIGH_RANGE_FACTOR

  // Determine confidence score
  const confidence = ebitda ? CONFIDENCE_WITH_EBITDA : CONFIDENCE_WITHOUT_EBITDA

  // Determine methodology description
  const methodology = ebitda
    ? 'Revenue Multiple + EBITDA Multiple (weighted)'
    : 'Revenue Multiple'

  // Determine which multiple was primarily used
  const industryMultiple = ebitda ? multiples.ebitda : multiples.revenue

  return {
    valuation: Math.round(adjustedValuation),
    low: Math.round(lowValuation),
    high: Math.round(highValuation),
    methodology,
    confidence,
    industryMultiple,
  }
}

export function getSupportedIndustries(): string[] {
  return Object.keys(INDUSTRY_MULTIPLES)
}
