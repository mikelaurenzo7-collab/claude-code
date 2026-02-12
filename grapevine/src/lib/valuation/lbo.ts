import type { LBOInputs, LBOResult } from '@/types/valuation'

export function calculateLBO(inputs: LBOInputs): LBOResult {
  const {
    entry_ebitda,
    entry_multiple,
    equity_pct,
    debt_pct,
    interest_rate,
    ebitda_growth,
    exit_multiple,
    hold_years,
    debt_paydown_pct,
  } = inputs

  const entryEV = entry_ebitda * entry_multiple
  const equityInvested = entryEV * equity_pct
  let totalDebt = entryEV * debt_pct

  const debtSchedule: LBOResult['debt_schedule'] = []
  let currentEbitda = entry_ebitda

  for (let year = 1; year <= hold_years; year++) {
    currentEbitda = currentEbitda * (1 + ebitda_growth)
    const interest = totalDebt * interest_rate
    const paydown = currentEbitda * debt_paydown_pct
    const actualPaydown = Math.min(paydown, totalDebt)
    const beginningDebt = totalDebt

    totalDebt = totalDebt - actualPaydown

    debtSchedule.push({
      year,
      beginning_debt: Math.round(beginningDebt),
      interest: Math.round(interest),
      paydown: Math.round(actualPaydown),
      ending_debt: Math.round(totalDebt),
      ebitda: Math.round(currentEbitda),
    })
  }

  const exitEV = currentEbitda * exit_multiple
  const exitEquity = exitEV - totalDebt
  const moic = exitEquity / equityInvested
  const irr = computeIRR(equityInvested, exitEquity, hold_years)

  return {
    irr,
    moic: Math.round(moic * 100) / 100,
    entry_ev: Math.round(entryEV),
    exit_ev: Math.round(exitEV),
    equity_invested: Math.round(equityInvested),
    equity_at_exit: Math.round(exitEquity),
    debt_schedule: debtSchedule,
  }
}

/** Newton-Raphson IRR computation */
function computeIRR(invested: number, exitValue: number, years: number): number {
  // Simple case: single entry, single exit
  // IRR = (exitValue / invested)^(1/years) - 1
  if (invested <= 0) return 0
  const ratio = exitValue / invested
  if (ratio <= 0) return -1

  let irr = Math.pow(ratio, 1 / years) - 1

  // Newton-Raphson refinement for more complex cases
  for (let iter = 0; iter < 50; iter++) {
    const npv = -invested + exitValue / Math.pow(1 + irr, years)
    const dnpv = -years * exitValue / Math.pow(1 + irr, years + 1)
    if (Math.abs(dnpv) < 1e-10) break
    const newIrr = irr - npv / dnpv
    if (Math.abs(newIrr - irr) < 1e-8) break
    irr = newIrr
  }

  return Math.round(irr * 10000) / 10000
}

export function getDefaultLBOInputs(ebitda?: number): LBOInputs {
  return {
    entry_ebitda: ebitda || 50000000,
    entry_multiple: 8.0,
    equity_pct: 0.40,
    debt_pct: 0.60,
    interest_rate: 0.07,
    ebitda_growth: 0.08,
    exit_multiple: 9.0,
    hold_years: 5,
    debt_paydown_pct: 0.30,
  }
}
