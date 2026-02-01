// Test fixtures for database integration tests
import type { Database } from '@/types/database'

type Company = Database['public']['Tables']['companies']['Row']
type Property = Database['public']['Tables']['properties']['Row']
type User = Database['public']['Tables']['users']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']
type TrackedAsset = Database['public']['Tables']['tracked_assets']['Row']

// Test User Fixtures
export const testUsers: Omit<User, 'created_at' | 'updated_at'>[] = [
  {
    id: 'test-user-1',
    email: 'test1@example.com',
    full_name: 'Test User One',
    avatar_url: null,
  },
  {
    id: 'test-user-2',
    email: 'test2@example.com',
    full_name: 'Test User Two',
    avatar_url: null,
  },
  {
    id: 'test-user-3',
    email: 'enterprise@example.com',
    full_name: 'Enterprise User',
    avatar_url: null,
  },
]

// Test Subscription Fixtures
export const testSubscriptions: Omit<Subscription, 'created_at' | 'updated_at'>[] = [
  {
    id: 'sub-free-1',
    user_id: 'test-user-1',
    stripe_customer_id: 'cus_test1',
    stripe_subscription_id: null,
    plan: 'free',
    status: 'active',
    current_period_end: null,
  },
  {
    id: 'sub-pro-1',
    user_id: 'test-user-2',
    stripe_customer_id: 'cus_test2',
    stripe_subscription_id: 'sub_test2',
    plan: 'professional',
    status: 'active',
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub-enterprise-1',
    user_id: 'test-user-3',
    stripe_customer_id: 'cus_test3',
    stripe_subscription_id: 'sub_test3',
    plan: 'enterprise',
    status: 'active',
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Test Company Fixtures
export const testCompanies: Omit<Company, 'created_at' | 'updated_at'>[] = [
  {
    id: 'company-1',
    name: 'TechSolutions Inc',
    industry: 'IT Services',
    revenue: 15000000,
    ebitda: 2250000,
    employees: 120,
    founded_year: 2015,
    headquarters: 'Austin, TX',
    description: 'Enterprise software solutions provider',
    website: 'https://techsolutions.example.com',
    valuation_low: null,
    valuation_mid: null,
    valuation_high: null,
  },
  {
    id: 'company-2',
    name: 'MedDevice Corp',
    industry: 'Healthcare',
    revenue: 25000000,
    ebitda: 5000000,
    employees: 180,
    founded_year: 2010,
    headquarters: 'Boston, MA',
    description: 'Medical device manufacturing',
    website: 'https://meddevice.example.com',
    valuation_low: null,
    valuation_mid: null,
    valuation_high: null,
  },
  {
    id: 'company-3',
    name: 'ManufacturePro LLC',
    industry: 'Manufacturing',
    revenue: 35000000,
    ebitda: 4900000,
    employees: 250,
    founded_year: 2005,
    headquarters: 'Cleveland, OH',
    description: 'Industrial manufacturing and assembly',
    website: 'https://manufacturepro.example.com',
    valuation_low: null,
    valuation_mid: null,
    valuation_high: null,
  },
  {
    id: 'company-4',
    name: 'LogiFreight Systems',
    industry: 'Logistics',
    revenue: 45000000,
    ebitda: 4500000,
    employees: 320,
    founded_year: 2012,
    headquarters: 'Memphis, TN',
    description: 'Freight and logistics management',
    website: 'https://logifreight.example.com',
    valuation_low: null,
    valuation_mid: null,
    valuation_high: null,
  },
  {
    id: 'company-5',
    name: 'BizConsult Partners',
    industry: 'Business Services',
    revenue: 8000000,
    ebitda: 1600000,
    employees: 45,
    founded_year: 2018,
    headquarters: 'Chicago, IL',
    description: 'Business consulting and advisory',
    website: 'https://bizconsult.example.com',
    valuation_low: null,
    valuation_mid: null,
    valuation_high: null,
  },
]

// Test Real Estate Fixtures
export const testProperties: Omit<Property, 'created_at' | 'updated_at'>[] = [
  {
    id: 'property-1',
    name: 'Downtown Office Tower',
    property_type: 'Office',
    address: '100 Main Street',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    square_feet: 150000,
    year_built: 2015,
    occupancy_rate: 95,
    noi: 4500000,
    cap_rate: 5.5,
    asking_price: 82000000,
    valuation_low: null,
    valuation_mid: null,
    valuation_high: null,
  },
  {
    id: 'property-2',
    name: 'Industrial Distribution Center',
    property_type: 'Industrial',
    address: '500 Logistics Way',
    city: 'Dallas',
    state: 'TX',
    zip_code: '75001',
    square_feet: 250000,
    year_built: 2020,
    occupancy_rate: 100,
    noi: 2800000,
    cap_rate: 6.0,
    asking_price: 47000000,
    valuation_low: null,
    valuation_mid: null,
    valuation_high: null,
  },
  {
    id: 'property-3',
    name: 'Suburban Retail Center',
    property_type: 'Retail',
    address: '200 Shopping Lane',
    city: 'Atlanta',
    state: 'GA',
    zip_code: '30301',
    square_feet: 80000,
    year_built: 2008,
    occupancy_rate: 88,
    noi: 1200000,
    cap_rate: 7.5,
    asking_price: 16000000,
    valuation_low: null,
    valuation_mid: null,
    valuation_high: null,
  },
  {
    id: 'property-4',
    name: 'Urban Apartment Complex',
    property_type: 'Multifamily',
    address: '300 Residence Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip_code: '90001',
    square_feet: 120000,
    year_built: 2018,
    occupancy_rate: 97,
    noi: 3200000,
    cap_rate: 4.5,
    asking_price: 71000000,
    valuation_low: null,
    valuation_mid: null,
    valuation_high: null,
  },
  {
    id: 'property-5',
    name: 'Mixed-Use Development',
    property_type: 'Mixed-Use',
    address: '400 Central Ave',
    city: 'Chicago',
    state: 'IL',
    zip_code: '60601',
    square_feet: 200000,
    year_built: 2022,
    occupancy_rate: 92,
    noi: 5500000,
    cap_rate: 5.0,
    asking_price: 110000000,
    valuation_low: null,
    valuation_mid: null,
    valuation_high: null,
  },
]

// Test Tracked Assets Fixtures
export const testTrackedAssets: Omit<TrackedAsset, 'created_at'>[] = [
  {
    id: 'tracked-1',
    user_id: 'test-user-2',
    asset_type: 'company',
    asset_id: 'company-1',
    notes: 'Potential acquisition target',
  },
  {
    id: 'tracked-2',
    user_id: 'test-user-2',
    asset_type: 'property',
    asset_id: 'property-1',
    notes: 'Good cap rate in prime location',
  },
  {
    id: 'tracked-3',
    user_id: 'test-user-3',
    asset_type: 'company',
    asset_id: 'company-2',
    notes: 'Healthcare sector expansion',
  },
  {
    id: 'tracked-4',
    user_id: 'test-user-3',
    asset_type: 'company',
    asset_id: 'company-3',
    notes: null,
  },
  {
    id: 'tracked-5',
    user_id: 'test-user-3',
    asset_type: 'property',
    asset_id: 'property-4',
    notes: 'Multifamily opportunity',
  },
]

// Helper function to generate random test data
export function generateTestCompany(
  overrides: Partial<Omit<Company, 'created_at' | 'updated_at'>> = {}
): Omit<Company, 'created_at' | 'updated_at'> {
  const id = `company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  return {
    id,
    name: `Test Company ${id}`,
    industry: 'IT Services',
    revenue: Math.floor(Math.random() * 50000000) + 5000000,
    ebitda: Math.floor(Math.random() * 5000000) + 500000,
    employees: Math.floor(Math.random() * 500) + 10,
    founded_year: 2000 + Math.floor(Math.random() * 25),
    headquarters: 'Test City, TS',
    description: 'A test company for integration testing',
    website: null,
    valuation_low: null,
    valuation_mid: null,
    valuation_high: null,
    ...overrides,
  }
}

export function generateTestProperty(
  overrides: Partial<Omit<Property, 'created_at' | 'updated_at'>> = {}
): Omit<Property, 'created_at' | 'updated_at'> {
  const id = `property-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  return {
    id,
    name: `Test Property ${id}`,
    property_type: 'Office',
    address: '123 Test Street',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    square_feet: Math.floor(Math.random() * 200000) + 10000,
    year_built: 1990 + Math.floor(Math.random() * 35),
    occupancy_rate: Math.floor(Math.random() * 20) + 80,
    noi: Math.floor(Math.random() * 5000000) + 500000,
    cap_rate: Math.random() * 4 + 4,
    asking_price: Math.floor(Math.random() * 100000000) + 10000000,
    valuation_low: null,
    valuation_mid: null,
    valuation_high: null,
    ...overrides,
  }
}
