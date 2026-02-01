import { render, screen } from '@testing-library/react'
import { DashboardNav } from '@/components/layout/dashboard-nav'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

import { usePathname } from 'next/navigation'

const mockedUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('DashboardNav Component', () => {
  beforeEach(() => {
    mockedUsePathname.mockReturnValue('/dashboard')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the logo/brand', () => {
    render(<DashboardNav />)

    expect(screen.getByText('LPI')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<DashboardNav />)

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /companies/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /real estate/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tracked assets/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('has correct href for each link', () => {
    render(<DashboardNav />)

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/dashboard'
    )
    expect(screen.getByRole('link', { name: /companies/i })).toHaveAttribute(
      'href',
      '/dashboard/companies'
    )
    expect(screen.getByRole('link', { name: /real estate/i })).toHaveAttribute(
      'href',
      '/dashboard/real-estate'
    )
    expect(screen.getByRole('link', { name: /tracked assets/i })).toHaveAttribute(
      'href',
      '/dashboard/tracked'
    )
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute(
      'href',
      '/dashboard/settings'
    )
  })

  it('highlights the active link based on pathname', () => {
    mockedUsePathname.mockReturnValue('/dashboard')
    const { rerender } = render(<DashboardNav />)

    // Dashboard should be active
    expect(screen.getByRole('link', { name: /^dashboard$/i })).toHaveClass(
      'bg-primary'
    )

    // Companies should not be active
    expect(screen.getByRole('link', { name: /companies/i })).not.toHaveClass(
      'bg-primary'
    )

    // Change to companies page
    mockedUsePathname.mockReturnValue('/dashboard/companies')
    rerender(<DashboardNav />)

    // Companies should now be active
    expect(screen.getByRole('link', { name: /companies/i })).toHaveClass(
      'bg-primary'
    )
  })

  it('applies correct styles to inactive links', () => {
    mockedUsePathname.mockReturnValue('/dashboard')
    render(<DashboardNav />)

    const companiesLink = screen.getByRole('link', { name: /companies/i })
    expect(companiesLink).toHaveClass('text-muted-foreground')
    expect(companiesLink).toHaveClass('hover:bg-muted')
  })

  it('renders navigation icons', () => {
    render(<DashboardNav />)

    // Check that the nav is rendered (icons are rendered as SVGs)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('has responsive hidden class for mobile', () => {
    render(<DashboardNav />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('hidden')
    expect(nav).toHaveClass('lg:flex')
  })
})
