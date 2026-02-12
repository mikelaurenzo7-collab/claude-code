export type AssetType = 'Bankruptcy' | 'Receivership' | 'Turnaround' | 'Tax Lien' | 'Foreclosure'
export type AssetStatus = 'Active' | 'Under Review' | 'Closed'

export interface DistressedAsset {
  id: string
  company_name: string
  asset_type: AssetType
  sector: string
  location: string
  estimated_value: number
  discount_pct: number
  status: AssetStatus
  description: string
  filing_date: string
  source: string
}

export type PropertyType = 'Multifamily' | 'Industrial' | 'Office' | 'Retail' | 'Mixed Use' | 'Land'
export type ListingType = 'Off-Market' | 'Pocket Listing' | '1031 Exchange' | 'Pre-Foreclosure'

export interface RealEstateListing {
  id: string
  property_name: string
  type: PropertyType
  address: string
  city: string
  state: string
  asking_price: number
  cap_rate: number
  sqft: number
  units?: number
  occupancy_pct: number
  listing_type: ListingType
  description: string
}

export type SignalType = 'Funding' | 'M&A' | 'IPO' | 'Regulatory' | 'Market Shift' | 'Personnel'
export type Sentiment = 'positive' | 'negative' | 'neutral'

export interface IntelligenceSignal {
  id: string
  title: string
  summary: string
  sector: string
  signal_type: SignalType
  sentiment: Sentiment
  source: string
  published_at: string
  companies: string[]
}

export interface FredIndicator {
  series_id: string
  title: string
  value: number
  unit: string
  date: string
  change_pct: number
}

export interface SecFiling {
  accession_number: string
  company_name: string
  cik: string
  form_type: string
  filed_date: string
  document_url: string
}

export interface SecCompanySearch {
  cik: string
  name: string
  ticker?: string
  exchange?: string
}
