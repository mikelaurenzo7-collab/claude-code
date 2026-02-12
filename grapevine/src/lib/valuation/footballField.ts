import type { FootballFieldRange, SectorMultiples } from '@/types/valuation'

export function computeFootballField(
  revenue: number,
  ebitda: number,
  sectorMultiples: SectorMultiples | null
): FootballFieldRange[] {
  const ranges: FootballFieldRange[] = []

  // 1. DCF Range (simplified revenue multiple approach)
  ranges.push({
    methodology: 'DCF Analysis',
    low: Math.round(revenue * 3.5),
    mid: Math.round(revenue * 6.5),
    high: Math.round(revenue * 10),
    color: '#3b82f6', // blue
  })

  // 2. Comparable Companies
  if (sectorMultiples && sectorMultiples.ev_revenue_median > 0) {
    ranges.push({
      methodology: 'Comp Companies',
      low: Math.round(revenue * sectorMultiples.ev_revenue_p25),
      mid: Math.round(revenue * sectorMultiples.ev_revenue_median),
      high: Math.round(revenue * sectorMultiples.ev_revenue_p75),
      color: '#22c55e', // green
    })
  } else {
    ranges.push({
      methodology: 'Comp Companies',
      low: Math.round(revenue * 4),
      mid: Math.round(revenue * 7),
      high: Math.round(revenue * 12),
      color: '#22c55e',
    })
  }

  // 3. Precedent Transactions
  if (sectorMultiples && sectorMultiples.ev_revenue_median > 0) {
    ranges.push({
      methodology: 'Precedent Txns',
      low: Math.round(revenue * sectorMultiples.ev_revenue_median * 0.9),
      mid: Math.round(revenue * sectorMultiples.ev_revenue_median * 1.05),
      high: Math.round(revenue * sectorMultiples.ev_revenue_median * 1.15),
      color: '#f59e0b', // amber
    })
  } else {
    ranges.push({
      methodology: 'Precedent Txns',
      low: Math.round(revenue * 5),
      mid: Math.round(revenue * 8),
      high: Math.round(revenue * 11),
      color: '#f59e0b',
    })
  }

  // 4. LBO Analysis (EBITDA-based)
  const ebitdaBase = ebitda > 0 ? ebitda : revenue * 0.2
  ranges.push({
    methodology: 'LBO Analysis',
    low: Math.round(ebitdaBase * 5),
    mid: Math.round(ebitdaBase * 7),
    high: Math.round(ebitdaBase * 9),
    color: '#a855f7', // purple
  })

  return ranges
}
