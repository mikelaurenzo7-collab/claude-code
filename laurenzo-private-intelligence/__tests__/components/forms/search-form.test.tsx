import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Create a simple SearchForm component for testing
const SearchForm = ({
  onSearch,
  placeholder = 'Search...',
}: {
  onSearch: (term: string) => void
  placeholder?: string
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    onSearch(formData.get('search') as string)
  }

  return (
    <form onSubmit={handleSubmit} role="search">
      <input
        type="text"
        name="search"
        placeholder={placeholder}
        aria-label="Search"
      />
      <button type="submit">Search</button>
    </form>
  )
}

describe('Search Form', () => {
  it('renders with placeholder', () => {
    render(<SearchForm onSearch={() => {}} placeholder="Search companies..." />)

    expect(screen.getByPlaceholderText('Search companies...')).toBeInTheDocument()
  })

  it('has accessible search role', () => {
    render(<SearchForm onSearch={() => {}} />)

    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('has accessible search input', () => {
    render(<SearchForm onSearch={() => {}} />)

    expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument()
  })

  it('calls onSearch with the search term on submit', async () => {
    const user = userEvent.setup()
    const handleSearch = jest.fn()
    render(<SearchForm onSearch={handleSearch} />)

    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: /search/i })

    await user.type(input, 'test query')
    await user.click(button)

    expect(handleSearch).toHaveBeenCalledWith('test query')
  })

  it('submits on enter key', async () => {
    const user = userEvent.setup()
    const handleSearch = jest.fn()
    render(<SearchForm onSearch={handleSearch} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'enter test{Enter}')

    expect(handleSearch).toHaveBeenCalledWith('enter test')
  })

  it('allows empty search submission', async () => {
    const user = userEvent.setup()
    const handleSearch = jest.fn()
    render(<SearchForm onSearch={handleSearch} />)

    const button = screen.getByRole('button', { name: /search/i })
    await user.click(button)

    expect(handleSearch).toHaveBeenCalledWith('')
  })
})

// Test for filter form
const FilterForm = ({
  industries,
  onFilterChange,
}: {
  industries: string[]
  onFilterChange: (filters: { industry?: string; minRevenue?: number }) => void
}) => {
  return (
    <form role="form" aria-label="Filters">
      <label htmlFor="industry">Industry</label>
      <select
        id="industry"
        name="industry"
        onChange={(e) => onFilterChange({ industry: e.target.value || undefined })}
      >
        <option value="">All Industries</option>
        {industries.map((ind) => (
          <option key={ind} value={ind}>
            {ind}
          </option>
        ))}
      </select>

      <label htmlFor="minRevenue">Min Revenue</label>
      <input
        type="number"
        id="minRevenue"
        name="minRevenue"
        onChange={(e) =>
          onFilterChange({
            minRevenue: e.target.value ? parseInt(e.target.value) : undefined,
          })
        }
      />
    </form>
  )
}

describe('Filter Form', () => {
  const industries = ['IT Services', 'Manufacturing', 'Healthcare']

  it('renders industry filter with options', () => {
    render(<FilterForm industries={industries} onFilterChange={() => {}} />)

    expect(screen.getByLabelText('Industry')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'All Industries' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'IT Services' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Manufacturing' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Healthcare' })).toBeInTheDocument()
  })

  it('calls onFilterChange when industry changes', async () => {
    const user = userEvent.setup()
    const handleFilterChange = jest.fn()
    render(
      <FilterForm industries={industries} onFilterChange={handleFilterChange} />
    )

    const select = screen.getByLabelText('Industry')
    await user.selectOptions(select, 'Manufacturing')

    expect(handleFilterChange).toHaveBeenCalledWith({ industry: 'Manufacturing' })
  })

  it('calls onFilterChange with undefined when selecting all industries', async () => {
    const user = userEvent.setup()
    const handleFilterChange = jest.fn()
    render(
      <FilterForm industries={industries} onFilterChange={handleFilterChange} />
    )

    const select = screen.getByLabelText('Industry')
    await user.selectOptions(select, 'IT Services')
    await user.selectOptions(select, '')

    expect(handleFilterChange).toHaveBeenLastCalledWith({ industry: undefined })
  })

  it('handles numeric input for revenue filter', async () => {
    const user = userEvent.setup()
    const handleFilterChange = jest.fn()
    render(
      <FilterForm industries={industries} onFilterChange={handleFilterChange} />
    )

    const input = screen.getByLabelText('Min Revenue')
    await user.type(input, '1000000')

    expect(handleFilterChange).toHaveBeenCalled()
  })
})
