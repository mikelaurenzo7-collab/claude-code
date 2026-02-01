import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

describe('Card Component', () => {
  it('renders Card with all parts', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    )

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('Card Content')).toBeInTheDocument()
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })

  it('Card has correct default styles', () => {
    render(<Card data-testid="card">Content</Card>)

    const card = screen.getByTestId('card')
    expect(card).toHaveClass('rounded-lg')
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('bg-card')
    expect(card).toHaveClass('shadow-sm')
  })

  it('CardHeader has correct styles', () => {
    render(
      <Card>
        <CardHeader data-testid="header">Header</CardHeader>
      </Card>
    )

    const header = screen.getByTestId('header')
    expect(header).toHaveClass('flex')
    expect(header).toHaveClass('flex-col')
    expect(header).toHaveClass('p-6')
  })

  it('CardTitle has correct styles', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle data-testid="title">Title</CardTitle>
        </CardHeader>
      </Card>
    )

    const title = screen.getByTestId('title')
    expect(title).toHaveClass('text-2xl')
    expect(title).toHaveClass('font-semibold')
  })

  it('CardDescription has correct styles', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription data-testid="description">Description</CardDescription>
        </CardHeader>
      </Card>
    )

    const description = screen.getByTestId('description')
    expect(description).toHaveClass('text-sm')
    expect(description).toHaveClass('text-muted-foreground')
  })

  it('CardContent has correct styles', () => {
    render(
      <Card>
        <CardContent data-testid="content">Content</CardContent>
      </Card>
    )

    const content = screen.getByTestId('content')
    expect(content).toHaveClass('p-6')
    expect(content).toHaveClass('pt-0')
  })

  it('CardFooter has correct styles', () => {
    render(
      <Card>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    )

    const footer = screen.getByTestId('footer')
    expect(footer).toHaveClass('flex')
    expect(footer).toHaveClass('items-center')
    expect(footer).toHaveClass('p-6')
    expect(footer).toHaveClass('pt-0')
  })

  it('accepts custom className on all parts', () => {
    render(
      <Card className="custom-card" data-testid="card">
        <CardHeader className="custom-header" data-testid="header">
          <CardTitle className="custom-title" data-testid="title">
            Title
          </CardTitle>
          <CardDescription className="custom-desc" data-testid="description">
            Description
          </CardDescription>
        </CardHeader>
        <CardContent className="custom-content" data-testid="content">
          Content
        </CardContent>
        <CardFooter className="custom-footer" data-testid="footer">
          Footer
        </CardFooter>
      </Card>
    )

    expect(screen.getByTestId('card')).toHaveClass('custom-card')
    expect(screen.getByTestId('header')).toHaveClass('custom-header')
    expect(screen.getByTestId('title')).toHaveClass('custom-title')
    expect(screen.getByTestId('description')).toHaveClass('custom-desc')
    expect(screen.getByTestId('content')).toHaveClass('custom-content')
    expect(screen.getByTestId('footer')).toHaveClass('custom-footer')
  })

  it('forwards refs correctly', () => {
    const cardRef = jest.fn()
    const headerRef = jest.fn()
    const titleRef = jest.fn()

    render(
      <Card ref={cardRef}>
        <CardHeader ref={headerRef}>
          <CardTitle ref={titleRef}>Title</CardTitle>
        </CardHeader>
      </Card>
    )

    expect(cardRef).toHaveBeenCalled()
    expect(headerRef).toHaveBeenCalled()
    expect(titleRef).toHaveBeenCalled()
  })
})
