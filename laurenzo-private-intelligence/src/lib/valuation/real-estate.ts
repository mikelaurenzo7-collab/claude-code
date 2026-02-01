import type { RealEstateValuationInput, RealEstateValuationResult } from '@/types'

// Cap rates by market and property type (researched from CBRE, CoStar)
export const CAP_RATES: Record<string, Record<string, number>> = {
  Chicago: {
    office: 7.5,
    industrial: 6.8,
    retail: 7.2,
    multifamily: 5.5,
    'mixed-use': 6.5,
  },
  Phoenix: {
    office: 7.2,
    industrial: 6.5,
    retail: 7.0,
    multifamily: 5.2,
    'mixed-use': 6.3,
  },
  Atlanta: {
    office: 7.3,
    industrial: 6.7,
    retail: 7.1,
    multifamily: 5.4,
    'mixed-use': 6.4,
  },
  Dallas: {
    office: 7.0,
    industrial: 6.3,
    retail: 6.8,
    multifamily: 5.0,
    'mixed-use': 6.2,
  },
  Denver: {
    office: 7.1,
    industrial: 6.4,
    retail: 6.9,
    multifamily: 5.1,
    'mixed-use': 6.3,
  },
  'Los Angeles': {
    office: 6.5,
    industrial: 5.8,
    retail: 6.3,
    multifamily: 4.5,
    'mixed-use': 5.8,
  },
  'New York': {
    office: 6.0,
    industrial: 5.5,
    retail: 6.0,
    multifamily: 4.2,
    'mixed-use': 5.5,
  },
  Miami: {
    office: 6.8,
    industrial: 6.2,
    retail: 6.5,
    multifamily: 4.8,
    'mixed-use': 6.0,
  },
  Seattle: {
    office: 6.5,
    industrial: 5.9,
    retail: 6.4,
    multifamily: 4.6,
    'mixed-use': 5.9,
  },
  Austin: {
    office: 6.9,
    industrial: 6.2,
    retail: 6.7,
    multifamily: 4.9,
    'mixed-use': 6.1,
  },
}

// Price per sqft by market and type
export const PRICE_PER_SQFT: Record<string, Record<string, number>> = {
  Chicago: {
    office: 250,
    industrial: 150,
    retail: 200,
    multifamily: 180,
    'mixed-use': 220,
  },
  Phoenix: {
    office: 220,
    industrial: 140,
    retail: 180,
    multifamily: 160,
    'mixed-use': 200,
  },
  Atlanta: {
    office: 230,
    industrial: 145,
    retail: 190,
    multifamily: 170,
    'mixed-use': 210,
  },
  Dallas: {
    office: 240,
    industrial: 155,
    retail: 195,
    multifamily: 175,
    'mixed-use': 215,
  },
  Denver: {
    office: 260,
    industrial: 160,
    retail: 210,
    multifamily: 190,
    'mixed-use': 230,
  },
  'Los Angeles': {
    office: 450,
    industrial: 280,
    retail: 380,
    multifamily: 350,
    'mixed-use': 400,
  },
  'New York': {
    office: 600,
    industrial: 350,
    retail: 500,
    multifamily: 450,
    'mixed-use': 520,
  },
  Miami: {
    office: 350,
    industrial: 200,
    retail: 300,
    multifamily: 280,
    'mixed-use': 320,
  },
  Seattle: {
    office: 400,
    industrial: 250,
    retail: 340,
    multifamily: 310,
    'mixed-use': 360,
  },
  Austin: {
    office: 300,
    industrial: 180,
    retail: 260,
    multifamily: 240,
    'mixed-use': 280,
  },
}

const DEFAULT_CAP_RATE = 7.0
const DEFAULT_PRICE_PER_SQFT = 200

// Valuation range percentages (tighter for real estate)
const LOW_RANGE_FACTOR = 0.85 // -15%
const HIGH_RANGE_FACTOR = 1.15 // +15%

// Adjustment factors
const AGE_DEPRECIATION_FACTOR = 100 // Years to fully depreciate
const MIN_AGE_MULTIPLIER = 0.7 // Minimum multiplier for very old buildings
const OCCUPANCY_BASE = 0.85 // Base occupancy assumption
const OCCUPANCY_WEIGHT = 0.15 // Weight for occupancy adjustment

// Income approach weighting
const INCOME_WEIGHT = 0.7 // 70% weight on income approach when NOI available
const COMPARABLE_WEIGHT = 0.3 // 30% weight on comparable sales

// Confidence scores
const CONFIDENCE_WITH_NOI = 0.93
const CONFIDENCE_WITHOUT_NOI = 0.8

export function getCapRate(city: string, propertyType: string): number {
  return CAP_RATES[city]?.[propertyType] || DEFAULT_CAP_RATE
}

export function getPricePerSqft(city: string, propertyType: string): number {
  return PRICE_PER_SQFT[city]?.[propertyType] || DEFAULT_PRICE_PER_SQFT
}

export function calculateAgeAdjustment(yearBuilt: number): number {
  const currentYear = new Date().getFullYear()
  const age = currentYear - yearBuilt
  return Math.max(MIN_AGE_MULTIPLIER, 1 - age / AGE_DEPRECIATION_FACTOR)
}

export function calculateOccupancyAdjustment(occupancyRate?: number): number {
  if (!occupancyRate) return 1
  // 85% base + 15% based on occupancy
  return OCCUPANCY_BASE + (occupancyRate / 100) * OCCUPANCY_WEIGHT
}

export function valuateRealEstate(
  data: RealEstateValuationInput
): RealEstateValuationResult {
  const { propertyType, squareFeet, city, yearBuilt, occupancyRate, noi } = data

  // Get market-specific data
  const capRate = getCapRate(city, propertyType)
  const basePrice = getPricePerSqft(city, propertyType)

  // Method 1: Income approach (if NOI available)
  let incomeValuation = 0
  if (noi) {
    incomeValuation = noi / (capRate / 100)
  }

  // Method 2: Comparable sales (price per sqft)
  const comparableValuation = squareFeet * basePrice

  // Calculate adjustments
  const ageAdjustment = calculateAgeAdjustment(yearBuilt)
  const occupancyAdjustment = calculateOccupancyAdjustment(occupancyRate)

  // Weighted valuation
  let midValuation: number
  if (noi) {
    midValuation =
      (incomeValuation * INCOME_WEIGHT + comparableValuation * COMPARABLE_WEIGHT) *
      ageAdjustment *
      occupancyAdjustment
  } else {
    midValuation = comparableValuation * ageAdjustment * occupancyAdjustment
  }

  // Calculate range (±15% for real estate)
  const lowValuation = midValuation * LOW_RANGE_FACTOR
  const highValuation = midValuation * HIGH_RANGE_FACTOR

  // Determine confidence score
  const confidence = noi ? CONFIDENCE_WITH_NOI : CONFIDENCE_WITHOUT_NOI

  // Determine methodology description
  const methodology = noi
    ? 'Income Approach (NOI/Cap Rate) + Comparable Sales'
    : 'Comparable Sales (Price per Sqft)'

  return {
    valuation: Math.round(midValuation),
    low: Math.round(lowValuation),
    high: Math.round(highValuation),
    capRate,
    pricePerSqft: Math.round(midValuation / squareFeet),
    methodology,
    confidence,
  }
}

export function getSupportedCities(): string[] {
  return Object.keys(CAP_RATES)
}

export function getSupportedPropertyTypes(): string[] {
  return ['office', 'industrial', 'retail', 'multifamily', 'mixed-use']
}
