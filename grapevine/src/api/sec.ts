/**
 * SEC EDGAR API Integration
 * Uses the free SEC EDGAR XBRL companion API and full-text search
 * No API key required — just a User-Agent header
 */

import type { SecFiling, SecCompanySearch } from '@/types/market'

const SEC_BASE = 'https://efts.sec.gov/LATEST'
const SEC_EDGAR = 'https://data.sec.gov'
const USER_AGENT = 'Grapevine/1.0 (contact@grapevine.fund)'

export async function searchSecCompanies(query: string): Promise<SecCompanySearch[]> {
  try {
    const res = await fetch(
      `${SEC_BASE}/search-index?q=${encodeURIComponent(query)}&dateRange=custom&startdt=2020-01-01&forms=10-K,10-Q,S-1`,
      { headers: { 'User-Agent': USER_AGENT } }
    )
    if (!res.ok) throw new Error(`SEC API error: ${res.status}`)
    const data = await res.json()

    const seen = new Set<string>()
    const results: SecCompanySearch[] = []

    for (const hit of data.hits?.hits || []) {
      const source = hit._source
      const cik = String(source.entity_id || '').padStart(10, '0')
      if (seen.has(cik)) continue
      seen.add(cik)
      results.push({
        cik,
        name: source.entity_name || source.display_names?.[0] || 'Unknown',
        ticker: source.ticker || undefined,
      })
    }

    return results.slice(0, 20)
  } catch (err) {
    console.error('SEC search error:', err)
    return []
  }
}

export async function getSecFilings(cik: string): Promise<SecFiling[]> {
  try {
    const paddedCik = cik.padStart(10, '0')
    const res = await fetch(`${SEC_EDGAR}/submissions/CIK${paddedCik}.json`, {
      headers: { 'User-Agent': USER_AGENT },
    })
    if (!res.ok) throw new Error(`SEC API error: ${res.status}`)
    const data = await res.json()

    const recent = data.filings?.recent
    if (!recent) return []

    const filings: SecFiling[] = []
    const count = Math.min(recent.accessionNumber?.length || 0, 50)

    for (let i = 0; i < count; i++) {
      const accession = recent.accessionNumber[i]
      const formattedAccession = accession.replace(/-/g, '')
      filings.push({
        accession_number: accession,
        company_name: data.name || '',
        cik: paddedCik,
        form_type: recent.form[i],
        filed_date: recent.filingDate[i],
        document_url: `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${formattedAccession}/${recent.primaryDocument[i]}`,
      })
    }

    return filings
  } catch (err) {
    console.error('SEC filings error:', err)
    return []
  }
}

export async function getSecCompanyFacts(cik: string): Promise<Record<string, unknown> | null> {
  try {
    const paddedCik = cik.padStart(10, '0')
    const res = await fetch(`${SEC_EDGAR}/api/xbrl/companyfacts/CIK${paddedCik}.json`, {
      headers: { 'User-Agent': USER_AGENT },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/** Extract key financials from SEC XBRL company facts */
export function extractFinancialsFromFacts(
  facts: Record<string, unknown>
): { revenue: number[]; netIncome: number[]; assets: number[]; periods: string[] } {
  const result = { revenue: [] as number[], netIncome: [] as number[], assets: [] as number[], periods: [] as string[] }

  try {
    const usGaap = (facts as Record<string, Record<string, Record<string, { units: Record<string, Array<{ val: number; end: string; form: string }>> }>>>)?.facts?.['us-gaap']
    if (!usGaap) return result

    // Revenue
    const revenueKey = usGaap['Revenues'] || usGaap['RevenueFromContractWithCustomerExcludingAssessedTax'] || usGaap['SalesRevenueNet']
    if (revenueKey?.units?.USD) {
      const annuals = revenueKey.units.USD
        .filter((d: { form: string }) => d.form === '10-K')
        .sort((a: { end: string }, b: { end: string }) => a.end.localeCompare(b.end))
        .slice(-5)
      result.revenue = annuals.map((d: { val: number }) => d.val)
      result.periods = annuals.map((d: { end: string }) => d.end)
    }

    // Net Income
    const niKey = usGaap['NetIncomeLoss']
    if (niKey?.units?.USD) {
      const annuals = niKey.units.USD
        .filter((d: { form: string }) => d.form === '10-K')
        .slice(-5)
      result.netIncome = annuals.map((d: { val: number }) => d.val)
    }

    // Assets
    const assetsKey = usGaap['Assets']
    if (assetsKey?.units?.USD) {
      const annuals = assetsKey.units.USD
        .filter((d: { form: string }) => d.form === '10-K')
        .slice(-5)
      result.assets = annuals.map((d: { val: number }) => d.val)
    }
  } catch {
    // Silently handle parsing errors
  }

  return result
}
