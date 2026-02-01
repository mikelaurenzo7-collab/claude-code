import {
  valuateRealEstate,
  getCapRate,
  getPricePerSqft,
  calculateAgeAdjustment,
  calculateOccupancyAdjustment,
  getSupportedCities,
  getSupportedPropertyTypes,
  CAP_RATES,
  PRICE_PER_SQFT,
} from '@/lib/valuation/real-estate'
import type { RealEstateValuationInput } from '@/types'

describe('Real Estate Valuation Engine', () => {
  describe('getCapRate', () => {
    it('should return correct cap rates for known markets', () => {
      expect(getCapRate('Chicago', 'office')).toBe(7.5)
      expect(getCapRate('New York', 'multifamily')).toBe(4.2)
      expect(getCapRate('Los Angeles', 'industrial')).toBe(5.8)
    })

    it('should return default cap rate for unknown markets', () => {
      expect(getCapRate('Unknown City', 'office')).toBe(7.0)
    })

    it('should return default cap rate for unknown property types', () => {
      expect(getCapRate('Chicago', 'unknown')).toBe(7.0)
    })
  })

  describe('getPricePerSqft', () => {
    it('should return correct price per sqft for known markets', () => {
      expect(getPricePerSqft('Chicago', 'office')).toBe(250)
      expect(getPricePerSqft('New York', 'office')).toBe(600)
      expect(getPricePerSqft('Los Angeles', 'multifamily')).toBe(350)
    })

    it('should return default price for unknown markets', () => {
      expect(getPricePerSqft('Unknown City', 'office')).toBe(200)
    })
  })

  describe('calculateAgeAdjustment', () => {
    it('should return 1 for new buildings', () => {
      const currentYear = new Date().getFullYear()
      expect(calculateAgeAdjustment(currentYear)).toBe(1)
    })

    it('should decrease for older buildings', () => {
      const currentYear = new Date().getFullYear()
      const tenYearsAgo = currentYear - 10
      const twentyYearsAgo = currentYear - 20

      expect(calculateAgeAdjustment(tenYearsAgo)).toBe(0.9)
      expect(calculateAgeAdjustment(twentyYearsAgo)).toBe(0.8)
    })

    it('should have minimum of 0.7 for very old buildings', () => {
      expect(calculateAgeAdjustment(1900)).toBe(0.7)
      expect(calculateAgeAdjustment(1800)).toBe(0.7)
    })

    it('should decrease linearly until minimum', () => {
      const currentYear = new Date().getFullYear()
      const thirtyYearsAgo = currentYear - 30

      expect(calculateAgeAdjustment(thirtyYearsAgo)).toBe(0.7)
    })
  })

  describe('calculateOccupancyAdjustment', () => {
    it('should return 1 for undefined occupancy', () => {
      expect(calculateOccupancyAdjustment()).toBe(1)
    })

    it('should calculate correct adjustment for different occupancy rates', () => {
      // 85% base + 15% * occupancy/100
      expect(calculateOccupancyAdjustment(100)).toBe(1.0) // 0.85 + 0.15
      expect(calculateOccupancyAdjustment(0)).toBe(0.85) // 0.85 + 0
      expect(calculateOccupancyAdjustment(50)).toBe(0.925) // 0.85 + 0.075
    })
  })

  describe('getSupportedCities', () => {
    it('should return all supported cities', () => {
      const cities = getSupportedCities()
      expect(cities).toContain('Chicago')
      expect(cities).toContain('New York')
      expect(cities).toContain('Los Angeles')
      expect(cities).toContain('Miami')
      expect(cities.length).toBe(Object.keys(CAP_RATES).length)
    })
  })

  describe('getSupportedPropertyTypes', () => {
    it('should return all property types', () => {
      const types = getSupportedPropertyTypes()
      expect(types).toContain('office')
      expect(types).toContain('industrial')
      expect(types).toContain('retail')
      expect(types).toContain('multifamily')
      expect(types).toContain('mixed-use')
      expect(types.length).toBe(5)
    })
  })

  describe('valuateRealEstate', () => {
    describe('comparable sales approach (no NOI)', () => {
      it('should calculate valuation using price per sqft', () => {
        const currentYear = new Date().getFullYear()
        const input: RealEstateValuationInput = {
          propertyType: 'office',
          squareFeet: 50_000,
          city: 'Chicago',
          state: 'IL',
          yearBuilt: currentYear,
        }

        const result = valuateRealEstate(input)

        // Chicago office: $250/sqft
        // 50,000 * 250 = 12,500,000
        expect(result.valuation).toBe(12_500_000)
        expect(result.methodology).toBe('Comparable Sales (Price per Sqft)')
        expect(result.confidence).toBe(0.8)
      })

      it('should apply age adjustment', () => {
        const currentYear = new Date().getFullYear()
        const input: RealEstateValuationInput = {
          propertyType: 'office',
          squareFeet: 50_000,
          city: 'Chicago',
          state: 'IL',
          yearBuilt: currentYear - 20, // 20 years old
        }

        const result = valuateRealEstate(input)

        // Base: 50,000 * 250 = 12,500,000
        // Age adjustment: 0.8 (20 years)
        // Adjusted: 12,500,000 * 0.8 = 10,000,000
        expect(result.valuation).toBe(10_000_000)
      })

      it('should apply occupancy adjustment', () => {
        const currentYear = new Date().getFullYear()
        const input: RealEstateValuationInput = {
          propertyType: 'office',
          squareFeet: 50_000,
          city: 'Chicago',
          state: 'IL',
          yearBuilt: currentYear,
          occupancyRate: 100,
        }

        const result = valuateRealEstate(input)

        // Base: 50,000 * 250 = 12,500,000
        // Occupancy adjustment: 1.0 (100% occupancy)
        // Adjusted: 12,500,000 * 1.0 = 12,500,000
        expect(result.valuation).toBe(12_500_000)
      })
    })

    describe('income approach (with NOI)', () => {
      it('should use weighted approach when NOI is provided', () => {
        const currentYear = new Date().getFullYear()
        const input: RealEstateValuationInput = {
          propertyType: 'office',
          squareFeet: 50_000,
          city: 'Chicago',
          state: 'IL',
          yearBuilt: currentYear,
          noi: 1_000_000,
        }

        const result = valuateRealEstate(input)

        // Chicago office cap rate: 7.5%
        // Income valuation: 1,000,000 / 0.075 = 13,333,333
        // Comparable valuation: 50,000 * 250 = 12,500,000
        // Weighted: (13,333,333 * 0.7) + (12,500,000 * 0.3) = 9,333,333 + 3,750,000 = 13,083,333
        expect(result.valuation).toBe(13_083_333)
        expect(result.methodology).toBe('Income Approach (NOI/Cap Rate) + Comparable Sales')
        expect(result.confidence).toBe(0.93)
      })

      it('should have higher confidence with NOI', () => {
        const currentYear = new Date().getFullYear()
        const withoutNoi: RealEstateValuationInput = {
          propertyType: 'industrial',
          squareFeet: 100_000,
          city: 'Dallas',
          state: 'TX',
          yearBuilt: currentYear,
        }

        const withNoi: RealEstateValuationInput = {
          ...withoutNoi,
          noi: 800_000,
        }

        const resultWithout = valuateRealEstate(withoutNoi)
        const resultWith = valuateRealEstate(withNoi)

        expect(resultWith.confidence).toBeGreaterThan(resultWithout.confidence)
        expect(resultWith.confidence).toBe(0.93)
        expect(resultWithout.confidence).toBe(0.8)
      })
    })

    describe('valuation range', () => {
      it('should calculate correct range (±15%)', () => {
        const currentYear = new Date().getFullYear()
        const input: RealEstateValuationInput = {
          propertyType: 'multifamily',
          squareFeet: 100_000,
          city: 'Miami',
          state: 'FL',
          yearBuilt: currentYear,
        }

        const result = valuateRealEstate(input)

        // Miami multifamily: $280/sqft
        // 100,000 * 280 = 28,000,000
        expect(result.valuation).toBe(28_000_000)
        expect(result.low).toBe(23_800_000) // 28M * 0.85
        expect(result.high).toBe(32_200_000) // 28M * 1.15
      })
    })

    describe('cap rate and price per sqft', () => {
      it('should return correct cap rate', () => {
        const currentYear = new Date().getFullYear()
        const input: RealEstateValuationInput = {
          propertyType: 'retail',
          squareFeet: 20_000,
          city: 'Phoenix',
          state: 'AZ',
          yearBuilt: currentYear,
        }

        const result = valuateRealEstate(input)

        expect(result.capRate).toBe(7.0) // Phoenix retail cap rate
      })

      it('should calculate effective price per sqft', () => {
        const currentYear = new Date().getFullYear()
        const input: RealEstateValuationInput = {
          propertyType: 'office',
          squareFeet: 10_000,
          city: 'Seattle',
          state: 'WA',
          yearBuilt: currentYear,
        }

        const result = valuateRealEstate(input)

        // Seattle office: $400/sqft
        // 10,000 * 400 = 4,000,000
        expect(result.pricePerSqft).toBe(400)
      })
    })

    describe('edge cases', () => {
      it('should handle small properties', () => {
        const currentYear = new Date().getFullYear()
        const input: RealEstateValuationInput = {
          propertyType: 'retail',
          squareFeet: 1_000,
          city: 'Atlanta',
          state: 'GA',
          yearBuilt: currentYear,
        }

        const result = valuateRealEstate(input)

        // Atlanta retail: $190/sqft
        expect(result.valuation).toBe(190_000)
      })

      it('should handle large properties', () => {
        const currentYear = new Date().getFullYear()
        const input: RealEstateValuationInput = {
          propertyType: 'industrial',
          squareFeet: 1_000_000,
          city: 'Dallas',
          state: 'TX',
          yearBuilt: currentYear,
          noi: 10_000_000,
        }

        const result = valuateRealEstate(input)

        // Dallas industrial: cap rate 6.3%, $155/sqft
        // Income: 10M / 0.063 = 158,730,159
        // Comparable: 1M * 155 = 155,000,000
        // Weighted: (158,730,159 * 0.7) + (155,000,000 * 0.3) = 157,611,111
        expect(result.valuation).toBe(157_611_111)
      })

      it('should handle very old buildings', () => {
        const input: RealEstateValuationInput = {
          propertyType: 'office',
          squareFeet: 50_000,
          city: 'New York',
          state: 'NY',
          yearBuilt: 1920,
        }

        const result = valuateRealEstate(input)

        // NY office: $600/sqft
        // Base: 50,000 * 600 = 30,000,000
        // Age adjustment: 0.7 (min)
        // Adjusted: 30,000,000 * 0.7 = 21,000,000
        expect(result.valuation).toBe(21_000_000)
      })

      it('should handle unknown markets with defaults', () => {
        const currentYear = new Date().getFullYear()
        const input: RealEstateValuationInput = {
          propertyType: 'office',
          squareFeet: 25_000,
          city: 'Smalltown',
          state: 'KS',
          yearBuilt: currentYear,
        }

        const result = valuateRealEstate(input)

        // Default: cap rate 7.0%, $200/sqft
        expect(result.capRate).toBe(7.0)
        expect(result.valuation).toBe(5_000_000) // 25,000 * 200
      })
    })

    describe('validation of results', () => {
      it('should always have low < valuation < high', () => {
        const currentYear = new Date().getFullYear()
        const testCases: RealEstateValuationInput[] = [
          { propertyType: 'office', squareFeet: 50_000, city: 'Chicago', state: 'IL', yearBuilt: currentYear },
          { propertyType: 'industrial', squareFeet: 100_000, city: 'Dallas', state: 'TX', yearBuilt: currentYear - 10, noi: 500_000 },
          { propertyType: 'multifamily', squareFeet: 75_000, city: 'Miami', state: 'FL', yearBuilt: currentYear - 5, occupancyRate: 95 },
        ]

        testCases.forEach((input) => {
          const result = valuateRealEstate(input)
          expect(result.low).toBeLessThan(result.valuation)
          expect(result.valuation).toBeLessThan(result.high)
        })
      })

      it('should have confidence between 0 and 1', () => {
        const currentYear = new Date().getFullYear()
        const testCases: RealEstateValuationInput[] = [
          { propertyType: 'office', squareFeet: 50_000, city: 'Chicago', state: 'IL', yearBuilt: currentYear },
          { propertyType: 'retail', squareFeet: 20_000, city: 'Phoenix', state: 'AZ', yearBuilt: currentYear - 15, noi: 300_000 },
        ]

        testCases.forEach((input) => {
          const result = valuateRealEstate(input)
          expect(result.confidence).toBeGreaterThanOrEqual(0)
          expect(result.confidence).toBeLessThanOrEqual(1)
        })
      })

      it('should return positive price per sqft', () => {
        const currentYear = new Date().getFullYear()
        const input: RealEstateValuationInput = {
          propertyType: 'mixed-use',
          squareFeet: 30_000,
          city: 'Austin',
          state: 'TX',
          yearBuilt: currentYear,
        }

        const result = valuateRealEstate(input)
        expect(result.pricePerSqft).toBeGreaterThan(0)
      })
    })
  })
})
