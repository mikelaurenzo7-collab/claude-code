/**
 * FRED (Federal Reserve Economic Data) API Integration
 * Free API — requires key from https://fred.stlouisfed.org/docs/api/api_key.html
 * Falls back to demo data when no key is configured
 */

import type { FredIndicator } from '@/types/market'

const FRED_BASE = 'https://api.stlouisfed.org/fred'

// Key economic indicators for private market investors
export const FRED_SERIES = {
  FEDFUNDS: { title: 'Federal Funds Rate', unit: '%' },
  DGS10: { title: '10-Year Treasury Yield', unit: '%' },
  GDPC1: { title: 'Real GDP', unit: 'Billions of Chained 2017 Dollars' },
  UNRATE: { title: 'Unemployment Rate', unit: '%' },
  CPIAUCSL: { title: 'Consumer Price Index', unit: 'Index 1982-84=100' },
  BAMLH0A0HYM2: { title: 'High Yield Spread (ICE BofA)', unit: '%' },
  VIXCLS: { title: 'VIX Volatility Index', unit: 'Index' },
  DCOILWTICO: { title: 'Crude Oil (WTI)', unit: '$/Barrel' },
} as const

export async function fetchFredSeries(
  seriesId: string,
  apiKey: string
): Promise<FredIndicator | null> {
  try {
    const res = await fetch(
      `${FRED_BASE}/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`
    )
    if (!res.ok) return null
    const data = await res.json()

    const observations = data.observations || []
    if (observations.length === 0) return null

    const latest = observations[0]
    const previous = observations.length > 1 ? observations[1] : null
    const value = parseFloat(latest.value)
    const prevValue = previous ? parseFloat(previous.value) : value
    const changePct = prevValue !== 0 ? (value - prevValue) / Math.abs(prevValue) : 0

    const seriesInfo = FRED_SERIES[seriesId as keyof typeof FRED_SERIES]

    return {
      series_id: seriesId,
      title: seriesInfo?.title || seriesId,
      value,
      unit: seriesInfo?.unit || '',
      date: latest.date,
      change_pct: changePct,
    }
  } catch {
    return null
  }
}

export async function fetchAllIndicators(apiKey: string): Promise<FredIndicator[]> {
  const results = await Promise.allSettled(
    Object.keys(FRED_SERIES).map((id) => fetchFredSeries(id, apiKey))
  )
  return results
    .filter((r): r is PromiseFulfilledResult<FredIndicator | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((v): v is FredIndicator => v !== null)
}

// Demo data for when no API key is set
export const demoIndicators: FredIndicator[] = [
  { series_id: 'FEDFUNDS', title: 'Federal Funds Rate', value: 5.33, unit: '%', date: '2024-12-01', change_pct: 0 },
  { series_id: 'DGS10', title: '10-Year Treasury Yield', value: 4.18, unit: '%', date: '2024-12-06', change_pct: -0.02 },
  { series_id: 'GDPC1', title: 'Real GDP', value: 23271.3, unit: 'Billions $', date: '2024-07-01', change_pct: 0.028 },
  { series_id: 'UNRATE', title: 'Unemployment Rate', value: 4.2, unit: '%', date: '2024-11-01', change_pct: 0.05 },
  { series_id: 'CPIAUCSL', title: 'CPI (All Items)', value: 315.5, unit: 'Index', date: '2024-10-01', change_pct: 0.002 },
  { series_id: 'BAMLH0A0HYM2', title: 'HY Credit Spread', value: 2.71, unit: '%', date: '2024-12-05', change_pct: -0.03 },
  { series_id: 'VIXCLS', title: 'VIX', value: 13.5, unit: 'Index', date: '2024-12-06', change_pct: -0.08 },
  { series_id: 'DCOILWTICO', title: 'WTI Crude Oil', value: 68.3, unit: '$/bbl', date: '2024-12-05', change_pct: -0.01 },
]
