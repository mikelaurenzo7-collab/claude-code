export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          industry: string | null
          description: string | null
          website: string | null
          city: string | null
          state: string | null
          country: string
          revenue_cents: number | null
          ebitda_cents: number | null
          valuation_cents: number | null
          employees: number | null
          founded_year: number | null
          growth_rate: number | null
          valuation_date: string | null
          valuation_methodology: string | null
          confidence_score: number | null
          data_sources: string[] | null
          last_updated: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          industry?: string | null
          description?: string | null
          website?: string | null
          city?: string | null
          state?: string | null
          country?: string
          revenue_cents?: number | null
          ebitda_cents?: number | null
          valuation_cents?: number | null
          employees?: number | null
          founded_year?: number | null
          growth_rate?: number | null
          valuation_date?: string | null
          valuation_methodology?: string | null
          confidence_score?: number | null
          data_sources?: string[] | null
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          description?: string | null
          website?: string | null
          city?: string | null
          state?: string | null
          country?: string
          revenue_cents?: number | null
          ebitda_cents?: number | null
          valuation_cents?: number | null
          employees?: number | null
          founded_year?: number | null
          growth_rate?: number | null
          valuation_date?: string | null
          valuation_methodology?: string | null
          confidence_score?: number | null
          data_sources?: string[] | null
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
      }
      real_estate: {
        Row: {
          id: string
          property_name: string
          property_type: string | null
          property_class: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string
          zip_code: string | null
          square_feet: number | null
          number_of_units: number | null
          year_built: number | null
          occupancy_rate: number | null
          valuation_cents: number | null
          noi_cents: number | null
          asking_price_cents: number | null
          cap_rate: number | null
          price_per_sqft_cents: number | null
          valuation_date: string | null
          valuation_methodology: string | null
          confidence_score: number | null
          data_sources: string[] | null
          last_updated: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_name: string
          property_type?: string | null
          property_class?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          zip_code?: string | null
          square_feet?: number | null
          number_of_units?: number | null
          year_built?: number | null
          occupancy_rate?: number | null
          valuation_cents?: number | null
          noi_cents?: number | null
          asking_price_cents?: number | null
          cap_rate?: number | null
          price_per_sqft_cents?: number | null
          valuation_date?: string | null
          valuation_methodology?: string | null
          confidence_score?: number | null
          data_sources?: string[] | null
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_name?: string
          property_type?: string | null
          property_class?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          zip_code?: string | null
          square_feet?: number | null
          number_of_units?: number | null
          year_built?: number | null
          occupancy_rate?: number | null
          valuation_cents?: number | null
          noi_cents?: number | null
          asking_price_cents?: number | null
          cap_rate?: number | null
          price_per_sqft_cents?: number | null
          valuation_date?: string | null
          valuation_methodology?: string | null
          confidence_score?: number | null
          data_sources?: string[] | null
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          plan_tier: 'free' | 'professional' | 'enterprise'
          status: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          monthly_views_used: number
          monthly_views_limit: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan_tier?: 'free' | 'professional' | 'enterprise'
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          monthly_views_used?: number
          monthly_views_limit?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan_tier?: 'free' | 'professional' | 'enterprise'
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          monthly_views_used?: number
          monthly_views_limit?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      tracked_assets: {
        Row: {
          id: string
          user_id: string
          asset_type: 'company' | 'real_estate'
          asset_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          asset_type: 'company' | 'real_estate'
          asset_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          asset_type?: 'company' | 'real_estate'
          asset_id?: string
          notes?: string | null
          created_at?: string
        }
      }
      asset_views: {
        Row: {
          id: string
          user_id: string
          asset_type: 'company' | 'real_estate'
          asset_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          asset_type: 'company' | 'real_estate'
          asset_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          asset_type?: 'company' | 'real_estate'
          asset_id?: string
          viewed_at?: string
        }
      }
      exports: {
        Row: {
          id: string
          user_id: string
          asset_type: 'company' | 'real_estate'
          asset_id: string
          export_type: 'pdf' | 'csv'
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          asset_type: 'company' | 'real_estate'
          asset_id: string
          export_type: 'pdf' | 'csv'
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          asset_type?: 'company' | 'real_estate'
          asset_id?: string
          export_type?: 'pdf' | 'csv'
          file_url?: string | null
          created_at?: string
        }
      }
      valuation_history: {
        Row: {
          id: string
          asset_type: 'company' | 'real_estate'
          asset_id: string
          valuation_cents: number
          methodology: string | null
          confidence_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          asset_type: 'company' | 'real_estate'
          asset_id: string
          valuation_cents: number
          methodology?: string | null
          confidence_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          asset_type?: 'company' | 'real_estate'
          asset_id?: string
          valuation_cents?: number
          methodology?: string | null
          confidence_score?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Company = Database['public']['Tables']['companies']['Row']
export type RealEstate = Database['public']['Tables']['real_estate']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type TrackedAsset = Database['public']['Tables']['tracked_assets']['Row']
export type AssetView = Database['public']['Tables']['asset_views']['Row']
export type Export = Database['public']['Tables']['exports']['Row']
export type ValuationHistory = Database['public']['Tables']['valuation_history']['Row']

export type PlanTier = 'free' | 'professional' | 'enterprise'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type AssetType = 'company' | 'real_estate'
export type ExportType = 'pdf' | 'csv'
export type PropertyType = 'office' | 'industrial' | 'retail' | 'multifamily' | 'mixed-use'
export type PropertyClass = 'A' | 'B' | 'C'
