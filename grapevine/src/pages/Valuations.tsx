import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/stores/appStore'
import { calculateDCF, getDefaultDCFInputs } from '@/lib/valuation/dcf'
import { calculateLBO, getDefaultLBOInputs } from '@/lib/valuation/lbo'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { DCFInputs } from '@/types/valuation'
import type { LBOInputs } from '@/types/valuation'
import { Calculator, TrendingUp } from 'lucide-react'

export default function Valuations() {
  const [searchParams] = useSearchParams()
  const defaultTool = searchParams.get('tool') || 'dcf'
  const companyId = searchParams.get('company')
  const { getCompanyWithFinancials } = useAppStore()

  const company = companyId ? getCompanyWithFinancials(companyId) : null
  const latestFin = company?.latest_financial

  const [dcfInputs, setDCFInputs] = useState<DCFInputs>(
    getDefaultDCFInputs(latestFin?.revenue, latestFin ? latestFin.ebitda / latestFin.revenue : undefined)
  )
  const [lboInputs, setLBOInputs] = useState<LBOInputs>(
    getDefaultLBOInputs(latestFin?.ebitda)
  )

  const dcfResult = useMemo(() => calculateDCF(dcfInputs), [dcfInputs])
  const lboResult = useMemo(() => calculateLBO(lboInputs), [lboInputs])

  const updateDCF = (field: keyof DCFInputs, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) setDCFInputs((prev) => ({ ...prev, [field]: num }))
  }

  const updateLBO = (field: keyof LBOInputs, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) setLBOInputs((prev) => ({ ...prev, [field]: num }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Valuation Suite</h1>
        <p className="text-sm text-muted-foreground">
          Interactive DCF, LBO, and comparable analysis tools
          {company && <span> — Pre-populated with {company.name} data</span>}
        </p>
      </div>

      <Tabs defaultValue={defaultTool}>
        <TabsList>
          <TabsTrigger value="dcf"><Calculator className="h-3 w-3 mr-1" />DCF Calculator</TabsTrigger>
          <TabsTrigger value="lbo"><TrendingUp className="h-3 w-3 mr-1" />LBO Model</TabsTrigger>
        </TabsList>

        {/* DCF Calculator */}
        <TabsContent value="dcf" className="space-y-6 mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>DCF Assumptions</CardTitle>
                <CardDescription>Adjust inputs to model enterprise value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {([
                  ['revenue', 'Base Revenue ($)', dcfInputs.revenue],
                  ['growth_rate', 'Revenue Growth Rate', dcfInputs.growth_rate],
                  ['ebitda_margin', 'EBITDA Margin', dcfInputs.ebitda_margin],
                  ['tax_rate', 'Tax Rate', dcfInputs.tax_rate],
                  ['capex_pct', 'CapEx (% of Revenue)', dcfInputs.capex_pct],
                  ['nwc_pct', 'NWC (% of Rev Change)', dcfInputs.nwc_pct],
                  ['wacc', 'WACC', dcfInputs.wacc],
                  ['terminal_growth', 'Terminal Growth Rate', dcfInputs.terminal_growth],
                  ['projection_years', 'Projection Years', dcfInputs.projection_years],
                ] as [keyof DCFInputs, string, number][]).map(([key, label, value]) => (
                  <div key={key}>
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <Input
                      type="number"
                      step={key === 'revenue' ? '1000000' : key === 'projection_years' ? '1' : '0.01'}
                      value={value}
                      onChange={(e) => updateDCF(key, e.target.value)}
                      className="font-mono"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>DCF Output</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-xs text-muted-foreground">Enterprise Value</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(dcfResult.enterprise_value, true)}</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-xs text-muted-foreground">Terminal Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(dcfResult.terminal_value, true)}</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-xs text-muted-foreground">TV as % of EV</p>
                    <p className="text-2xl font-bold">{dcfResult.enterprise_value > 0 ? formatPercent(dcfResult.terminal_value / dcfResult.enterprise_value) : 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">FCF Projections</h4>
                  <div className="flex gap-2">
                    {dcfResult.fcf_projections.map((fcf, i) => (
                      <div key={i} className="flex-1 rounded border p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">Year {i + 1}</p>
                        <p className="text-sm font-mono font-medium">{formatCurrency(fcf, true)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Sensitivity: WACC vs Terminal Growth</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr>
                          <th className="p-1 text-muted-foreground">WACC \ TGR</th>
                          {dcfResult.growth_range.map((g) => (
                            <th key={g} className="p-1 text-center text-muted-foreground">{(g * 100).toFixed(1)}%</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dcfResult.sensitivity_matrix.map((row, i) => (
                          <tr key={i}>
                            <td className="p-1 font-medium text-muted-foreground">{(dcfResult.wacc_range[i] * 100).toFixed(1)}%</td>
                            {row.map((val, j) => {
                              const isCenter = i === 2 && j === 2
                              return (
                                <td key={j} className={`p-1 text-center ${isCenter ? 'bg-primary/20 font-bold text-primary' : ''} ${val === 0 ? 'text-muted-foreground/30' : ''}`}>
                                  {val === 0 ? '—' : formatCurrency(val, true)}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LBO Model */}
        <TabsContent value="lbo" className="space-y-6 mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>LBO Assumptions</CardTitle>
                <CardDescription>Leveraged buyout model inputs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {([
                  ['entry_ebitda', 'Entry EBITDA ($)', lboInputs.entry_ebitda],
                  ['entry_multiple', 'Entry Multiple (x)', lboInputs.entry_multiple],
                  ['equity_pct', 'Equity %', lboInputs.equity_pct],
                  ['debt_pct', 'Debt %', lboInputs.debt_pct],
                  ['interest_rate', 'Interest Rate', lboInputs.interest_rate],
                  ['ebitda_growth', 'EBITDA Growth Rate', lboInputs.ebitda_growth],
                  ['exit_multiple', 'Exit Multiple (x)', lboInputs.exit_multiple],
                  ['hold_years', 'Hold Period (years)', lboInputs.hold_years],
                  ['debt_paydown_pct', 'Debt Paydown (% of EBITDA)', lboInputs.debt_paydown_pct],
                ] as [keyof LBOInputs, string, number][]).map(([key, label, value]) => (
                  <div key={key}>
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <Input
                      type="number"
                      step={key === 'entry_ebitda' ? '1000000' : key === 'hold_years' ? '1' : '0.01'}
                      value={value}
                      onChange={(e) => updateLBO(key, e.target.value)}
                      className="font-mono"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>LBO Returns</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-xs text-muted-foreground">IRR</p>
                    <p className={`text-2xl font-bold ${lboResult.irr >= 0.20 ? 'text-emerald-400' : lboResult.irr >= 0.15 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {formatPercent(lboResult.irr)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-xs text-muted-foreground">MOIC</p>
                    <p className="text-2xl font-bold">{lboResult.moic.toFixed(2)}x</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-xs text-muted-foreground">Entry EV</p>
                    <p className="text-2xl font-bold">{formatCurrency(lboResult.entry_ev, true)}</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-xs text-muted-foreground">Exit EV</p>
                    <p className="text-2xl font-bold">{formatCurrency(lboResult.exit_ev, true)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Debt Schedule</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="p-2 text-left">Year</th>
                          <th className="p-2 text-right">EBITDA</th>
                          <th className="p-2 text-right">Beg. Debt</th>
                          <th className="p-2 text-right">Interest</th>
                          <th className="p-2 text-right">Paydown</th>
                          <th className="p-2 text-right">End. Debt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lboResult.debt_schedule.map((row) => (
                          <tr key={row.year} className="border-b border-border/50">
                            <td className="p-2">{row.year}</td>
                            <td className="p-2 text-right">{formatCurrency(row.ebitda, true)}</td>
                            <td className="p-2 text-right">{formatCurrency(row.beginning_debt, true)}</td>
                            <td className="p-2 text-right text-red-400">{formatCurrency(row.interest, true)}</td>
                            <td className="p-2 text-right text-emerald-400">{formatCurrency(row.paydown, true)}</td>
                            <td className="p-2 text-right font-medium">{formatCurrency(row.ending_debt, true)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">Equity Invested</p>
                    <p className="text-lg font-bold">{formatCurrency(lboResult.equity_invested, true)}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">Equity at Exit</p>
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(lboResult.equity_at_exit, true)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
