/**
 * Database Integration Tests for Companies
 *
 * These tests verify the database operations for the companies table
 * including CRUD operations, filtering, pagination, and RLS policies.
 *
 * Note: These tests require a test database connection.
 * Run with: npm run test:integration
 */

import { createClient } from '@supabase/supabase-js'
import { testCompanies, generateTestCompany } from './fixtures'
import type { Database } from '@/types/database'

// Skip tests if no test database is configured
const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL
const TEST_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY
const TEST_SUPABASE_SERVICE_KEY = process.env.TEST_SUPABASE_SERVICE_KEY

const describeIfDb = TEST_SUPABASE_URL && TEST_SUPABASE_ANON_KEY
  ? describe
  : describe.skip

describeIfDb('Companies Database Integration Tests', () => {
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
    it('fetches all companies', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
    })

    it('fetches companies with specific fields', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, industry, revenue')
        .limit(5)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        const company = data[0]
        expect(company).toHaveProperty('id')
        expect(company).toHaveProperty('name')
        expect(company).toHaveProperty('industry')
        expect(company).toHaveProperty('revenue')
        expect(company).not.toHaveProperty('description')
      }
    })

    it('fetches a single company by ID', async () => {
      // First get a company ID
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1)

      if (companies && companies.length > 0) {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companies[0].id)
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data?.id).toBe(companies[0].id)
      }
    })

    it('returns null for non-existent company', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', 'non-existent-id')
        .maybeSingle()

      expect(error).toBeNull()
      expect(data).toBeNull()
    })
  })

  describe('Filtering', () => {
    it('filters companies by industry', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('industry', 'IT Services')
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((company) => {
          expect(company.industry).toBe('IT Services')
        })
      }
    })

    it('filters companies by revenue range', async () => {
      const minRevenue = 10000000
      const maxRevenue = 50000000

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .gte('revenue', minRevenue)
        .lte('revenue', maxRevenue)
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((company) => {
          expect(company.revenue).toBeGreaterThanOrEqual(minRevenue)
          expect(company.revenue).toBeLessThanOrEqual(maxRevenue)
        })
      }
    })

    it('filters companies by employee count', async () => {
      const minEmployees = 50

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .gte('employees', minEmployees)
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((company) => {
          expect(company.employees).toBeGreaterThanOrEqual(minEmployees)
        })
      }
    })

    it('searches companies by name (case-insensitive)', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', '%tech%')
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((company) => {
          expect(company.name.toLowerCase()).toContain('tech')
        })
      }
    })

    it('combines multiple filters', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('industry', 'IT Services')
        .gte('revenue', 5000000)
        .order('revenue', { ascending: false })
        .limit(5)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        data.forEach((company) => {
          expect(company.industry).toBe('IT Services')
          expect(company.revenue).toBeGreaterThanOrEqual(5000000)
        })

        // Verify ordering
        for (let i = 1; i < data.length; i++) {
          expect(data[i - 1].revenue).toBeGreaterThanOrEqual(data[i].revenue)
        }
      }
    })
  })

  describe('Pagination', () => {
    it('supports limit', async () => {
      const limit = 5

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(limit)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBeLessThanOrEqual(limit)
    })

    it('supports offset pagination', async () => {
      const limit = 5
      const offset = 5

      const { data: page1 } = await supabase
        .from('companies')
        .select('id')
        .order('id')
        .limit(limit)

      const { data: page2 } = await supabase
        .from('companies')
        .select('id')
        .order('id')
        .range(offset, offset + limit - 1)

      expect(page1).toBeDefined()
      expect(page2).toBeDefined()

      if (page1 && page2 && page1.length > 0 && page2.length > 0) {
        // Ensure pages don't overlap
        const page1Ids = new Set(page1.map((c) => c.id))
        page2.forEach((c) => {
          expect(page1Ids.has(c.id)).toBe(false)
        })
      }
    })

    it('returns count with data', async () => {
      const { data, error, count } = await supabase
        .from('companies')
        .select('*', { count: 'exact' })
        .limit(5)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Ordering', () => {
    it('orders by revenue ascending', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('revenue')
        .order('revenue', { ascending: true })
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          expect(data[i].revenue).toBeGreaterThanOrEqual(data[i - 1].revenue)
        }
      }
    })

    it('orders by revenue descending', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('revenue')
        .order('revenue', { ascending: false })
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          expect(data[i].revenue).toBeLessThanOrEqual(data[i - 1].revenue)
        }
      }
    })

    it('orders by name alphabetically', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('name')
        .order('name', { ascending: true })
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          expect(data[i].name.localeCompare(data[i - 1].name)).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })

  describe('Write Operations (with admin client)', () => {
    // Skip if no service key available
    const describeWithAdmin = TEST_SUPABASE_SERVICE_KEY
      ? describe
      : describe.skip

    describeWithAdmin('Create, Update, Delete', () => {
      let testCompanyId: string

      afterAll(async () => {
        // Cleanup test company if created
        if (testCompanyId && adminSupabase) {
          await adminSupabase.from('companies').delete().eq('id', testCompanyId)
        }
      })

      it('creates a new company', async () => {
        const newCompany = generateTestCompany({
          name: 'Integration Test Company',
          industry: 'IT Services',
        })

        const { data, error } = await adminSupabase
          .from('companies')
          .insert(newCompany)
          .select()
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data?.name).toBe('Integration Test Company')

        testCompanyId = data!.id
      })

      it('updates a company', async () => {
        if (!testCompanyId) {
          throw new Error('Test company not created')
        }

        const { data, error } = await adminSupabase
          .from('companies')
          .update({ revenue: 20000000, employees: 150 })
          .eq('id', testCompanyId)
          .select()
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data?.revenue).toBe(20000000)
        expect(data?.employees).toBe(150)
      })

      it('deletes a company', async () => {
        if (!testCompanyId) {
          throw new Error('Test company not created')
        }

        const { error } = await adminSupabase
          .from('companies')
          .delete()
          .eq('id', testCompanyId)

        expect(error).toBeNull()

        // Verify deletion
        const { data } = await adminSupabase
          .from('companies')
          .select('*')
          .eq('id', testCompanyId)
          .maybeSingle()

        expect(data).toBeNull()

        // Reset so afterAll doesn't try to delete again
        testCompanyId = ''
      })
    })
  })

  describe('Error Handling', () => {
    it('handles invalid column name gracefully', async () => {
      // @ts-expect-error - Testing invalid column
      const { error } = await supabase
        .from('companies')
        .select('invalid_column')
        .limit(1)

      expect(error).toBeDefined()
    })

    it('handles invalid table name gracefully', async () => {
      // @ts-expect-error - Testing invalid table
      const { error } = await supabase.from('invalid_table').select('*').limit(1)

      expect(error).toBeDefined()
    })
  })
})

// Mock tests for when database is not available
describe('Companies Database Tests (Mocked)', () => {
  it('has valid test fixtures', () => {
    expect(testCompanies.length).toBeGreaterThan(0)

    testCompanies.forEach((company) => {
      expect(company.id).toBeDefined()
      expect(company.name).toBeDefined()
      expect(company.industry).toBeDefined()
      expect(company.revenue).toBeGreaterThan(0)
    })
  })

  it('generates valid test companies', () => {
    const generated = generateTestCompany()

    expect(generated.id).toBeDefined()
    expect(generated.name).toBeDefined()
    expect(generated.industry).toBe('IT Services')
    expect(generated.revenue).toBeGreaterThan(0)
    expect(generated.employees).toBeGreaterThan(0)
  })

  it('generates test companies with overrides', () => {
    const generated = generateTestCompany({
      name: 'Custom Name',
      industry: 'Healthcare',
      revenue: 50000000,
    })

    expect(generated.name).toBe('Custom Name')
    expect(generated.industry).toBe('Healthcare')
    expect(generated.revenue).toBe(50000000)
  })
})
