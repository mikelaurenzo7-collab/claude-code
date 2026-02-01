import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />)

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles text input', async () => {
    const user = userEvent.setup()
    render(<Input data-testid="input" />)

    const input = screen.getByTestId('input')
    await user.type(input, 'Hello World')

    expect(input).toHaveValue('Hello World')
  })

  it('handles different input types', () => {
    const { rerender } = render(<Input type="text" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'text')

    rerender(<Input type="email" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password')

    rerender(<Input type="number" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number')
  })

  it('can be disabled', () => {
    render(<Input disabled data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('handles change events', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} data-testid="input" />)

    fireEvent.change(screen.getByTestId('input'), {
      target: { value: 'test' },
    })

    expect(handleChange).toHaveBeenCalled()
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    render(
      <Input onFocus={handleFocus} onBlur={handleBlur} data-testid="input" />
    )

    const input = screen.getByTestId('input')

    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalled()

    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" data-testid="input" />)

    expect(screen.getByTestId('input')).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Input ref={ref} />)

    expect(ref).toHaveBeenCalled()
  })

  it('has correct default styles', () => {
    render(<Input data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveClass('flex')
    expect(input).toHaveClass('h-10')
    expect(input).toHaveClass('w-full')
    expect(input).toHaveClass('rounded-md')
    expect(input).toHaveClass('border')
    expect(input).toHaveClass('border-input')
    expect(input).toHaveClass('bg-background')
    expect(input).toHaveClass('px-3')
    expect(input).toHaveClass('py-2')
    expect(input).toHaveClass('text-sm')
  })

  it('supports required attribute', () => {
    render(<Input required data-testid="input" />)

    expect(screen.getByTestId('input')).toBeRequired()
  })

  it('supports min and max for number inputs', () => {
    render(<Input type="number" min={0} max={100} data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '100')
  })

  it('supports pattern validation', () => {
    render(<Input pattern="[A-Za-z]+" data-testid="input" />)

    expect(screen.getByTestId('input')).toHaveAttribute('pattern', '[A-Za-z]+')
  })
})
