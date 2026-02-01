/**
 * Database Integration Tests for Real Estate Properties
 *
 * These tests verify the database operations for the properties table
 * including CRUD operations, filtering, pagination, and valuation queries.
 *
 * Note: These tests require a test database connection.
 * Run with: npm run test:integration
 */

import { createClient } from '@supabase/supabase-js'
import { testProperties, generateTestProperty } from './fixtures'
import type { Database } from '@/types/database'

// Skip tests if no test database is configured
const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL
const TEST_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY
const TEST_SUPABASE_SERVICE_KEY = process.env.TEST_SUPABASE_SERVICE_KEY

const describeIfDb = TEST_SUPABASE_URL && TEST_SUPABASE_ANON_KEY
  ? describe
  : describe.skip

describeIfDb('Real Estate Database Integration Tests', () => {
  let supabase: ReturnType<typeof createClient<Database>>
  let adminSupabase: ReturnType<typeof createClient<Database>>

  beforeAll(() => {
    supabase = createClient<Database>(
      TEST_SUPABASE_URL!,
      TEST_SUPABASE_ANON_KEY!
    )

    if (TEST_SUPABASE_SERVICE_KEY) {
      adminSupabase = createClient<Database>(
        TEST_SUPABASE_URL!,
        TEST_SUPABASE_SERVICE_KEY
      )
    }
  })

  describe('Read Operations', () => {
    it('fetches all properties', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
    })

    it('fetches properties with specific fields', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, property_type, city, noi, cap_rate')
        .limit(5)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        const property = data[0]
        expect(property).toHaveProperty('id')
        expect(property).toHaveProperty('name')
        expect(property).toHaveProperty('property_type')
        expect(property).toHaveProperty('city')
        expect(property).toHaveProperty('noi')
        expect(property).toHaveProperty('cap_rate')
      }
    })

    it('fetches a single property by ID', async () => {
      // First get a property ID
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .limit(1)

      if (properties && properties.length > 0) {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', properties[0].id)
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data?.id).toBe(properties[0].id)
      }
    })
  })

  describe('Property Type Filtering', () => {
    const propertyTypes = ['Office', 'Industrial', 'Retail', 'Multifamily', 'Mixed-Use']

    propertyTypes.forEach((propertyType) => {
      it(`filters by property type: ${propertyType}`, async () => {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('property_type', propertyType)
          .limit(5)

        expect(error).toBeNull()
        expect(data).toBeDefined()

        if (data && data.length > 0) {
          data.forEach((property) => {
            expect(property.property_type).toBe(propertyType)
          })
        }
      })
    })
  })

  describe('Location Filtering', () => {
    it('filters by city', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('city', 'New York')
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((property) => {
          expect(property.city).toBe('New York')
        })
      }
    })

    it('filters by state', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('state', 'CA')
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((property) => {
          expect(property.state).toBe('CA')
        })
      }
    })

    it('searches by city name (partial match)', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .ilike('city', '%new%')
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((property) => {
          expect(property.city.toLowerCase()).toContain('new')
        })
      }
    })
  })

  describe('Financial Filtering', () => {
    it('filters by NOI range', async () => {
      const minNOI = 1000000
      const maxNOI = 5000000

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .gte('noi', minNOI)
        .lte('noi', maxNOI)
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((property) => {
          expect(property.noi).toBeGreaterThanOrEqual(minNOI)
          expect(property.noi).toBeLessThanOrEqual(maxNOI)
        })
      }
    })

    it('filters by cap rate', async () => {
      const minCapRate = 5.0
      const maxCapRate = 7.0

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .gte('cap_rate', minCapRate)
        .lte('cap_rate', maxCapRate)
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((property) => {
          expect(property.cap_rate).toBeGreaterThanOrEqual(minCapRate)
          expect(property.cap_rate).toBeLessThanOrEqual(maxCapRate)
        })
      }
    })

    it('filters by asking price', async () => {
      const maxPrice = 50000000

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .lte('asking_price', maxPrice)
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((property) => {
          expect(property.asking_price).toBeLessThanOrEqual(maxPrice)
        })
      }
    })

    it('filters by occupancy rate', async () => {
      const minOccupancy = 90

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .gte('occupancy_rate', minOccupancy)
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((property) => {
          expect(property.occupancy_rate).toBeGreaterThanOrEqual(minOccupancy)
        })
      }
    })
  })

  describe('Physical Property Filtering', () => {
    it('filters by square footage', async () => {
      const minSqFt = 50000
      const maxSqFt = 200000

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .gte('square_feet', minSqFt)
        .lte('square_feet', maxSqFt)
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((property) => {
          expect(property.square_feet).toBeGreaterThanOrEqual(minSqFt)
          expect(property.square_feet).toBeLessThanOrEqual(maxSqFt)
        })
      }
    })

    it('filters by year built', async () => {
      const minYear = 2010

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .gte('year_built', minYear)
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((property) => {
          expect(property.year_built).toBeGreaterThanOrEqual(minYear)
        })
      }
    })
  })

  describe('Ordering', () => {
    it('orders by NOI descending (highest income first)', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('noi')
        .order('noi', { ascending: false })
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          expect(data[i].noi).toBeLessThanOrEqual(data[i - 1].noi)
        }
      }
    })

    it('orders by cap rate ascending (best deals first)', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('cap_rate')
        .order('cap_rate', { ascending: true })
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          expect(data[i].cap_rate).toBeGreaterThanOrEqual(data[i - 1].cap_rate)
        }
      }
    })

    it('orders by asking price ascending', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('asking_price')
        .order('asking_price', { ascending: true })
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          expect(data[i].asking_price).toBeGreaterThanOrEqual(
            data[i - 1].asking_price
          )
        }
      }
    })
  })

  describe('Complex Queries', () => {
    it('finds high-yield office properties in major cities', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('property_type', 'Office')
        .gte('cap_rate', 5.0)
        .in('city', ['New York', 'Los Angeles', 'Chicago', 'Boston'])
        .order('cap_rate', { ascending: false })
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((property) => {
          expect(property.property_type).toBe('Office')
          expect(property.cap_rate).toBeGreaterThanOrEqual(5.0)
        })
      }
    })

    it('finds newly built industrial properties', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('property_type', 'Industrial')
        .gte('year_built', 2015)
        .gte('square_feet', 100000)
        .order('year_built', { ascending: false })
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((property) => {
          expect(property.property_type).toBe('Industrial')
          expect(property.year_built).toBeGreaterThanOrEqual(2015)
          expect(property.square_feet).toBeGreaterThanOrEqual(100000)
        })
      }
    })

    it('calculates implied value from NOI and cap rate', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('noi, cap_rate, asking_price')
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((property) => {
          const impliedValue = property.noi / (property.cap_rate / 100)
          // Check that implied value is within reasonable range of asking price
          const ratio = property.asking_price / impliedValue
          expect(ratio).toBeGreaterThan(0.5)
          expect(ratio).toBeLessThan(2.0)
        })
      }
    })
  })

  describe('Aggregations', () => {
    it('gets property count by type', async () => {
      const propertyTypes = ['Office', 'Industrial', 'Retail', 'Multifamily']

      for (const propertyType of propertyTypes) {
        const { count, error } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('property_type', propertyType)

        expect(error).toBeNull()
        expect(typeof count).toBe('number')
      }
    })

    it('gets total count of all properties', async () => {
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })

      expect(error).toBeNull()
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Write Operations (with admin client)', () => {
    const describeWithAdmin = TEST_SUPABASE_SERVICE_KEY
      ? describe
      : describe.skip

    describeWithAdmin('Create, Update, Delete', () => {
      let testPropertyId: string

      afterAll(async () => {
        if (testPropertyId && adminSupabase) {
          await adminSupabase.from('properties').delete().eq('id', testPropertyId)
        }
      })

      it('creates a new property', async () => {
        const newProperty = generateTestProperty({
          name: 'Integration Test Property',
          property_type: 'Office',
          city: 'Test City',
        })

        const { data, error } = await adminSupabase
          .from('properties')
          .insert(newProperty)
          .select()
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data?.name).toBe('Integration Test Property')

        testPropertyId = data!.id
      })

      it('updates a property', async () => {
        if (!testPropertyId) {
          throw new Error('Test property not created')
        }

        const { data, error } = await adminSupabase
          .from('properties')
          .update({
            noi: 3000000,
            cap_rate: 6.5,
            occupancy_rate: 95,
          })
          .eq('id', testPropertyId)
          .select()
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data?.noi).toBe(3000000)
        expect(data?.cap_rate).toBe(6.5)
        expect(data?.occupancy_rate).toBe(95)
      })

      it('deletes a property', async () => {
        if (!testPropertyId) {
          throw new Error('Test property not created')
        }

        const { error } = await adminSupabase
          .from('properties')
          .delete()
          .eq('id', testPropertyId)

        expect(error).toBeNull()

        const { data } = await adminSupabase
          .from('properties')
          .select('*')
          .eq('id', testPropertyId)
          .maybeSingle()

        expect(data).toBeNull()

        testPropertyId = ''
      })
    })
  })
})

// Mock tests for when database is not available
describe('Real Estate Database Tests (Mocked)', () => {
  it('has valid test fixtures', () => {
    expect(testProperties.length).toBeGreaterThan(0)

    testProperties.forEach((property) => {
      expect(property.id).toBeDefined()
      expect(property.name).toBeDefined()
      expect(property.property_type).toBeDefined()
      expect(property.city).toBeDefined()
      expect(property.noi).toBeGreaterThan(0)
      expect(property.cap_rate).toBeGreaterThan(0)
    })
  })

  it('generates valid test properties', () => {
    const generated = generateTestProperty()

    expect(generated.id).toBeDefined()
    expect(generated.name).toBeDefined()
    expect(generated.property_type).toBe('Office')
    expect(generated.noi).toBeGreaterThan(0)
    expect(generated.cap_rate).toBeGreaterThan(0)
    expect(generated.square_feet).toBeGreaterThan(0)
  })

  it('generates test properties with overrides', () => {
    const generated = generateTestProperty({
      name: 'Custom Property',
      property_type: 'Industrial',
      noi: 5000000,
      cap_rate: 7.5,
    })

    expect(generated.name).toBe('Custom Property')
    expect(generated.property_type).toBe('Industrial')
    expect(generated.noi).toBe(5000000)
    expect(generated.cap_rate).toBe(7.5)
  })

  it('validates cap rate calculations', () => {
    testProperties.forEach((property) => {
      // Cap rate should be between 3% and 12% for realistic properties
      expect(property.cap_rate).toBeGreaterThan(3)
      expect(property.cap_rate).toBeLessThan(12)
    })
  })
})
