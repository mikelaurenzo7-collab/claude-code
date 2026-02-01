import {
  valuateCompany,
  getIndustryMultiples,
  calculateGrowthAdjustment,
  getSupportedIndustries,
  INDUSTRY_MULTIPLES,
} from '@/lib/valuation/company'
import type { CompanyValuationInput } from '@/types'

describe('Company Valuation Engine', () => {
  describe('getIndustryMultiples', () => {
    it('should return correct multiples for known industries', () => {
      expect(getIndustryMultiples('IT Services')).toEqual({
        revenue: 3.0,
        ebitda: 10.0,
      })
      expect(getIndustryMultiples('Manufacturing')).toEqual({
        revenue: 1.2,
        ebitda: 7.0,
      })
      expect(getIndustryMultiples('Healthcare')).toEqual({
        revenue: 2.0,
        ebitda: 9.0,
      })
    })

    it('should return default multiples for unknown industries', () => {
      expect(getIndustryMultiples('Unknown Industry')).toEqual({
        revenue: 2.0,
        ebitda: 8.0,
      })
    })

    it('should handle all supported industries', () => {
      Object.keys(INDUSTRY_MULTIPLES).forEach((industry) => {
        const multiples = getIndustryMultiples(industry)
        expect(multiples.revenue).toBeGreaterThan(0)
        expect(multiples.ebitda).toBeGreaterThan(0)
      })
    })
  })

  describe('calculateGrowthAdjustment', () => {
    it('should return 1 for undefined growth rate', () => {
      expect(calculateGrowthAdjustment()).toBe(1)
    })

    it('should return 1 for 0% growth', () => {
      expect(calculateGrowthAdjustment(0)).toBe(1)
    })

    it('should apply 50% weight to growth', () => {
      // 10% growth * 0.5 weight = 5% adjustment = 1.05
      expect(calculateGrowthAdjustment(10)).toBe(1.05)
      // 20% growth * 0.5 weight = 10% adjustment = 1.10
      expect(calculateGrowthAdjustment(20)).toBe(1.1)
    })

    it('should handle negative growth', () => {
      // -10% growth * 0.5 weight = -5% adjustment = 0.95
      expect(calculateGrowthAdjustment(-10)).toBe(0.95)
    })
  })

  describe('getSupportedIndustries', () => {
    it('should return all supported industries', () => {
      const industries = getSupportedIndustries()
      expect(industries).toContain('IT Services')
      expect(industries).toContain('Manufacturing')
      expect(industries).toContain('Healthcare')
      expect(industries).toContain('Technology')
      expect(industries.length).toBe(Object.keys(INDUSTRY_MULTIPLES).length)
    })
  })

  describe('valuateCompany', () => {
    describe('revenue-only valuation', () => {
      it('should calculate valuation using revenue multiple', () => {
        const input: CompanyValuationInput = {
          revenue: 10_000_000,
          industry: 'IT Services',
          employees: 50,
        }

        const result = valuateCompany(input)

        // IT Services revenue multiple is 3.0
        // 10M * 3.0 = 30M
        expect(result.valuation).toBe(30_000_000)
        expect(result.methodology).toBe('Revenue Multiple')
        expect(result.confidence).toBe(0.75)
        expect(result.industryMultiple).toBe(3.0)
      })

      it('should calculate correct valuation range', () => {
        const input: CompanyValuationInput = {
          revenue: 10_000_000,
          industry: 'Manufacturing',
          employees: 100,
        }

        const result = valuateCompany(input)

        // Manufacturing revenue multiple is 1.2
        // 10M * 1.2 = 12M
        expect(result.valuation).toBe(12_000_000)
        expect(result.low).toBe(9_600_000) // 12M * 0.8
        expect(result.high).toBe(14_400_000) // 12M * 1.2
      })

      it('should use default multiples for unknown industry', () => {
        const input: CompanyValuationInput = {
          revenue: 5_000_000,
          industry: 'Underwater Basket Weaving',
          employees: 20,
        }

        const result = valuateCompany(input)

        // Default revenue multiple is 2.0
        // 5M * 2.0 = 10M
        expect(result.valuation).toBe(10_000_000)
        expect(result.industryMultiple).toBe(2.0)
      })
    })

    describe('EBITDA-based valuation', () => {
      it('should use weighted approach when EBITDA is provided', () => {
        const input: CompanyValuationInput = {
          revenue: 10_000_000,
          ebitda: 2_000_000,
          industry: 'IT Services',
          employees: 50,
        }

        const result = valuateCompany(input)

        // IT Services: revenue=3.0, ebitda=10.0
        // Revenue valuation: 10M * 3.0 = 30M
        // EBITDA valuation: 2M * 10.0 = 20M
        // Weighted: (20M * 0.7) + (30M * 0.3) = 14M + 9M = 23M
        expect(result.valuation).toBe(23_000_000)
        expect(result.methodology).toBe('Revenue Multiple + EBITDA Multiple (weighted)')
        expect(result.confidence).toBe(0.9)
        expect(result.industryMultiple).toBe(10.0)
      })

      it('should have higher confidence with EBITDA', () => {
        const withoutEbitda: CompanyValuationInput = {
          revenue: 10_000_000,
          industry: 'Healthcare',
          employees: 100,
        }

        const withEbitda: CompanyValuationInput = {
          revenue: 10_000_000,
          ebitda: 1_500_000,
          industry: 'Healthcare',
          employees: 100,
        }

        const resultWithout = valuateCompany(withoutEbitda)
        const resultWith = valuateCompany(withEbitda)

        expect(resultWith.confidence).toBeGreaterThan(resultWithout.confidence)
        expect(resultWith.confidence).toBe(0.9)
        expect(resultWithout.confidence).toBe(0.75)
      })
    })

    describe('growth adjustment', () => {
      it('should apply growth adjustment to valuation', () => {
        const input: CompanyValuationInput = {
          revenue: 10_000_000,
          industry: 'IT Services',
          employees: 50,
          growthRate: 20, // 20% growth
        }

        const result = valuateCompany(input)

        // Base: 10M * 3.0 = 30M
        // Growth adjustment: 1 + (20/100 * 0.5) = 1.1
        // Adjusted: 30M * 1.1 = 33M
        expect(result.valuation).toBe(33_000_000)
      })

      it('should handle negative growth', () => {
        const input: CompanyValuationInput = {
          revenue: 10_000_000,
          industry: 'Manufacturing',
          employees: 100,
          growthRate: -10, // -10% growth
        }

        const result = valuateCompany(input)

        // Base: 10M * 1.2 = 12M
        // Growth adjustment: 1 + (-10/100 * 0.5) = 0.95
        // Adjusted: 12M * 0.95 = 11.4M
        expect(result.valuation).toBe(11_400_000)
      })
    })

    describe('edge cases', () => {
      it('should handle very small companies', () => {
        const input: CompanyValuationInput = {
          revenue: 500_000,
          industry: 'Business Services',
          employees: 5,
        }

        const result = valuateCompany(input)

        // Business Services revenue multiple is 2.5
        // 500K * 2.5 = 1.25M
        expect(result.valuation).toBe(1_250_000)
        expect(result.low).toBe(1_000_000)
        expect(result.high).toBe(1_500_000)
      })

      it('should handle large companies', () => {
        const input: CompanyValuationInput = {
          revenue: 500_000_000,
          ebitda: 75_000_000,
          industry: 'Technology',
          employees: 2000,
          growthRate: 25,
        }

        const result = valuateCompany(input)

        // Technology: revenue=4.0, ebitda=12.0
        // Revenue valuation: 500M * 4.0 = 2B
        // EBITDA valuation: 75M * 12.0 = 900M
        // Weighted: (900M * 0.7) + (2B * 0.3) = 630M + 600M = 1.23B
        // Growth adjustment: 1 + (25/100 * 0.5) = 1.125
        // Adjusted: 1.23B * 1.125 = 1,383,750,000
        expect(result.valuation).toBe(1_383_750_000)
      })

      it('should return rounded values', () => {
        const input: CompanyValuationInput = {
          revenue: 7_777_777,
          industry: 'IT Services',
          employees: 50,
          growthRate: 15,
        }

        const result = valuateCompany(input)

        expect(Number.isInteger(result.valuation)).toBe(true)
        expect(Number.isInteger(result.low)).toBe(true)
        expect(Number.isInteger(result.high)).toBe(true)
      })
    })

    describe('validation of results', () => {
      it('should always have low < valuation < high', () => {
        const testCases: CompanyValuationInput[] = [
          { revenue: 5_000_000, industry: 'IT Services', employees: 30 },
          { revenue: 10_000_000, ebitda: 1_500_000, industry: 'Healthcare', employees: 100 },
          { revenue: 20_000_000, industry: 'Retail', employees: 200, growthRate: 15 },
          { revenue: 100_000_000, ebitda: 15_000_000, industry: 'Technology', employees: 500, growthRate: 30 },
        ]

        testCases.forEach((input) => {
          const result = valuateCompany(input)
          expect(result.low).toBeLessThan(result.valuation)
          expect(result.valuation).toBeLessThan(result.high)
        })
      })

      it('should have confidence between 0 and 1', () => {
        const testCases: CompanyValuationInput[] = [
          { revenue: 5_000_000, industry: 'IT Services', employees: 30 },
          { revenue: 10_000_000, ebitda: 1_500_000, industry: 'Healthcare', employees: 100 },
        ]

        testCases.forEach((input) => {
          const result = valuateCompany(input)
          expect(result.confidence).toBeGreaterThanOrEqual(0)
          expect(result.confidence).toBeLessThanOrEqual(1)
        })
      })
    })
  })
})
