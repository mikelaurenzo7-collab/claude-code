import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { CompanyFilters, PaginatedResponse, Company } from '@/types'

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
    const industry = searchParams.get('industry') || undefined
    const state = searchParams.get('state') || undefined
    const minRevenue = searchParams.get('minRevenue')
      ? parseInt(searchParams.get('minRevenue')!, 10)
      : undefined
    const maxRevenue = searchParams.get('maxRevenue')
      ? parseInt(searchParams.get('maxRevenue')!, 10)
      : undefined

    // Build query
    let query = supabase.from('companies').select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (industry) {
      query = query.eq('industry', industry)
    }
    if (state) {
      query = query.eq('state', state)
    }
    if (minRevenue !== undefined) {
      query = query.gte('revenue_cents', minRevenue)
    }
    if (maxRevenue !== undefined) {
      query = query.lte('revenue_cents', maxRevenue)
    }

    // Apply pagination
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1
    query = query.range(start, end).order('name', { ascending: true })

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }

    const response: PaginatedResponse<Company> = {
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
