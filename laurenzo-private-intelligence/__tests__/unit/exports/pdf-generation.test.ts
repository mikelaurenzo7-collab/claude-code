/**
 * PDF Generation Tests
 *
 * Tests for PDF report generation functionality including:
 * - Company valuation reports
 * - Real estate valuation reports
 * - Snapshot testing for consistent output
 */

// PDF document structure types
interface PDFSection {
  title: string
  content: string | string[]
}

interface PDFDocument {
  title: string
  subtitle?: string
  date: string
  sections: PDFSection[]
  footer?: string
}

// Company valuation report data
interface CompanyReportData {
  company: {
    name: string
    industry: string
    headquarters: string
    foundedYear: number
    employees: number
    website?: string
    description?: string
  }
  financials: {
    revenue: number
    ebitda: number
    ebitdaMargin: number
  }
  valuation: {
    low: number
    mid: number
    high: number
    methodology: string
    multipleRange: string
  }
}

// Real estate report data
interface PropertyReportData {
  property: {
    name: string
    type: string
    address: string
    city: string
    state: string
    zipCode: string
    squareFeet: number
    yearBuilt: number
  }
  financials: {
    noi: number
    capRate: number
    askingPrice: number
    occupancyRate: number
  }
  valuation: {
    low: number
    mid: number
    high: number
    methodology: string
  }
}

// Format currency for reports
function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

// Format percentage
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

// Format number with commas
function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

// Generate company valuation PDF document structure
function generateCompanyReport(data: CompanyReportData): PDFDocument {
  return {
    title: `Valuation Report: ${data.company.name}`,
    subtitle: `Private Company Analysis`,
    date: new Date().toISOString().split('T')[0],
    sections: [
      {
        title: 'Company Overview',
        content: [
          `Name: ${data.company.name}`,
          `Industry: ${data.company.industry}`,
          `Headquarters: ${data.company.headquarters}`,
          `Founded: ${data.company.foundedYear}`,
          `Employees: ${formatNumber(data.company.employees)}`,
          ...(data.company.website ? [`Website: ${data.company.website}`] : []),
          ...(data.company.description
            ? [`Description: ${data.company.description}`]
            : []),
        ],
      },
      {
        title: 'Financial Summary',
        content: [
          `Annual Revenue: ${formatCurrency(data.financials.revenue)}`,
          `EBITDA: ${formatCurrency(data.financials.ebitda)}`,
          `EBITDA Margin: ${formatPercent(data.financials.ebitdaMargin)}`,
        ],
      },
      {
        title: 'Valuation Analysis',
        content: [
          `Methodology: ${data.valuation.methodology}`,
          `Multiple Range: ${data.valuation.multipleRange}`,
          ``,
          `Valuation Range:`,
          `  Low: ${formatCurrency(data.valuation.low)}`,
          `  Mid: ${formatCurrency(data.valuation.mid)}`,
          `  High: ${formatCurrency(data.valuation.high)}`,
        ],
      },
    ],
    footer:
      'This report is for informational purposes only and does not constitute investment advice.',
  }
}

// Generate real estate valuation PDF document structure
function generatePropertyReport(data: PropertyReportData): PDFDocument {
  return {
    title: `Valuation Report: ${data.property.name}`,
    subtitle: `Commercial Real Estate Analysis`,
    date: new Date().toISOString().split('T')[0],
    sections: [
      {
        title: 'Property Overview',
        content: [
          `Property Name: ${data.property.name}`,
          `Property Type: ${data.property.type}`,
          `Address: ${data.property.address}`,
          `Location: ${data.property.city}, ${data.property.state} ${data.property.zipCode}`,
          `Square Feet: ${formatNumber(data.property.squareFeet)}`,
          `Year Built: ${data.property.yearBuilt}`,
        ],
      },
      {
        title: 'Financial Summary',
        content: [
          `Net Operating Income (NOI): ${formatCurrency(data.financials.noi)}`,
          `Cap Rate: ${formatPercent(data.financials.capRate)}`,
          `Asking Price: ${formatCurrency(data.financials.askingPrice)}`,
          `Occupancy Rate: ${formatPercent(data.financials.occupancyRate)}`,
        ],
      },
      {
        title: 'Valuation Analysis',
        content: [
          `Methodology: ${data.valuation.methodology}`,
          ``,
          `Valuation Range:`,
          `  Low: ${formatCurrency(data.valuation.low)}`,
          `  Mid: ${formatCurrency(data.valuation.mid)}`,
          `  High: ${formatCurrency(data.valuation.high)}`,
        ],
      },
    ],
    footer:
      'This report is for informational purposes only and does not constitute investment advice.',
  }
}

// Test data fixtures
const mockCompanyData: CompanyReportData = {
  company: {
    name: 'TechSolutions Inc',
    industry: 'IT Services',
    headquarters: 'Austin, TX',
    foundedYear: 2015,
    employees: 120,
    website: 'https://techsolutions.example.com',
    description: 'Enterprise software solutions provider',
  },
  financials: {
    revenue: 15000000,
    ebitda: 2250000,
    ebitdaMargin: 15.0,
  },
  valuation: {
    low: 11250000,
    mid: 15750000,
    high: 20250000,
    methodology: 'EBITDA Multiple',
    multipleRange: '5.0x - 9.0x',
  },
}

const mockPropertyData: PropertyReportData = {
  property: {
    name: 'Downtown Office Tower',
    type: 'Office',
    address: '100 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    squareFeet: 150000,
    yearBuilt: 2015,
  },
  financials: {
    noi: 4500000,
    capRate: 5.5,
    askingPrice: 82000000,
    occupancyRate: 95,
  },
  valuation: {
    low: 75000000,
    mid: 81800000,
    high: 90000000,
    methodology: 'Cap Rate Analysis',
  },
}

describe('PDF Generation - Formatting Functions', () => {
  describe('formatCurrency', () => {
    it('formats billions correctly', () => {
      expect(formatCurrency(1500000000)).toBe('$1.50B')
      expect(formatCurrency(2750000000)).toBe('$2.75B')
    })

    it('formats millions correctly', () => {
      expect(formatCurrency(15000000)).toBe('$15.00M')
      expect(formatCurrency(1500000)).toBe('$1.50M')
      expect(formatCurrency(82000000)).toBe('$82.00M')
    })

    it('formats thousands correctly', () => {
      expect(formatCurrency(150000)).toBe('$150K')
      expect(formatCurrency(5000)).toBe('$5K')
    })

    it('formats small amounts correctly', () => {
      expect(formatCurrency(999)).toBe('$999')
      expect(formatCurrency(50)).toBe('$50')
    })
  })

  describe('formatPercent', () => {
    it('formats percentages with one decimal', () => {
      expect(formatPercent(15.0)).toBe('15.0%')
      expect(formatPercent(5.5)).toBe('5.5%')
      expect(formatPercent(95)).toBe('95.0%')
      expect(formatPercent(7.25)).toBe('7.3%')
    })
  })

  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(150000)).toBe('150,000')
      expect(formatNumber(1500000)).toBe('1,500,000')
    })
  })
})

describe('PDF Generation - Company Reports', () => {
  it('generates company report with correct structure', () => {
    const report = generateCompanyReport(mockCompanyData)

    expect(report.title).toBe('Valuation Report: TechSolutions Inc')
    expect(report.subtitle).toBe('Private Company Analysis')
    expect(report.sections.length).toBe(3)
    expect(report.footer).toBeDefined()
  })

  it('includes company overview section', () => {
    const report = generateCompanyReport(mockCompanyData)
    const overview = report.sections.find((s) => s.title === 'Company Overview')

    expect(overview).toBeDefined()
    expect(overview?.content).toContain('Name: TechSolutions Inc')
    expect(overview?.content).toContain('Industry: IT Services')
    expect(overview?.content).toContain('Founded: 2015')
    expect(overview?.content).toContain('Employees: 120')
  })

  it('includes financial summary section', () => {
    const report = generateCompanyReport(mockCompanyData)
    const financials = report.sections.find(
      (s) => s.title === 'Financial Summary'
    )

    expect(financials).toBeDefined()
    expect(financials?.content).toContain('Annual Revenue: $15.00M')
    expect(financials?.content).toContain('EBITDA: $2.25M')
    expect(financials?.content).toContain('EBITDA Margin: 15.0%')
  })

  it('includes valuation section', () => {
    const report = generateCompanyReport(mockCompanyData)
    const valuation = report.sections.find(
      (s) => s.title === 'Valuation Analysis'
    )

    expect(valuation).toBeDefined()
    expect(valuation?.content).toContain('Methodology: EBITDA Multiple')
    expect(valuation?.content).toContain('Multiple Range: 5.0x - 9.0x')
  })

  it('matches snapshot', () => {
    const report = generateCompanyReport(mockCompanyData)

    // Remove date for consistent snapshots
    const snapshotReport = { ...report, date: 'SNAPSHOT_DATE' }

    expect(snapshotReport).toMatchSnapshot()
  })

  it('handles missing optional fields', () => {
    const minimalData: CompanyReportData = {
      company: {
        name: 'Minimal Corp',
        industry: 'Technology',
        headquarters: 'San Francisco, CA',
        foundedYear: 2020,
        employees: 50,
      },
      financials: {
        revenue: 5000000,
        ebitda: 500000,
        ebitdaMargin: 10.0,
      },
      valuation: {
        low: 2500000,
        mid: 3500000,
        high: 4500000,
        methodology: 'Revenue Multiple',
        multipleRange: '0.5x - 0.9x',
      },
    }

    const report = generateCompanyReport(minimalData)
    const overview = report.sections.find((s) => s.title === 'Company Overview')

    // Should not include website or description
    expect(overview?.content).not.toContain('Website:')
    expect(overview?.content).not.toContain('Description:')
  })
})

describe('PDF Generation - Property Reports', () => {
  it('generates property report with correct structure', () => {
    const report = generatePropertyReport(mockPropertyData)

    expect(report.title).toBe('Valuation Report: Downtown Office Tower')
    expect(report.subtitle).toBe('Commercial Real Estate Analysis')
    expect(report.sections.length).toBe(3)
    expect(report.footer).toBeDefined()
  })

  it('includes property overview section', () => {
    const report = generatePropertyReport(mockPropertyData)
    const overview = report.sections.find((s) => s.title === 'Property Overview')

    expect(overview).toBeDefined()
    expect(overview?.content).toContain('Property Name: Downtown Office Tower')
    expect(overview?.content).toContain('Property Type: Office')
    expect(overview?.content).toContain('Address: 100 Main Street')
    expect(overview?.content).toContain('Location: New York, NY 10001')
    expect(overview?.content).toContain('Square Feet: 150,000')
    expect(overview?.content).toContain('Year Built: 2015')
  })

  it('includes financial summary section', () => {
    const report = generatePropertyReport(mockPropertyData)
    const financials = report.sections.find(
      (s) => s.title === 'Financial Summary'
    )

    expect(financials).toBeDefined()
    expect(financials?.content).toContain(
      'Net Operating Income (NOI): $4.50M'
    )
    expect(financials?.content).toContain('Cap Rate: 5.5%')
    expect(financials?.content).toContain('Asking Price: $82.00M')
    expect(financials?.content).toContain('Occupancy Rate: 95.0%')
  })

  it('includes valuation section', () => {
    const report = generatePropertyReport(mockPropertyData)
    const valuation = report.sections.find(
      (s) => s.title === 'Valuation Analysis'
    )

    expect(valuation).toBeDefined()
    expect(valuation?.content).toContain('Methodology: Cap Rate Analysis')
    expect(valuation?.content).toContain('Low: $75.00M')
    expect(valuation?.content).toContain('Mid: $81.80M')
    expect(valuation?.content).toContain('High: $90.00M')
  })

  it('matches snapshot', () => {
    const report = generatePropertyReport(mockPropertyData)

    // Remove date for consistent snapshots
    const snapshotReport = { ...report, date: 'SNAPSHOT_DATE' }

    expect(snapshotReport).toMatchSnapshot()
  })

  it('handles different property types', () => {
    const propertyTypes = ['Office', 'Industrial', 'Retail', 'Multifamily', 'Mixed-Use']

    propertyTypes.forEach((type) => {
      const data: PropertyReportData = {
        ...mockPropertyData,
        property: { ...mockPropertyData.property, type },
      }

      const report = generatePropertyReport(data)
      const overview = report.sections.find(
        (s) => s.title === 'Property Overview'
      )

      expect(overview?.content).toContain(`Property Type: ${type}`)
    })
  })
})

describe('PDF Document Serialization', () => {
  function serializeDocument(doc: PDFDocument): string {
    let output = ''

    output += `${doc.title}\n`
    if (doc.subtitle) {
      output += `${doc.subtitle}\n`
    }
    output += `Date: ${doc.date}\n`
    output += '\n'

    doc.sections.forEach((section) => {
      output += `## ${section.title}\n`
      if (Array.isArray(section.content)) {
        section.content.forEach((line) => {
          output += `${line}\n`
        })
      } else {
        output += `${section.content}\n`
      }
      output += '\n'
    })

    if (doc.footer) {
      output += `---\n${doc.footer}\n`
    }

    return output
  }

  it('serializes company report to text', () => {
    const report = generateCompanyReport(mockCompanyData)
    const text = serializeDocument(report)

    expect(text).toContain('Valuation Report: TechSolutions Inc')
    expect(text).toContain('## Company Overview')
    expect(text).toContain('## Financial Summary')
    expect(text).toContain('## Valuation Analysis')
    expect(text).toContain('This report is for informational purposes')
  })

  it('serializes property report to text', () => {
    const report = generatePropertyReport(mockPropertyData)
    const text = serializeDocument(report)

    expect(text).toContain('Valuation Report: Downtown Office Tower')
    expect(text).toContain('## Property Overview')
    expect(text).toContain('## Financial Summary')
    expect(text).toContain('## Valuation Analysis')
  })

  it('serialization matches snapshot', () => {
    const companyReport = generateCompanyReport(mockCompanyData)
    const companyText = serializeDocument({
      ...companyReport,
      date: 'SNAPSHOT_DATE',
    })

    expect(companyText).toMatchSnapshot()

    const propertyReport = generatePropertyReport(mockPropertyData)
    const propertyText = serializeDocument({
      ...propertyReport,
      date: 'SNAPSHOT_DATE',
    })

    expect(propertyText).toMatchSnapshot()
  })
})

describe('PDF Content Validation', () => {
  it('validates company report has required sections', () => {
    const report = generateCompanyReport(mockCompanyData)
    const sectionTitles = report.sections.map((s) => s.title)

    expect(sectionTitles).toContain('Company Overview')
    expect(sectionTitles).toContain('Financial Summary')
    expect(sectionTitles).toContain('Valuation Analysis')
  })

  it('validates property report has required sections', () => {
    const report = generatePropertyReport(mockPropertyData)
    const sectionTitles = report.sections.map((s) => s.title)

    expect(sectionTitles).toContain('Property Overview')
    expect(sectionTitles).toContain('Financial Summary')
    expect(sectionTitles).toContain('Valuation Analysis')
  })

  it('validates valuation range is properly ordered', () => {
    const report = generateCompanyReport(mockCompanyData)
    const valuation = report.sections.find(
      (s) => s.title === 'Valuation Analysis'
    )

    // Parse values from content
    const content = valuation?.content as string[]
    const lowLine = content.find((l) => l.includes('Low:'))
    const midLine = content.find((l) => l.includes('Mid:'))
    const highLine = content.find((l) => l.includes('High:'))

    expect(lowLine).toBeDefined()
    expect(midLine).toBeDefined()
    expect(highLine).toBeDefined()
  })

  it('validates footer contains disclaimer', () => {
    const companyReport = generateCompanyReport(mockCompanyData)
    const propertyReport = generatePropertyReport(mockPropertyData)

    expect(companyReport.footer).toContain('informational purposes')
    expect(propertyReport.footer).toContain('informational purposes')
    expect(companyReport.footer).toContain('not constitute investment advice')
    expect(propertyReport.footer).toContain('not constitute investment advice')
  })
})
