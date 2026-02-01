import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>)

    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-primary')
    expect(badge).toHaveClass('text-primary-foreground')
  })

  it('renders different variants', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>)
    expect(screen.getByText('Default')).toHaveClass('bg-primary')

    rerender(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary')

    rerender(<Badge variant="destructive">Destructive</Badge>)
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive')

    rerender(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toHaveClass('text-foreground')

    rerender(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success')).toHaveClass('bg-green-100')

    rerender(<Badge variant="warning">Warning</Badge>)
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100')
  })

  it('has correct base styles', () => {
    render(<Badge data-testid="badge">Test</Badge>)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('inline-flex')
    expect(badge).toHaveClass('items-center')
    expect(badge).toHaveClass('rounded-full')
    expect(badge).toHaveClass('border')
    expect(badge).toHaveClass('px-2.5')
    expect(badge).toHaveClass('py-0.5')
    expect(badge).toHaveClass('text-xs')
    expect(badge).toHaveClass('font-semibold')
  })

  it('applies custom className', () => {
    render(
      <Badge className="custom-class" data-testid="badge">
        Custom
      </Badge>
    )

    expect(screen.getByTestId('badge')).toHaveClass('custom-class')
  })

  it('renders children correctly', () => {
    render(
      <Badge>
        <span>Child Element</span>
      </Badge>
    )

    expect(screen.getByText('Child Element')).toBeInTheDocument()
  })

  it('spreads additional props', () => {
    render(
      <Badge data-testid="badge" aria-label="Status badge">
        Status
      </Badge>
    )

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('aria-label', 'Status badge')
  })
})
