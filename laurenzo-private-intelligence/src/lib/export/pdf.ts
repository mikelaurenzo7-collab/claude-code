import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Company, RealEstate, CompanyValuationResult, RealEstateValuationResult } from '@/types'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111827',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    width: '40%',
  },
  value: {
    fontSize: 10,
    color: '#111827',
    width: '60%',
    fontWeight: 'bold',
  },
  valuationBox: {
    backgroundColor: '#eff6ff',
    padding: 15,
    marginBottom: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  valuationTitle: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  valuationAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  valuationRange: {
    fontSize: 10,
    color: '#6b7280',
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  confidenceValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  methodology: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  methodologyText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
  disclaimer: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 8,
    color: '#92400e',
    lineHeight: 1.4,
  },
})

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export interface CompanyReportData {
  company: Company
  valuation: CompanyValuationResult | null
}

export interface RealEstateReportData {
  property: RealEstate
  valuation: RealEstateValuationResult | null
}

export function CompanyValuationReport({ company, valuation }: CompanyReportData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Laurenzo Private Intelligence</Text>
          <Text style={styles.subtitle}>Company Valuation Report</Text>
        </View>

        {/* Company Name */}
        <Text style={styles.title}>{company.name}</Text>

        {/* Valuation Summary */}
        {valuation && (
          <View style={styles.valuationBox}>
            <Text style={styles.valuationTitle}>Estimated Valuation</Text>
            <Text style={styles.valuationAmount}>
              {formatCurrency(valuation.valuation * 100)}
            </Text>
            <Text style={styles.valuationRange}>
              Range: {formatCurrency(valuation.low * 100)} -{' '}
              {formatCurrency(valuation.high * 100)}
            </Text>
            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>Confidence Score:</Text>
              <Text style={styles.confidenceValue}>
                {formatPercent(valuation.confidence)}
              </Text>
            </View>
          </View>
        )}

        {/* Company Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Industry</Text>
            <Text style={styles.value}>{company.industry || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>
              {company.city && company.state
                ? `${company.city}, ${company.state}`
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Employees</Text>
            <Text style={styles.value}>
              {company.employees ? formatNumber(company.employees) : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Founded</Text>
            <Text style={styles.value}>{company.founded_year || 'N/A'}</Text>
          </View>
        </View>

        {/* Financial Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Revenue</Text>
            <Text style={styles.value}>
              {company.revenue_cents
                ? formatCurrency(company.revenue_cents)
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>EBITDA</Text>
            <Text style={styles.value}>
              {company.ebitda_cents
                ? formatCurrency(company.ebitda_cents)
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Growth Rate</Text>
            <Text style={styles.value}>
              {company.growth_rate ? `${company.growth_rate}%` : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Methodology */}
        {valuation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Valuation Methodology</Text>
            <View style={styles.methodology}>
              <Text style={styles.methodologyText}>
                {valuation.methodology}
              </Text>
              <Text style={styles.methodologyText}>
                Industry Multiple: {valuation.industryMultiple}x
              </Text>
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            DISCLAIMER: This valuation report is provided for informational purposes
            only and should not be construed as financial advice. The valuation
            estimates are based on available data and industry multiples, and actual
            market values may differ significantly. Laurenzo Private Intelligence
            makes no representations or warranties regarding the accuracy or
            completeness of this information.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
          <Text style={styles.footerText}>
            Laurenzo Private Intelligence
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export function RealEstateValuationReport({ property, valuation }: RealEstateReportData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Laurenzo Private Intelligence</Text>
          <Text style={styles.subtitle}>Real Estate Valuation Report</Text>
        </View>

        {/* Property Name */}
        <Text style={styles.title}>{property.property_name}</Text>

        {/* Valuation Summary */}
        {valuation && (
          <View style={styles.valuationBox}>
            <Text style={styles.valuationTitle}>Estimated Valuation</Text>
            <Text style={styles.valuationAmount}>
              {formatCurrency(valuation.valuation * 100)}
            </Text>
            <Text style={styles.valuationRange}>
              Range: {formatCurrency(valuation.low * 100)} -{' '}
              {formatCurrency(valuation.high * 100)}
            </Text>
            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>Confidence Score:</Text>
              <Text style={styles.confidenceValue}>
                {formatPercent(valuation.confidence)}
              </Text>
            </View>
          </View>
        )}

        {/* Property Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Property Type</Text>
            <Text style={styles.value}>
              {property.property_type
                ? property.property_type.charAt(0).toUpperCase() +
                  property.property_type.slice(1)
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Property Class</Text>
            <Text style={styles.value}>
              {property.property_class ? `Class ${property.property_class}` : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{property.address || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>
              {property.city && property.state
                ? `${property.city}, ${property.state}`
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Square Feet</Text>
            <Text style={styles.value}>
              {property.square_feet
                ? formatNumber(property.square_feet)
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Year Built</Text>
            <Text style={styles.value}>{property.year_built || 'N/A'}</Text>
          </View>
        </View>

        {/* Financial Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Metrics</Text>
          {valuation && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Cap Rate</Text>
                <Text style={styles.value}>{valuation.capRate}%</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Price per Sq Ft</Text>
                <Text style={styles.value}>
                  ${formatNumber(valuation.pricePerSqft)}
                </Text>
              </View>
            </>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>NOI</Text>
            <Text style={styles.value}>
              {property.noi_cents
                ? formatCurrency(property.noi_cents)
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Occupancy Rate</Text>
            <Text style={styles.value}>
              {property.occupancy_rate ? `${property.occupancy_rate}%` : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Methodology */}
        {valuation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Valuation Methodology</Text>
            <View style={styles.methodology}>
              <Text style={styles.methodologyText}>
                {valuation.methodology}
              </Text>
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            DISCLAIMER: This valuation report is provided for informational purposes
            only and should not be construed as financial advice. The valuation
            estimates are based on available data and market comparables, and actual
            market values may differ significantly. Laurenzo Private Intelligence
            makes no representations or warranties regarding the accuracy or
            completeness of this information.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
          <Text style={styles.footerText}>
            Laurenzo Private Intelligence
          </Text>
        </View>
      </Page>
    </Document>
  )
}
