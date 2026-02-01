import {
  cn,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatCompactCurrency,
  centsToDollars,
  dollarsToCents,
  getConfidenceLabel,
  getConfidenceColor,
  truncate,
  slugify,
  debounce,
  getInitials,
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className merge)', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar')
    })

    it('should dedupe tailwind classes', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle arrays and objects', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
      expect(cn({ foo: true, bar: false })).toBe('foo')
    })
  })

  describe('formatCurrency', () => {
    it('should format cents to currency', () => {
      expect(formatCurrency(100000)).toBe('$1,000')
      expect(formatCurrency(1234567)).toBe('$12,346')
    })

    it('should handle null and undefined', () => {
      expect(formatCurrency(null)).toBe('N/A')
      expect(formatCurrency(undefined)).toBe('N/A')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0')
    })

    it('should format large numbers', () => {
      expect(formatCurrency(1000000000)).toBe('$10,000,000')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1234567)).toBe('1,234,567')
    })

    it('should handle null and undefined', () => {
      expect(formatNumber(null)).toBe('N/A')
      expect(formatNumber(undefined)).toBe('N/A')
    })

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('formatPercent', () => {
    it('should format decimal to percentage', () => {
      expect(formatPercent(0.5)).toBe('50.0%')
      expect(formatPercent(0.123)).toBe('12.3%')
      expect(formatPercent(1)).toBe('100.0%')
    })

    it('should handle null and undefined', () => {
      expect(formatPercent(null)).toBe('N/A')
      expect(formatPercent(undefined)).toBe('N/A')
    })

    it('should handle zero', () => {
      expect(formatPercent(0)).toBe('0.0%')
    })
  })

  describe('formatCompactCurrency', () => {
    it('should format billions', () => {
      expect(formatCompactCurrency(100000000000)).toBe('$1.0B')
      expect(formatCompactCurrency(250000000000)).toBe('$2.5B')
    })

    it('should format millions', () => {
      expect(formatCompactCurrency(100000000)).toBe('$1.0M')
      expect(formatCompactCurrency(1250000000)).toBe('$12.5M')
    })

    it('should format thousands', () => {
      expect(formatCompactCurrency(10000000)).toBe('$100K')
      expect(formatCompactCurrency(50000000)).toBe('$500K')
    })

    it('should format small amounts normally', () => {
      expect(formatCompactCurrency(50000)).toBe('$500')
    })

    it('should handle null and undefined', () => {
      expect(formatCompactCurrency(null)).toBe('N/A')
      expect(formatCompactCurrency(undefined)).toBe('N/A')
    })
  })

  describe('centsToDollars', () => {
    it('should convert cents to dollars', () => {
      expect(centsToDollars(100)).toBe(1)
      expect(centsToDollars(1234)).toBe(12.34)
      expect(centsToDollars(0)).toBe(0)
    })
  })

  describe('dollarsToCents', () => {
    it('should convert dollars to cents', () => {
      expect(dollarsToCents(1)).toBe(100)
      expect(dollarsToCents(12.34)).toBe(1234)
      expect(dollarsToCents(0)).toBe(0)
    })

    it('should handle floating point precision', () => {
      expect(dollarsToCents(0.1)).toBe(10)
      expect(dollarsToCents(0.01)).toBe(1)
    })
  })

  describe('getConfidenceLabel', () => {
    it('should return High for scores >= 0.9', () => {
      expect(getConfidenceLabel(0.9)).toBe('High')
      expect(getConfidenceLabel(0.95)).toBe('High')
      expect(getConfidenceLabel(1)).toBe('High')
    })

    it('should return Medium for scores >= 0.75', () => {
      expect(getConfidenceLabel(0.75)).toBe('Medium')
      expect(getConfidenceLabel(0.8)).toBe('Medium')
      expect(getConfidenceLabel(0.89)).toBe('Medium')
    })

    it('should return Low for scores < 0.75', () => {
      expect(getConfidenceLabel(0.74)).toBe('Low')
      expect(getConfidenceLabel(0.5)).toBe('Low')
      expect(getConfidenceLabel(0)).toBe('Low')
    })

    it('should return Unknown for null/undefined', () => {
      expect(getConfidenceLabel(null)).toBe('Unknown')
      expect(getConfidenceLabel(undefined)).toBe('Unknown')
    })
  })

  describe('getConfidenceColor', () => {
    it('should return green for high confidence', () => {
      expect(getConfidenceColor(0.9)).toBe('text-green-600')
      expect(getConfidenceColor(1)).toBe('text-green-600')
    })

    it('should return yellow for medium confidence', () => {
      expect(getConfidenceColor(0.75)).toBe('text-yellow-600')
      expect(getConfidenceColor(0.85)).toBe('text-yellow-600')
    })

    it('should return red for low confidence', () => {
      expect(getConfidenceColor(0.5)).toBe('text-red-600')
      expect(getConfidenceColor(0)).toBe('text-red-600')
    })

    it('should return gray for null/undefined', () => {
      expect(getConfidenceColor(null)).toBe('text-gray-500')
      expect(getConfidenceColor(undefined)).toBe('text-gray-500')
    })
  })

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello, World!', 5)).toBe('Hello...')
      expect(truncate('This is a test', 7)).toBe('This is...')
    })

    it('should not truncate short strings', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
      expect(truncate('Hi', 5)).toBe('Hi')
    })

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello')
    })
  })

  describe('slugify', () => {
    it('should convert to lowercase', () => {
      expect(slugify('Hello')).toBe('hello')
    })

    it('should replace spaces with hyphens', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('should remove special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world')
      expect(slugify('Test@#$%String')).toBe('test-string')
    })

    it('should handle multiple spaces and hyphens', () => {
      expect(slugify('Hello   World')).toBe('hello-world')
      expect(slugify('---hello---')).toBe('hello')
    })
  })

  describe('debounce', () => {
    jest.useFakeTimers()

    it('should debounce function calls', () => {
      const fn = jest.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(fn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should pass arguments to debounced function', () => {
      const fn = jest.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('arg1', 'arg2')

      jest.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    afterAll(() => {
      jest.useRealTimers()
    })
  })

  describe('getInitials', () => {
    it('should return first letters of words', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Jane Smith')).toBe('JS')
    })

    it('should handle single names', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should limit to 2 characters', () => {
      expect(getInitials('John William Doe')).toBe('JW')
    })

    it('should handle lowercase names', () => {
      expect(getInitials('john doe')).toBe('JD')
    })
  })
})
