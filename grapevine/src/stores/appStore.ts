import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Company, CompanyWithFinancials, Financial, FundingRound, Investor, PrecedentTransaction } from '@/types/company'
import type { Deal } from '@/types/deal'
import type { DistressedAsset, RealEstateListing, IntelligenceSignal } from '@/types/market'
import {
  companies as seedCompanies,
  financials as seedFinancials,
  fundingRounds as seedFundingRounds,
  investors as seedInvestors,
  precedentTransactions as seedPrecedentTransactions,
  distressedAssets as seedDistressedAssets,
  realEstateListings as seedRealEstateListings,
  intelligenceSignals as seedIntelligenceSignals,
  demoDeals as seedDeals,
} from '@/lib/seedData'

interface AppState {
  // Data
  companies: Company[]
  financials: Financial[]
  fundingRounds: FundingRound[]
  investors: Investor[]
  precedentTransactions: PrecedentTransaction[]
  distressedAssets: DistressedAsset[]
  realEstateListings: RealEstateListing[]
  intelligenceSignals: IntelligenceSignal[]
  deals: Deal[]
  watchlist: string[] // company IDs

  // Settings
  apiKeys: {
    openai?: string
    alphavantage?: string
    fred?: string
  }

  // Auth (simple)
  isAuthenticated: boolean
  user: { email: string; name: string } | null

  // Actions
  login: (email: string, name: string) => void
  logout: () => void
  setApiKey: (provider: string, key: string) => void
  addToWatchlist: (companyId: string) => void
  removeFromWatchlist: (companyId: string) => void
  addDeal: (deal: Deal) => void
  updateDeal: (id: string, updates: Partial<Deal>) => void
  deleteDeal: (id: string) => void
  getCompanyWithFinancials: (id: string) => CompanyWithFinancials | null
  getAllCompaniesWithFinancials: () => CompanyWithFinancials[]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      companies: seedCompanies,
      financials: seedFinancials,
      fundingRounds: seedFundingRounds,
      investors: seedInvestors,
      precedentTransactions: seedPrecedentTransactions,
      distressedAssets: seedDistressedAssets,
      realEstateListings: seedRealEstateListings,
      intelligenceSignals: seedIntelligenceSignals,
      deals: seedDeals,
      watchlist: ['c1', 'c7', 'c17'],
      apiKeys: {},
      isAuthenticated: true, // Default to logged in for demo
      user: { email: 'demo@grapevine.fund', name: 'Demo User' },

      login: (email, name) => set({ isAuthenticated: true, user: { email, name } }),
      logout: () => set({ isAuthenticated: false, user: null }),
      setApiKey: (provider, key) =>
        set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } })),

      addToWatchlist: (companyId) =>
        set((state) => ({
          watchlist: state.watchlist.includes(companyId)
            ? state.watchlist
            : [...state.watchlist, companyId],
        })),
      removeFromWatchlist: (companyId) =>
        set((state) => ({
          watchlist: state.watchlist.filter((id) => id !== companyId),
        })),

      addDeal: (deal) => set((state) => ({ deals: [...state.deals, deal] })),
      updateDeal: (id, updates) =>
        set((state) => ({
          deals: state.deals.map((d) =>
            d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
          ),
        })),
      deleteDeal: (id) =>
        set((state) => ({ deals: state.deals.filter((d) => d.id !== id) })),

      getCompanyWithFinancials: (id) => {
        const state = get()
        const company = state.companies.find((c) => c.id === id)
        if (!company) return null
        const fins = state.financials.filter((f) => f.company_id === id)
        const rounds = state.fundingRounds.filter((r) => r.company_id === id)
        return {
          ...company,
          financials: fins,
          funding_rounds: rounds,
          latest_financial: fins.length > 0 ? fins[fins.length - 1] : undefined,
          latest_funding: rounds.length > 0 ? rounds[rounds.length - 1] : undefined,
        }
      },

      getAllCompaniesWithFinancials: () => {
        const state = get()
        return state.companies.map((company) => {
          const fins = state.financials.filter((f) => f.company_id === company.id)
          const rounds = state.fundingRounds.filter((r) => r.company_id === company.id)
          return {
            ...company,
            financials: fins,
            funding_rounds: rounds,
            latest_financial: fins.length > 0 ? fins[fins.length - 1] : undefined,
            latest_funding: rounds.length > 0 ? rounds[rounds.length - 1] : undefined,
          }
        })
      },
    }),
    {
      name: 'grapevine-store',
      partialize: (state) => ({
        watchlist: state.watchlist,
        deals: state.deals,
        apiKeys: state.apiKeys,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
)
