import type { Company, Financial, FundingRound, Investor, PrecedentTransaction } from '@/types/company'
import type { Deal } from '@/types/deal'
import type { DistressedAsset, RealEstateListing, IntelligenceSignal } from '@/types/market'

// --- Companies (modeled on real private companies but with synthetic financials) ---
export const companies: Company[] = [
  { id: 'c1', name: 'Stripe', description: 'Online payment processing for internet businesses', sector: 'Technology', stage: 'Growth', founded: 2010, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://stripe.com', employee_count: 8000, cik_number: '', created_at: '2024-01-01' },
  { id: 'c2', name: 'SpaceX', description: 'Spacecraft manufacturer and space transportation services', sector: 'Industrial', stage: 'Growth', founded: 2002, hq_city: 'Hawthorne', hq_state: 'CA', website: 'https://spacex.com', employee_count: 13000, created_at: '2024-01-01' },
  { id: 'c3', name: 'Databricks', description: 'Unified analytics platform for data engineering and science', sector: 'Technology', stage: 'Series D+', founded: 2013, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://databricks.com', employee_count: 5000, created_at: '2024-01-01' },
  { id: 'c4', name: 'Canva', description: 'Online design and visual communication platform', sector: 'Technology', stage: 'Growth', founded: 2012, hq_city: 'Sydney', hq_state: 'NSW', website: 'https://canva.com', employee_count: 4000, created_at: '2024-01-01' },
  { id: 'c5', name: 'Plaid', description: 'Financial data network connecting apps to bank accounts', sector: 'Financial Services', stage: 'Series D+', founded: 2013, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://plaid.com', employee_count: 1800, created_at: '2024-01-01' },
  { id: 'c6', name: 'Figma', description: 'Collaborative interface design tool', sector: 'Technology', stage: 'Growth', founded: 2012, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://figma.com', employee_count: 1500, created_at: '2024-01-01' },
  { id: 'c7', name: 'Anthropic', description: 'AI safety and research company', sector: 'Technology', stage: 'Series D+', founded: 2021, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://anthropic.com', employee_count: 1200, created_at: '2024-01-01' },
  { id: 'c8', name: 'Anduril', description: 'Defense technology and autonomous systems', sector: 'Industrial', stage: 'Series D+', founded: 2017, hq_city: 'Costa Mesa', hq_state: 'CA', website: 'https://anduril.com', employee_count: 2500, created_at: '2024-01-01' },
  { id: 'c9', name: 'Rippling', description: 'Employee management platform for HR, IT, and Finance', sector: 'Technology', stage: 'Series D+', founded: 2016, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://rippling.com', employee_count: 3000, created_at: '2024-01-01' },
  { id: 'c10', name: 'Discord', description: 'Communication platform for communities and friends', sector: 'Technology', stage: 'Growth', founded: 2015, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://discord.com', employee_count: 600, created_at: '2024-01-01' },
  { id: 'c11', name: 'Flexport', description: 'Technology platform for global freight forwarding and logistics', sector: 'Industrial', stage: 'Growth', founded: 2013, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://flexport.com', employee_count: 3200, created_at: '2024-01-01' },
  { id: 'c12', name: 'Brex', description: 'Financial operating system for growing businesses', sector: 'Financial Services', stage: 'Series D+', founded: 2017, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://brex.com', employee_count: 1100, created_at: '2024-01-01' },
  { id: 'c13', name: 'Faire', description: 'Online wholesale marketplace for retailers', sector: 'Consumer', stage: 'Series D+', founded: 2017, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://faire.com', employee_count: 1000, created_at: '2024-01-01' },
  { id: 'c14', name: 'Tempus', description: 'Technology company advancing precision medicine through AI', sector: 'Healthcare', stage: 'Pre-IPO', founded: 2015, hq_city: 'Chicago', hq_state: 'IL', website: 'https://tempus.com', employee_count: 2800, created_at: '2024-01-01' },
  { id: 'c15', name: 'Cerebras', description: 'AI compute solutions and wafer-scale engine chips', sector: 'Technology', stage: 'Series D+', founded: 2016, hq_city: 'Sunnyvale', hq_state: 'CA', website: 'https://cerebras.net', employee_count: 500, created_at: '2024-01-01' },
  { id: 'c16', name: 'Scale AI', description: 'Data labeling and AI infrastructure platform', sector: 'Technology', stage: 'Series D+', founded: 2016, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://scale.com', employee_count: 700, created_at: '2024-01-01' },
  { id: 'c17', name: 'Wiz', description: 'Cloud security platform for enterprises', sector: 'Technology', stage: 'Growth', founded: 2020, hq_city: 'New York', hq_state: 'NY', website: 'https://wiz.io', employee_count: 1800, created_at: '2024-01-01' },
  { id: 'c18', name: 'Klarna', description: 'Buy now, pay later payment solutions', sector: 'Financial Services', stage: 'Pre-IPO', founded: 2005, hq_city: 'Stockholm', hq_state: 'SE', website: 'https://klarna.com', employee_count: 5000, created_at: '2024-01-01' },
  { id: 'c19', name: 'Notion', description: 'All-in-one workspace for notes, docs, and collaboration', sector: 'Technology', stage: 'Series C', founded: 2013, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://notion.so', employee_count: 800, created_at: '2024-01-01' },
  { id: 'c20', name: 'Airtable', description: 'Cloud collaboration platform combining spreadsheet and database', sector: 'Technology', stage: 'Series D+', founded: 2012, hq_city: 'San Francisco', hq_state: 'CA', website: 'https://airtable.com', employee_count: 900, created_at: '2024-01-01' },
]

// --- Financials (synthetic but realistic) ---
function genFinancials(companyId: string, baseRevenue: number, growth: number, margin: number): Financial[] {
  const periods = ['FY2022', 'FY2023', 'FY2024']
  return periods.map((period, i) => {
    const rev = baseRevenue * Math.pow(1 + growth, i)
    const arr = rev * (0.85 + Math.random() * 0.15)
    return {
      id: `f-${companyId}-${i}`,
      company_id: companyId,
      period,
      period_date: `${2022 + i}-12-31`,
      revenue: Math.round(rev),
      arr: Math.round(arr),
      ebitda: Math.round(rev * margin),
      gross_margin: 0.65 + Math.random() * 0.2,
      net_income: Math.round(rev * (margin - 0.1)),
      burn_rate: margin < 0 ? Math.round(Math.abs(rev * margin)) : null,
      runway_months: margin < 0 ? Math.round(24 + Math.random() * 24) : null,
      employees: Math.round(100 + rev / 200000),
    }
  })
}

export const financials: Financial[] = [
  ...genFinancials('c1', 14000000000, 0.25, 0.30),
  ...genFinancials('c2', 8000000000, 0.40, 0.15),
  ...genFinancials('c3', 1600000000, 0.50, 0.10),
  ...genFinancials('c4', 1800000000, 0.35, 0.35),
  ...genFinancials('c5', 600000000, 0.30, 0.05),
  ...genFinancials('c6', 700000000, 0.40, 0.25),
  ...genFinancials('c7', 850000000, 1.50, -0.30),
  ...genFinancials('c8', 900000000, 0.60, 0.12),
  ...genFinancials('c9', 500000000, 0.80, -0.10),
  ...genFinancials('c10', 550000000, 0.20, 0.08),
  ...genFinancials('c11', 4000000000, 0.15, 0.02),
  ...genFinancials('c12', 350000000, 0.45, -0.20),
  ...genFinancials('c13', 500000000, 0.35, 0.05),
  ...genFinancials('c14', 700000000, 0.45, -0.15),
  ...genFinancials('c15', 200000000, 0.90, -0.40),
  ...genFinancials('c16', 750000000, 0.55, 0.10),
  ...genFinancials('c17', 500000000, 1.00, -0.10),
  ...genFinancials('c18', 2000000000, 0.20, 0.05),
  ...genFinancials('c19', 300000000, 0.40, 0.15),
  ...genFinancials('c20', 450000000, 0.25, -0.05),
]

// --- Funding Rounds ---
export const fundingRounds: FundingRound[] = [
  { id: 'fr1', company_id: 'c1', round_type: 'Series I', date: '2023-03-15', amount_raised: 6500000000, pre_money_valuation: 43500000000, post_money_valuation: 50000000000, lead_investor: 'Sequoia Capital', investors: ['Sequoia Capital', 'Andreessen Horowitz', 'GIC'] },
  { id: 'fr2', company_id: 'c2', round_type: 'Series N', date: '2024-06-10', amount_raised: 750000000, pre_money_valuation: 209000000000, post_money_valuation: 210000000000, lead_investor: 'Andreessen Horowitz', investors: ['Andreessen Horowitz', 'Founders Fund', 'Sequoia Capital'] },
  { id: 'fr3', company_id: 'c3', round_type: 'Series I', date: '2023-09-14', amount_raised: 500000000, pre_money_valuation: 42500000000, post_money_valuation: 43000000000, lead_investor: 'T. Rowe Price', investors: ['T. Rowe Price', 'Andreessen Horowitz', 'Franklin Templeton'] },
  { id: 'fr4', company_id: 'c4', round_type: 'Series F', date: '2021-09-01', amount_raised: 200000000, pre_money_valuation: 39800000000, post_money_valuation: 40000000000, lead_investor: 'T. Rowe Price', investors: ['T. Rowe Price', 'Franklin Templeton', 'Sequoia Capital'] },
  { id: 'fr5', company_id: 'c5', round_type: 'Series D', date: '2021-04-01', amount_raised: 425000000, pre_money_valuation: 12775000000, post_money_valuation: 13400000000, lead_investor: 'Altimeter Capital', investors: ['Altimeter Capital', 'Silver Lake', 'Ribbit Capital'] },
  { id: 'fr6', company_id: 'c6', round_type: 'Series E', date: '2021-06-01', amount_raised: 200000000, pre_money_valuation: 9800000000, post_money_valuation: 10000000000, lead_investor: 'a16z', investors: ['Andreessen Horowitz', 'Sequoia Capital', 'Kleiner Perkins'] },
  { id: 'fr7', company_id: 'c7', round_type: 'Series D', date: '2024-03-01', amount_raised: 2750000000, pre_money_valuation: 15250000000, post_money_valuation: 18000000000, lead_investor: 'Menlo Ventures', investors: ['Menlo Ventures', 'Google', 'Salesforce Ventures', 'Amazon'] },
  { id: 'fr8', company_id: 'c8', round_type: 'Series F', date: '2024-08-01', amount_raised: 1500000000, pre_money_valuation: 12500000000, post_money_valuation: 14000000000, lead_investor: 'Founders Fund', investors: ['Founders Fund', 'Andreessen Horowitz', 'General Atlantic'] },
  { id: 'fr9', company_id: 'c9', round_type: 'Series E', date: '2023-03-01', amount_raised: 500000000, pre_money_valuation: 10500000000, post_money_valuation: 11000000000, lead_investor: 'Greenoaks Capital', investors: ['Greenoaks Capital', 'Founders Fund'] },
  { id: 'fr10', company_id: 'c10', round_type: 'Series H', date: '2021-09-01', amount_raised: 500000000, pre_money_valuation: 14500000000, post_money_valuation: 15000000000, lead_investor: 'Dragoneer', investors: ['Dragoneer', 'Fidelity', 'Greenoaks'] },
  { id: 'fr11', company_id: 'c17', round_type: 'Series D', date: '2024-05-01', amount_raised: 1000000000, pre_money_valuation: 11000000000, post_money_valuation: 12000000000, lead_investor: 'Andreessen Horowitz', investors: ['Andreessen Horowitz', 'Lightspeed', 'Thrive Capital'] },
]

// --- Investors ---
export const investors: Investor[] = [
  { id: 'inv1', name: 'Sequoia Capital', type: 'VC', aum: 85000000000, hq: 'Menlo Park, CA', website: 'https://sequoiacap.com', portfolio_count: 350, focus_sectors: ['Technology', 'Healthcare', 'Financial Services'] },
  { id: 'inv2', name: 'Andreessen Horowitz', type: 'VC', aum: 42000000000, hq: 'Menlo Park, CA', website: 'https://a16z.com', portfolio_count: 400, focus_sectors: ['Technology', 'Consumer', 'Financial Services'] },
  { id: 'inv3', name: 'KKR', type: 'PE', aum: 553000000000, hq: 'New York, NY', website: 'https://kkr.com', portfolio_count: 200, focus_sectors: ['Industrial', 'Healthcare', 'Technology'] },
  { id: 'inv4', name: 'Apollo Global Management', type: 'PE', aum: 651000000000, hq: 'New York, NY', website: 'https://apollo.com', portfolio_count: 180, focus_sectors: ['Financial Services', 'Industrial', 'Real Estate'] },
  { id: 'inv5', name: 'Blackstone', type: 'PE', aum: 1000000000000, hq: 'New York, NY', website: 'https://blackstone.com', portfolio_count: 250, focus_sectors: ['Real Estate', 'Industrial', 'Technology'] },
  { id: 'inv6', name: 'Tiger Global', type: 'Hedge Fund', aum: 50000000000, hq: 'New York, NY', website: 'https://tigerglobal.com', portfolio_count: 300, focus_sectors: ['Technology', 'Consumer'] },
  { id: 'inv7', name: 'Founders Fund', type: 'VC', aum: 12000000000, hq: 'San Francisco, CA', website: 'https://foundersfund.com', portfolio_count: 150, focus_sectors: ['Technology', 'Industrial'] },
  { id: 'inv8', name: 'General Atlantic', type: 'PE', aum: 83000000000, hq: 'New York, NY', website: 'https://generalatlantic.com', portfolio_count: 200, focus_sectors: ['Technology', 'Healthcare', 'Financial Services'] },
  { id: 'inv9', name: 'Lightspeed Venture Partners', type: 'VC', aum: 18000000000, hq: 'Menlo Park, CA', website: 'https://lsvp.com', portfolio_count: 300, focus_sectors: ['Technology', 'Healthcare'] },
  { id: 'inv10', name: 'Walton Family Office', type: 'Family Office', aum: 215000000000, hq: 'Bentonville, AR', website: '', portfolio_count: 50, focus_sectors: ['Consumer', 'Technology', 'Real Estate'] },
]

// --- Precedent Transactions ---
export const precedentTransactions: PrecedentTransaction[] = [
  { id: 'pt1', acquirer: 'Microsoft', target: 'Activision Blizzard', sector: 'Technology', date: '2023-10-13', deal_value: 69000000000, ev_revenue: 8.5, ev_ebitda: 22.0, deal_type: 'Acquisition' },
  { id: 'pt2', acquirer: 'Broadcom', target: 'VMware', sector: 'Technology', date: '2023-11-22', deal_value: 61000000000, ev_revenue: 4.8, ev_ebitda: 25.0, deal_type: 'Acquisition' },
  { id: 'pt3', acquirer: 'Cisco', target: 'Splunk', sector: 'Technology', date: '2024-03-18', deal_value: 28000000000, ev_revenue: 7.5, ev_ebitda: null, deal_type: 'Acquisition' },
  { id: 'pt4', acquirer: 'Synopsys', target: 'Ansys', sector: 'Technology', date: '2024-01-16', deal_value: 35000000000, ev_revenue: 15.0, ev_ebitda: 35.0, deal_type: 'Acquisition' },
  { id: 'pt5', acquirer: 'Hewlett Packard Enterprise', target: 'Juniper Networks', sector: 'Technology', date: '2024-01-09', deal_value: 14000000000, ev_revenue: 2.5, ev_ebitda: 18.0, deal_type: 'Acquisition' },
  { id: 'pt6', acquirer: 'Capital One', target: 'Discover Financial', sector: 'Financial Services', date: '2024-02-19', deal_value: 35300000000, ev_revenue: 2.2, ev_ebitda: 8.5, deal_type: 'Merger' },
  { id: 'pt7', acquirer: 'Johnson & Johnson', target: 'Shockwave Medical', sector: 'Healthcare', date: '2024-04-01', deal_value: 13100000000, ev_revenue: 18.0, ev_ebitda: 40.0, deal_type: 'Acquisition' },
  { id: 'pt8', acquirer: 'Diamondback Energy', target: 'Endeavor Energy', sector: 'Energy', date: '2024-02-12', deal_value: 26000000000, ev_revenue: 4.0, ev_ebitda: 6.5, deal_type: 'Merger' },
  { id: 'pt9', acquirer: 'Mars', target: 'Kellanova', sector: 'Consumer', date: '2024-08-14', deal_value: 36000000000, ev_revenue: 2.3, ev_ebitda: 16.0, deal_type: 'Acquisition' },
  { id: 'pt10', acquirer: 'CoStar Group', target: 'Matterport', sector: 'Real Estate', date: '2024-04-22', deal_value: 1600000000, ev_revenue: 10.0, ev_ebitda: null, deal_type: 'Acquisition' },
  { id: 'pt11', acquirer: 'Thoma Bravo', target: 'Darktrace', sector: 'Technology', date: '2024-04-26', deal_value: 5320000000, ev_revenue: 8.2, ev_ebitda: 30.0, deal_type: 'LBO' },
  { id: 'pt12', acquirer: 'Silver Lake', target: 'Endeavor Group', sector: 'Media', date: '2024-04-02', deal_value: 13000000000, ev_revenue: 1.8, ev_ebitda: 12.0, deal_type: 'LBO' },
]

// --- Distressed Assets ---
export const distressedAssets: DistressedAsset[] = [
  { id: 'da1', company_name: 'Rite Aid', asset_type: 'Bankruptcy', sector: 'Healthcare', location: 'Philadelphia, PA', estimated_value: 2400000000, discount_pct: 65, status: 'Active', description: 'Chapter 11 bankruptcy with 2,000+ pharmacy locations. Significant real estate portfolio and prescription file value.', filing_date: '2023-10-15', source: 'PACER' },
  { id: 'da2', company_name: 'WeWork', asset_type: 'Bankruptcy', sector: 'Real Estate', location: 'New York, NY', estimated_value: 900000000, discount_pct: 85, status: 'Active', description: 'Chapter 11 filing with extensive global lease portfolio. Potential value in lease renegotiations and sublease rights.', filing_date: '2023-11-06', source: 'PACER' },
  { id: 'da3', company_name: 'Yellow Corp', asset_type: 'Bankruptcy', sector: 'Industrial', location: 'Nashville, TN', estimated_value: 1800000000, discount_pct: 50, status: 'Under Review', description: 'Trucking company with valuable terminal real estate and logistics network. 300+ terminals nationwide.', filing_date: '2023-08-06', source: 'PACER' },
  { id: 'da4', company_name: 'Envision Healthcare', asset_type: 'Bankruptcy', sector: 'Healthcare', location: 'Nashville, TN', estimated_value: 3200000000, discount_pct: 70, status: 'Active', description: 'Physician staffing company with hospital contracts. Former KKR portfolio company.', filing_date: '2023-05-15', source: 'PACER' },
  { id: 'da5', company_name: 'Lordstown Motors', asset_type: 'Bankruptcy', sector: 'Industrial', location: 'Lordstown, OH', estimated_value: 150000000, discount_pct: 90, status: 'Closed', description: 'EV startup with manufacturing facility. Patent portfolio and production equipment.', filing_date: '2023-06-27', source: 'PACER' },
  { id: 'da6', company_name: 'Regional Mall Portfolio', asset_type: 'Receivership', sector: 'Real Estate', location: 'Multi-state', estimated_value: 340000000, discount_pct: 55, status: 'Active', description: '12 regional malls across the Midwest in receivership. Anchor tenant departures creating redevelopment opportunities.', filing_date: '2024-01-15', source: 'Court Records' },
  { id: 'da7', company_name: 'GreenTech Solar', asset_type: 'Turnaround', sector: 'Energy', location: 'Austin, TX', estimated_value: 80000000, discount_pct: 40, status: 'Active', description: 'Solar panel manufacturer with supply chain issues. Strong IP portfolio and government contracts pending.', filing_date: '2024-03-01', source: 'Industry Source' },
  { id: 'da8', company_name: 'Pacific Northwest Timber', asset_type: 'Tax Lien', sector: 'Industrial', location: 'Portland, OR', estimated_value: 25000000, discount_pct: 30, status: 'Active', description: '15,000 acres of timberland with delinquent tax liens. Carbon credit potential.', filing_date: '2024-02-20', source: 'County Records' },
]

// --- Real Estate Listings ---
export const realEstateListings: RealEstateListing[] = [
  { id: 'rel1', property_name: 'The Metropolitan at Midtown', type: 'Multifamily', address: '450 Peachtree St NE', city: 'Atlanta', state: 'GA', asking_price: 85000000, cap_rate: 5.2, sqft: 350000, units: 380, occupancy_pct: 94, listing_type: 'Off-Market', description: 'Class A multifamily with premium amenities. Strong rent growth market.' },
  { id: 'rel2', property_name: 'Crossroads Industrial Park', type: 'Industrial', address: '8900 Distribution Blvd', city: 'Dallas', state: 'TX', asking_price: 120000000, cap_rate: 6.1, sqft: 800000, occupancy_pct: 97, listing_type: 'Pocket Listing', description: 'Last-mile logistics hub near DFW Airport. Triple-net leases with credit tenants.' },
  { id: 'rel3', property_name: 'One Financial Plaza', type: 'Office', address: '100 Pearl St', city: 'Hartford', state: 'CT', asking_price: 42000000, cap_rate: 8.5, sqft: 420000, occupancy_pct: 72, listing_type: 'Off-Market', description: 'CBD office tower with below-market rents. Value-add opportunity with lease-up potential.' },
  { id: 'rel4', property_name: 'Lakeside Village Shopping Center', type: 'Retail', address: '2200 Lake Shore Dr', city: 'Chicago', state: 'IL', asking_price: 55000000, cap_rate: 7.2, sqft: 280000, occupancy_pct: 88, listing_type: 'Pre-Foreclosure', description: 'Grocery-anchored retail center. Distressed seller creating below-replacement-cost opportunity.' },
  { id: 'rel5', property_name: 'Harbor Point Mixed-Use', type: 'Mixed Use', address: '1 Harbor Point Rd', city: 'Stamford', state: 'CT', asking_price: 150000000, cap_rate: 5.8, sqft: 600000, units: 200, occupancy_pct: 91, listing_type: '1031 Exchange', description: 'Waterfront mixed-use with residential, retail, and marina. 1031 exchange opportunity.' },
  { id: 'rel6', property_name: 'Desert Ridge Industrial', type: 'Industrial', address: '15000 N Scottsdale Rd', city: 'Scottsdale', state: 'AZ', asking_price: 35000000, cap_rate: 5.9, sqft: 200000, occupancy_pct: 100, listing_type: 'Off-Market', description: 'Modern cold storage and distribution facility. Single tenant, 10-year NNN lease.' },
]

// --- Intelligence Signals ---
export const intelligenceSignals: IntelligenceSignal[] = [
  { id: 'is1', title: 'Stripe Raises New Round at $70B Valuation', summary: 'Stripe reportedly in discussions for a new funding round that would value the payments giant at $70 billion, a significant recovery from its 2023 down round.', sector: 'Technology', signal_type: 'Funding', sentiment: 'positive', source: 'Bloomberg', published_at: '2024-12-01', companies: ['Stripe'] },
  { id: 'is2', title: 'SEC Proposes New Private Fund Disclosure Rules', summary: 'The SEC is considering new regulations that would require private equity and hedge funds to provide more transparent fee and performance disclosures to investors.', sector: 'Financial Services', signal_type: 'Regulatory', sentiment: 'negative', source: 'SEC.gov', published_at: '2024-11-15', companies: [] },
  { id: 'is3', title: 'Wiz Rejects $23B Google Acquisition Offer', summary: 'Cloud security startup Wiz has rejected a $23 billion acquisition offer from Google, opting instead to pursue an IPO.', sector: 'Technology', signal_type: 'M&A', sentiment: 'positive', source: 'WSJ', published_at: '2024-07-22', companies: ['Wiz'] },
  { id: 'is4', title: 'AI Infrastructure Spending Surge Expected', summary: 'Global AI infrastructure spending projected to exceed $200B in 2025, driven by data center buildout and custom silicon demand.', sector: 'Technology', signal_type: 'Market Shift', sentiment: 'positive', source: 'Gartner', published_at: '2024-11-28', companies: ['Cerebras', 'Scale AI'] },
  { id: 'is5', title: 'Distressed Debt Volume Hits 3-Year High', summary: 'Corporate distressed debt volume has reached $400B, the highest level since 2021, creating opportunities for special situations investors.', sector: 'Financial Services', signal_type: 'Market Shift', sentiment: 'neutral', source: 'S&P Global', published_at: '2024-12-05', companies: [] },
  { id: 'is6', title: 'Anthropic CEO Appointed to AI Advisory Board', summary: 'Dario Amodei has been appointed to the White House AI advisory board, signaling growing government engagement with AI safety.', sector: 'Technology', signal_type: 'Personnel', sentiment: 'positive', source: 'Reuters', published_at: '2024-10-20', companies: ['Anthropic'] },
  { id: 'is7', title: 'Industrial REIT Cap Rates Compress to Record Lows', summary: 'Industrial real estate cap rates have compressed to 4.5-5.5% nationally, driven by e-commerce demand and limited new supply.', sector: 'Real Estate', signal_type: 'Market Shift', sentiment: 'positive', source: 'CBRE', published_at: '2024-11-01', companies: [] },
  { id: 'is8', title: 'Klarna Files Confidential IPO Registration', summary: 'Swedish fintech Klarna has filed a confidential registration statement with the SEC for a potential US IPO in early 2025.', sector: 'Financial Services', signal_type: 'IPO', sentiment: 'positive', source: 'FT', published_at: '2024-11-20', companies: ['Klarna'] },
]

// --- Demo Deals ---
export const demoDeals: Deal[] = [
  { id: 'd1', company_name: 'Databricks', company_id: 'c3', stage: 'Due Diligence', priority: 'High', deal_size: 25000000, sector: 'Technology', assigned_to: 'Partner A', notes: 'Secondary share purchase. Strong ARR growth trajectory.', created_at: '2024-10-01', updated_at: '2024-12-01', tasks: [{ id: 'dt1', deal_id: 'd1', title: 'Review latest financials', completed: true }, { id: 'dt2', deal_id: 'd1', title: 'Complete management reference calls', completed: false }] },
  { id: 'd2', company_name: 'Anduril', company_id: 'c8', stage: 'Sourced', priority: 'Medium', deal_size: 15000000, sector: 'Industrial', assigned_to: 'Associate B', notes: 'Co-invest opportunity via Founders Fund allocation.', created_at: '2024-11-15', updated_at: '2024-11-15', tasks: [{ id: 'dt3', deal_id: 'd2', title: 'Request data room access', completed: false }] },
  { id: 'd3', company_name: 'Wiz', company_id: 'c17', stage: 'IC Review', priority: 'Critical', deal_size: 50000000, sector: 'Technology', assigned_to: 'Partner A', notes: 'Pre-IPO round. Must decide by EOW.', created_at: '2024-09-01', updated_at: '2024-12-05', tasks: [{ id: 'dt4', deal_id: 'd3', title: 'Prepare IC memo', completed: true }, { id: 'dt5', deal_id: 'd3', title: 'Model IPO scenarios', completed: true }, { id: 'dt6', deal_id: 'd3', title: 'Final pricing analysis', completed: false }] },
  { id: 'd4', company_name: 'Regional Mall Portfolio', stage: 'Screening', priority: 'Low', deal_size: 340000000, sector: 'Real Estate', assigned_to: 'VP C', notes: 'Distressed acquisition. Significant capex required.', created_at: '2024-11-01', updated_at: '2024-11-20', tasks: [{ id: 'dt7', deal_id: 'd4', title: 'Site visits scheduled', completed: false }] },
  { id: 'd5', company_name: 'Stripe', company_id: 'c1', stage: 'Term Sheet', priority: 'High', deal_size: 100000000, sector: 'Technology', assigned_to: 'Partner A', notes: 'Large secondary block. Excellent risk-adjusted return profile.', created_at: '2024-08-01', updated_at: '2024-12-01', tasks: [{ id: 'dt8', deal_id: 'd5', title: 'Legal review complete', completed: true }, { id: 'dt9', deal_id: 'd5', title: 'Wire transfer setup', completed: false }] },
  { id: 'd6', company_name: 'GreenTech Solar', stage: 'Closed', priority: 'Medium', deal_size: 20000000, sector: 'Energy', assigned_to: 'VP C', notes: 'Turnaround investment completed. Board seat secured.', created_at: '2024-06-01', updated_at: '2024-10-15', tasks: [] },
]
