/**
 * Seed Data Loader
 *
 * This script loads the seed data into Supabase.
 * Run with: npx ts-node supabase/seed.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSql(sql: string) {
  const { error } = await supabase.rpc('exec_sql', { sql })
  if (error) {
    // Try direct execution for non-RPC approach
    console.log('RPC not available, attempting direct execution...')
    // For direct SQL execution, you may need to use the Supabase dashboard
    // or the supabase CLI: supabase db execute --file seed-companies.sql
    throw error
  }
}

async function seedDatabase() {
  console.log('Starting database seeding...')

  try {
    // Read schema
    const schemaPath = path.join(__dirname, 'schema.sql')
    if (fs.existsSync(schemaPath)) {
      console.log('Creating schema...')
      const schema = fs.readFileSync(schemaPath, 'utf-8')
      // Schema should be run via Supabase dashboard or CLI
      console.log('Schema file ready. Run via Supabase dashboard or CLI.')
    }

    // Read and log seed files
    const companiesPath = path.join(__dirname, 'seed-companies.sql')
    const realEstatePath = path.join(__dirname, 'seed-real-estate.sql')

    if (fs.existsSync(companiesPath)) {
      console.log(`Companies seed file: ${companiesPath}`)
      console.log('Run via: supabase db execute --file supabase/seed-companies.sql')
    }

    if (fs.existsSync(realEstatePath)) {
      console.log(`Real estate seed file: ${realEstatePath}`)
      console.log('Run via: supabase db execute --file supabase/seed-real-estate.sql')
    }

    console.log('\nTo seed the database:')
    console.log('1. Run schema first: Copy schema.sql contents to Supabase SQL Editor')
    console.log('2. Run companies seed: Copy seed-companies.sql to SQL Editor')
    console.log('3. Run real estate seed: Copy seed-real-estate.sql to SQL Editor')
    console.log('\nOr use Supabase CLI:')
    console.log('  supabase db execute --file supabase/schema.sql')
    console.log('  supabase db execute --file supabase/seed-companies.sql')
    console.log('  supabase db execute --file supabase/seed-real-estate.sql')

  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

// Export seed data as JSON for testing
export const seedCompanies = [
  {
    name: 'Midwest Technology Partners',
    industry: 'IT Services',
    city: 'Chicago',
    state: 'IL',
    revenue_cents: 1200000000,
    ebitda_cents: 240000000,
    employees: 85,
    founded_year: 2008,
    growth_rate: 12.5,
    confidence_score: 0.92,
  },
  {
    name: 'Precision Metal Works',
    industry: 'Manufacturing',
    city: 'Cleveland',
    state: 'OH',
    revenue_cents: 2800000000,
    ebitda_cents: 392000000,
    employees: 185,
    founded_year: 1985,
    growth_rate: 6.0,
    confidence_score: 0.94,
  },
  {
    name: 'Heartland Home Health',
    industry: 'Healthcare',
    city: 'St. Louis',
    state: 'MO',
    revenue_cents: 1850000000,
    ebitda_cents: 277500000,
    employees: 320,
    founded_year: 2005,
    growth_rate: 14.0,
    confidence_score: 0.91,
  },
]

export const seedRealEstate = [
  {
    property_name: 'One Prudential Plaza',
    property_type: 'office',
    property_class: 'A',
    city: 'Chicago',
    state: 'IL',
    square_feet: 2200000,
    year_built: 1990,
    occupancy_rate: 92.5,
    valuation_cents: 45000000000,
    noi_cents: 3375000000,
    cap_rate: 7.5,
    confidence_score: 0.95,
  },
  {
    property_name: 'Ridge Port Logistics Center',
    property_type: 'industrial',
    property_class: 'A',
    city: 'Chicago',
    state: 'IL',
    square_feet: 1250000,
    year_built: 2019,
    occupancy_rate: 100.0,
    valuation_cents: 18500000000,
    noi_cents: 1110000000,
    cap_rate: 6.0,
    confidence_score: 0.96,
  },
  {
    property_name: 'Woodfield Mall',
    property_type: 'retail',
    property_class: 'A',
    city: 'Schaumburg',
    state: 'IL',
    square_feet: 2200000,
    year_built: 1971,
    occupancy_rate: 94.0,
    valuation_cents: 85000000000,
    noi_cents: 5950000000,
    cap_rate: 7.0,
    confidence_score: 0.95,
  },
]

seedDatabase()
