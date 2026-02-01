-- Laurenzo Private Intelligence Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  website TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',

  -- Financials (in cents to avoid float issues)
  revenue_cents BIGINT,
  ebitda_cents BIGINT,
  valuation_cents BIGINT,

  -- Metrics
  employees INTEGER,
  founded_year INTEGER,
  growth_rate DECIMAL(5,2),

  -- Valuation metadata
  valuation_date DATE,
  valuation_methodology TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),

  -- Data sources
  data_sources TEXT[],
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Search (requires pg_trgm extension for full-text search)
  -- search_vector tsvector,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real estate table
CREATE TABLE IF NOT EXISTS real_estate (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_name TEXT NOT NULL,
  property_type TEXT, -- office, industrial, retail, multifamily, mixed-use
  property_class TEXT, -- Class A, B, C

  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  zip_code TEXT,

  -- Property details
  square_feet INTEGER,
  number_of_units INTEGER, -- for multifamily
  year_built INTEGER,
  occupancy_rate DECIMAL(5,2),

  -- Financials (in cents)
  valuation_cents BIGINT,
  noi_cents BIGINT, -- Net Operating Income
  asking_price_cents BIGINT,

  -- Valuation metrics
  cap_rate DECIMAL(5,2),
  price_per_sqft_cents INTEGER,

  -- Metadata
  valuation_date DATE,
  valuation_methodology TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  data_sources TEXT[],

  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Stripe data
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Plan details
  plan_tier TEXT CHECK (plan_tier IN ('free', 'professional', 'enterprise')) DEFAULT 'free',
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) DEFAULT 'active',

  -- Billing
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,

  -- Limits
  monthly_views_used INTEGER DEFAULT 0,
  monthly_views_limit INTEGER DEFAULT 10,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracked assets (saved/favorited companies/properties)
CREATE TABLE IF NOT EXISTS tracked_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT CHECK (asset_type IN ('company', 'real_estate')) NOT NULL,
  asset_id UUID NOT NULL,

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, asset_type, asset_id)
);

-- Asset views (for free tier limits)
CREATE TABLE IF NOT EXISTS asset_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT CHECK (asset_type IN ('company', 'real_estate')) NOT NULL,
  asset_id UUID NOT NULL,

  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exports (track PDF exports)
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT CHECK (asset_type IN ('company', 'real_estate')) NOT NULL,
  asset_id UUID NOT NULL,
  export_type TEXT CHECK (export_type IN ('pdf', 'csv')) NOT NULL,
  file_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Valuation history (track changes over time)
CREATE TABLE IF NOT EXISTS valuation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_type TEXT CHECK (asset_type IN ('company', 'real_estate')) NOT NULL,
  asset_id UUID NOT NULL,
  valuation_cents BIGINT NOT NULL,
  methodology TEXT,
  confidence_score DECIMAL(3,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_state ON companies(state);
CREATE INDEX IF NOT EXISTS idx_companies_revenue ON companies(revenue_cents);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

CREATE INDEX IF NOT EXISTS idx_real_estate_type ON real_estate(property_type);
CREATE INDEX IF NOT EXISTS idx_real_estate_city ON real_estate(city);
CREATE INDEX IF NOT EXISTS idx_real_estate_valuation ON real_estate(valuation_cents);
CREATE INDEX IF NOT EXISTS idx_real_estate_name ON real_estate(property_name);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_tracked_assets_user ON tracked_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_views_user_date ON asset_views(user_id, viewed_at);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- Subscriptions: users can only see/modify their own
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tracked assets: users can only see/modify their own
CREATE POLICY "Users can view own tracked assets" ON tracked_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracked assets" ON tracked_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracked assets" ON tracked_assets
  FOR DELETE USING (auth.uid() = user_id);

-- Asset views: users can only see/create their own
CREATE POLICY "Users can view own asset views" ON asset_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own asset views" ON asset_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Exports: users can only see/create their own
CREATE POLICY "Users can view own exports" ON exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exports" ON exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Companies and Real Estate: all authenticated users can read
CREATE POLICY "Authenticated users can view companies" ON companies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view real estate" ON real_estate
  FOR SELECT TO authenticated USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_real_estate_updated_at
  BEFORE UPDATE ON real_estate
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample seed data (optional - for testing)
-- INSERT INTO companies (name, industry, city, state, revenue_cents, ebitda_cents, employees, founded_year, growth_rate, confidence_score)
-- VALUES
--   ('Midwest Manufacturing Co', 'Manufacturing', 'Chicago', 'IL', 1500000000, 225000000, 150, 1995, 8.5, 0.90),
--   ('TechServe Solutions', 'IT Services', 'Phoenix', 'AZ', 800000000, 160000000, 75, 2010, 15.0, 0.85),
--   ('Healthcare Partners LLC', 'Healthcare', 'Atlanta', 'GA', 2000000000, 300000000, 200, 2005, 12.0, 0.88);

-- INSERT INTO real_estate (property_name, property_type, property_class, city, state, square_feet, year_built, valuation_cents, cap_rate, occupancy_rate, confidence_score)
-- VALUES
--   ('Downtown Office Plaza', 'office', 'A', 'Chicago', 'IL', 150000, 2015, 4500000000, 7.5, 92.5, 0.93),
--   ('Industrial Distribution Center', 'industrial', 'B', 'Dallas', 'TX', 250000, 2008, 3200000000, 6.8, 98.0, 0.91),
--   ('Metro Retail Center', 'retail', 'A', 'Miami', 'FL', 80000, 2018, 2800000000, 6.5, 95.0, 0.89);
