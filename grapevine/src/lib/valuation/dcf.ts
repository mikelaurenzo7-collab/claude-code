import type { DCFInputs, DCFResult } from '@/types/valuation'

export function calculateDCF(inputs: DCFInputs): DCFResult {
  const {
    revenue,
    growth_rate,
    ebitda_margin,
    tax_rate,
    capex_pct,
    nwc_pct,
    wacc,
    terminal_growth,
    projection_years,
  } = inputs

  const fcfProjections: number[] = []
  let prevRevenue = revenue

  for (let i = 1; i <= projection_years; i++) {
    const projRevenue = prevRevenue * (1 + growth_rate * Math.pow(0.9, i - 1)) // Growth decays
    const ebitda = projRevenue * ebitda_margin
    const nopat = ebitda * (1 - tax_rate)
    const capex = projRevenue * capex_pct
    const nwcChange = (projRevenue - prevRevenue) * nwc_pct
    const fcf = nopat - capex - nwcChange
    fcfProjections.push(fcf)
    prevRevenue = projRevenue
  }

  // Terminal value (Gordon Growth Model)
  const terminalFCF = fcfProjections[fcfProjections.length - 1]
  const terminalValue = (terminalFCF * (1 + terminal_growth)) / (wacc - terminal_growth)

  // PV of FCFs
  let pvFCFs = 0
  for (let i = 0; i < fcfProjections.length; i++) {
    pvFCFs += fcfProjections[i] / Math.pow(1 + wacc, i + 1)
  }

  // PV of Terminal Value
  const pvTerminal = terminalValue / Math.pow(1 + wacc, projection_years)

  const enterpriseValue = pvFCFs + pvTerminal
  const equityValue = enterpriseValue // Simplified — no net debt adjustment in basic model

  // Sensitivity matrix: WACC vs Terminal Growth
  const waccRange = [wacc - 0.02, wacc - 0.01, wacc, wacc + 0.01, wacc + 0.02]
  const growthRange = [
    terminal_growth - 0.01,
    terminal_growth - 0.005,
    terminal_growth,
    terminal_growth + 0.005,
    terminal_growth + 0.01,
  ]

  const sensitivityMatrix: number[][] = waccRange.map((w) =>
    growthRange.map((g) => {
      if (w <= g) return 0 // Invalid: WACC must exceed terminal growth
      let pv = 0
      for (let i = 0; i < fcfProjections.length; i++) {
        pv += fcfProjections[i] / Math.pow(1 + w, i + 1)
      }
      const tv = (terminalFCF * (1 + g)) / (w - g)
      pv += tv / Math.pow(1 + w, projection_years)
      return Math.round(pv)
    })
  )

  return {
    enterprise_value: Math.round(enterpriseValue),
    equity_value: Math.round(equityValue),
    implied_price: null,
    fcf_projections: fcfProjections.map(Math.round),
    terminal_value: Math.round(terminalValue),
    sensitivity_matrix: sensitivityMatrix,
    wacc_range: waccRange,
    growth_range: growthRange,
  }
}

export function getDefaultDCFInputs(revenue?: number, ebitdaMargin?: number): DCFInputs {
  return {
    revenue: revenue || 100000000,
    growth_rate: 0.25,
    ebitda_margin: ebitdaMargin || 0.20,
    tax_rate: 0.25,
    capex_pct: 0.05,
    nwc_pct: 0.10,
    wacc: 0.12,
    terminal_growth: 0.03,
    projection_years: 5,
  }
}
