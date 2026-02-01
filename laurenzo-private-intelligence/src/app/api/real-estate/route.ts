import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { RealEstateFilters, PaginatedResponse, RealEstate } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to access this resource' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
    const search = searchParams.get('search') || undefined
    const propertyType = searchParams.get('propertyType') || undefined
    const city = searchParams.get('city') || undefined
    const state = searchParams.get('state') || undefined
    const minValuation = searchParams.get('minValuation')
      ? parseInt(searchParams.get('minValuation')!, 10)
      : undefined
    const maxValuation = searchParams.get('maxValuation')
      ? parseInt(searchParams.get('maxValuation')!, 10)
      : undefined
    const minSquareFeet = searchParams.get('minSquareFeet')
      ? parseInt(searchParams.get('minSquareFeet')!, 10)
      : undefined
    const maxSquareFeet = searchParams.get('maxSquareFeet')
      ? parseInt(searchParams.get('maxSquareFeet')!, 10)
      : undefined

    // Build query
    let query = supabase.from('real_estate').select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.ilike('property_name', `%${search}%`)
    }
    if (propertyType) {
      query = query.eq('property_type', propertyType)
    }
    if (city) {
      query = query.eq('city', city)
    }
    if (state) {
      query = query.eq('state', state)
    }
    if (minValuation !== undefined) {
      query = query.gte('valuation_cents', minValuation)
    }
    if (maxValuation !== undefined) {
      query = query.lte('valuation_cents', maxValuation)
    }
    if (minSquareFeet !== undefined) {
      query = query.gte('square_feet', minSquareFeet)
    }
    if (maxSquareFeet !== undefined) {
      query = query.lte('square_feet', maxSquareFeet)
    }

    // Apply pagination
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1
    query = query.range(start, end).order('property_name', { ascending: true })

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    const response: PaginatedResponse<RealEstate> = {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
