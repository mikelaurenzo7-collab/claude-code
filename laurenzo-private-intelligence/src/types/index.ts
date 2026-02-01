export * from './database'

export interface CompanyFilters {
  search?: string
  industry?: string
  state?: string
  minRevenue?: number
  maxRevenue?: number
  minValuation?: number
  maxValuation?: number
}

export interface RealEstateFilters {
  search?: string
  propertyType?: string
  city?: string
  state?: string
  minValuation?: number
  maxValuation?: number
  minSquareFeet?: number
  maxSquareFeet?: number
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CompanyValuationInput {
  revenue: number
  ebitda?: number
  industry: string
  employees: number
  growthRate?: number
}

export interface CompanyValuationResult {
  valuation: number
  low: number
  high: number
  methodology: string
  confidence: number
  industryMultiple: number
}

export interface RealEstateValuationInput {
  propertyType: string
  squareFeet: number
  city: string
  state: string
  yearBuilt: number
  occupancyRate?: number
  noi?: number
}

export interface RealEstateValuationResult {
  valuation: number
  low: number
  high: number
  capRate: number
  pricePerSqft: number
  methodology: string
  confidence: number
}

export interface User {
  id: string
  email: string
  name?: string
  created_at: string
}

export interface SubscriptionLimits {
  monthlyViews: number
  trackedAssets: number
  pdfExports: number
  csvExports: boolean
  apiAccess: boolean
}

export const PLAN_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    monthlyViews: 10,
    trackedAssets: 0,
    pdfExports: 0,
    csvExports: false,
    apiAccess: false,
  },
  professional: {
    monthlyViews: Infinity,
    trackedAssets: 50,
    pdfExports: 20,
    csvExports: true,
    apiAccess: false,
  },
  enterprise: {
    monthlyViews: Infinity,
    trackedAssets: Infinity,
    pdfExports: Infinity,
    csvExports: true,
    apiAccess: true,
  },
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

export interface ApiSuccess<T> {
  data: T
  message?: string
}
