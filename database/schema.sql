-- ==================== LAURENZO TERMINAL DATABASE SCHEMA ====================
-- PostgreSQL Schema for Private Investment Bloomberg Terminal

-- ==================== USERS & AUTH ====================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    firm VARCHAR(255),
    tier VARCHAR(50) NOT NULL DEFAULT 'free', -- free, professional, enterprise
    permissions TEXT[] DEFAULT '{}', -- ['real-estate', 'private-equity', 'venture-capital']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    stripe_customer_id VARCHAR(255)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);

CREATE TABLE user_activity (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- login, view_asset, search, export, etc.
    asset_id VARCHAR(50),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON user_activity(user_id, created_at DESC);
CREATE INDEX idx_activity_asset ON user_activity(asset_id);

-- ==================== CORE ASSETS ====================

CREATE TABLE assets (
    id VARCHAR(50) PRIMARY KEY, -- PE-001, VC-001, RE-001
    type VARCHAR(50) NOT NULL, -- private-equity, venture-capital, real-estate
    name VARCHAR(500) NOT NULL,
    sector VARCHAR(200) NOT NULL,
    geography VARCHAR(200) NOT NULL,

    -- Financial metrics (common across all types)
    revenue BIGINT,
    valuation BIGINT NOT NULL,
    valuation_change_30d DECIMAL(10, 4),
    valuation_change_90d DECIMAL(10, 4),
    valuation_change_1yr DECIMAL(10, 4),

    -- Type-specific metrics stored as JSONB
    metrics JSONB NOT NULL DEFAULT '{}',

    -- Metadata
    description TEXT,
    founded_year INTEGER,
    employees INTEGER,
    website VARCHAR(500),

    -- Data tracking
    data_quality_score INTEGER, -- 0-100
    last_data_update TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Full-text search
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(sector, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(geography, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'D')
    ) STORED
);

CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_sector ON assets(sector);
CREATE INDEX idx_assets_geography ON assets(geography);
CREATE INDEX idx_assets_valuation ON assets(valuation DESC);
CREATE INDEX idx_assets_search ON assets USING GIN(search_vector);
CREATE INDEX idx_assets_updated ON assets(updated_at DESC);

-- Private Equity specific fields
CREATE TABLE private_equity_details (
    asset_id VARCHAR(50) PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
    ebitda BIGINT,
    ebitda_margin DECIMAL(10, 6),
    debt_to_ebitda DECIMAL(10, 4),
    working_capital BIGINT,
    last_round VARCHAR(100), -- Series A, B, C, Buyout, etc.
    last_round_date DATE,
    last_round_valuation BIGINT,
    enterprise_value BIGINT,
    investors TEXT[] DEFAULT '{}',
    exit_strategy VARCHAR(200),
    hold_period_months INTEGER
);

-- Venture Capital specific fields
CREATE TABLE venture_capital_details (
    asset_id VARCHAR(50) PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
    stage VARCHAR(100), -- Seed, Series A, B, C, etc.
    arr BIGINT,
    mrr BIGINT,
    growth_rate DECIMAL(10, 6),
    burn_rate BIGINT,
    runway_months INTEGER,
    ltv_cac DECIMAL(10, 4),
    nrr DECIMAL(10, 6), -- Net Revenue Retention
    team_size INTEGER,
    investors TEXT[] DEFAULT '{}',
    lead_investor VARCHAR(255),
    funding_date DATE,
    pre_money_valuation BIGINT,
    post_money_valuation BIGINT
);

-- Real Estate specific fields
CREATE TABLE real_estate_details (
    asset_id VARCHAR(50) PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
    property_type VARCHAR(100), -- Office, Retail, Industrial, Multifamily, etc.
    noi BIGINT, -- Net Operating Income
    cap_rate DECIMAL(10, 6),
    occupancy_rate DECIMAL(10, 6),
    lease_term_years DECIMAL(10, 2),
    square_feet INTEGER,
    price_per_sqft DECIMAL(10, 2),
    year_built INTEGER,
    property_class VARCHAR(10), -- A, B, C
    tenants TEXT[] DEFAULT '{}',
    major_tenant VARCHAR(255),
    dscr DECIMAL(10, 4), -- Debt Service Coverage Ratio
    ltv DECIMAL(10, 6), -- Loan to Value
    months_vacant INTEGER,
    renewal_rate DECIMAL(10, 6)
);

-- ==================== VALUATION METHODOLOGY ====================

CREATE TABLE valuation_methodology (
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,

    -- Comparable Companies Analysis
    cca_value BIGINT,
    cca_weight DECIMAL(5, 4),
    cca_multiple DECIMAL(10, 4),
    cca_methodology JSONB, -- Details of comparables used

    -- Precedent Transactions
    precedent_value BIGINT,
    precedent_weight DECIMAL(5, 4),
    precedent_multiple DECIMAL(10, 4),
    precedent_methodology JSONB,

    -- Discounted Cash Flow
    dcf_value BIGINT,
    dcf_weight DECIMAL(5, 4),
    dcf_wacc DECIMAL(10, 6),
    dcf_methodology JSONB, -- Assumptions, projections

    -- Alternative Data Impact
    alt_data_value BIGINT,
    alt_data_weight DECIMAL(5, 4),
    alt_data_signal DECIMAL(10, 6),

    -- Final blended valuation
    blended_valuation BIGINT,
    confidence_score INTEGER, -- 0-100

    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

CREATE INDEX idx_valuation_asset ON valuation_methodology(asset_id);
CREATE INDEX idx_valuation_date ON valuation_methodology(calculated_at DESC);

CREATE TABLE comparable_companies (
    id BIGSERIAL PRIMARY KEY,
    valuation_id BIGINT REFERENCES valuation_methodology(id) ON DELETE CASCADE,
    comp_name VARCHAR(500) NOT NULL,
    comp_revenue BIGINT,
    comp_multiple DECIMAL(10, 4),
    similarity_score INTEGER, -- 0-100
    sector VARCHAR(200),
    geography VARCHAR(200),
    data_source VARCHAR(200),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ALTERNATIVE DATA ====================

CREATE TABLE alternative_data (
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,

    -- Satellite imagery data
    satellite_data JSONB, -- {delta: 0.05, quality: 'excellent', vehicles: 42}
    satellite_last_update TIMESTAMP WITH TIME ZONE,

    -- Credit data
    credit_data JSONB, -- {score: 710, trend: 'stable', paydex: 78}
    credit_last_update TIMESTAMP WITH TIME ZONE,

    -- UCC filings
    ucc_data JSONB, -- {filings: 2, secured_amount: 1200000}
    ucc_last_update TIMESTAMP WITH TIME ZONE,

    -- Fleet tracking
    fleet_data JSONB, -- {vehicles: 12, utilization: 0.87}
    fleet_last_update TIMESTAMP WITH TIME ZONE,

    -- Web scraping (job postings, reviews, sentiment)
    web_data JSONB, -- {job_postings: 5, rating: 4.1, sentiment: 0.42}
    web_last_update TIMESTAMP WITH TIME ZONE,

    -- Social media signals
    social_data JSONB,
    social_last_update TIMESTAMP WITH TIME ZONE,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE (asset_id)
);

CREATE INDEX idx_alt_data_asset ON alternative_data(asset_id);

-- ==================== DATA QUALITY TRACKING ====================

CREATE TABLE data_quality (
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,

    -- Source freshness (0-100 score for each)
    financial_score INTEGER DEFAULT 0,
    satellite_score INTEGER DEFAULT 0,
    credit_score INTEGER DEFAULT 0,
    web_score INTEGER DEFAULT 0,

    -- Overall quality
    overall_score INTEGER GENERATED ALWAYS AS (
        (COALESCE(financial_score, 0) +
         COALESCE(satellite_score, 0) +
         COALESCE(credit_score, 0) +
         COALESCE(web_score, 0)) / 4
    ) STORED,

    last_financial_update TIMESTAMP WITH TIME ZONE,
    last_satellite_update TIMESTAMP WITH TIME ZONE,
    last_credit_update TIMESTAMP WITH TIME ZONE,
    last_web_update TIMESTAMP WITH TIME ZONE,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE (asset_id)
);

CREATE INDEX idx_quality_asset ON data_quality(asset_id);
CREATE INDEX idx_quality_score ON data_quality(overall_score DESC);

-- ==================== HISTORICAL DATA ====================

CREATE TABLE valuation_history (
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    valuation BIGINT NOT NULL,
    revenue BIGINT,
    key_metrics JSONB,
    change_reason TEXT,
    data_source VARCHAR(200),

    UNIQUE (asset_id, date)
);

CREATE INDEX idx_history_asset_date ON valuation_history(asset_id, date DESC);

CREATE TABLE metric_snapshots (
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
    snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL,
    metrics JSONB NOT NULL
);

CREATE INDEX idx_snapshots_asset_date ON metric_snapshots(asset_id, snapshot_date DESC);

-- ==================== MARKET DATA ====================

CREATE TABLE market_indices (
    id BIGSERIAL PRIMARY KEY,
    index_type VARCHAR(100) NOT NULL, -- pe_index, vc_index, re_index
    date DATE NOT NULL,
    value DECIMAL(15, 4) NOT NULL,
    change_percent DECIMAL(10, 6),
    market_cap BIGINT,
    deal_count INTEGER,

    UNIQUE (index_type, date)
);

CREATE INDEX idx_indices_type_date ON market_indices(index_type, date DESC);

CREATE TABLE deal_flow (
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE SET NULL,
    deal_type VARCHAR(100), -- acquisition, funding, ipo, merger
    deal_date DATE NOT NULL,
    deal_value BIGINT,
    acquirer VARCHAR(500),
    target VARCHAR(500),
    sector VARCHAR(200),
    geography VARCHAR(200),
    source VARCHAR(200),
    source_url TEXT
);

CREATE INDEX idx_deals_date ON deal_flow(deal_date DESC);
CREATE INDEX idx_deals_type ON deal_flow(deal_type);
CREATE INDEX idx_deals_sector ON deal_flow(sector);

-- ==================== USER FEATURES ====================

CREATE TABLE watchlist (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE (user_id, asset_id)
);

CREATE INDEX idx_watchlist_user ON watchlist(user_id, added_at DESC);

CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
    alert_type VARCHAR(100), -- valuation_change, data_update, deal_flow
    condition JSONB, -- {threshold: 10, operator: '>'}
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_active ON alerts(user_id, is_active);

CREATE TABLE saved_searches (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    filters JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);

CREATE TABLE exports (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    export_type VARCHAR(50), -- pdf, csv, xlsx
    asset_ids TEXT[],
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_exports_user ON exports(user_id, created_at DESC);

-- ==================== DATA SOURCES ====================

CREATE TABLE data_sources (
    id BIGSERIAL PRIMARY KEY,
    source_name VARCHAR(200) NOT NULL UNIQUE,
    source_type VARCHAR(100), -- api, scraper, manual, webhook
    status VARCHAR(50), -- active, inactive, error
    last_sync TIMESTAMP WITH TIME ZONE,
    next_sync TIMESTAMP WITH TIME ZONE,
    sync_frequency_minutes INTEGER,
    error_message TEXT,
    config JSONB
);

CREATE INDEX idx_sources_status ON data_sources(status);
CREATE INDEX idx_sources_next_sync ON data_sources(next_sync);

CREATE TABLE data_sync_log (
    id BIGSERIAL PRIMARY KEY,
    source_id BIGINT REFERENCES data_sources(id) ON DELETE CASCADE,
    sync_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_completed_at TIMESTAMP WITH TIME ZONE,
    records_processed INTEGER,
    records_updated INTEGER,
    records_failed INTEGER,
    status VARCHAR(50), -- success, partial, failed
    error_details TEXT
);

CREATE INDEX idx_sync_log_source_date ON data_sync_log(source_id, sync_started_at DESC);

-- ==================== SUBSCRIPTIONS & BILLING ====================

CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan VARCHAR(100) NOT NULL, -- professional, enterprise
    status VARCHAR(50), -- active, canceled, past_due
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE TABLE usage_tracking (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100), -- api_call, export, search
    count INTEGER DEFAULT 1,
    date DATE NOT NULL,

    UNIQUE (user_id, action, date)
);

CREATE INDEX idx_usage_user_date ON usage_tracking(user_id, date DESC);

-- ==================== FUNCTIONS & TRIGGERS ====================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alt_data_updated_at BEFORE UPDATE ON alternative_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== VIEWS ====================

-- Portfolio summary view
CREATE VIEW user_portfolio_summary AS
SELECT
    w.user_id,
    a.type,
    COUNT(*) as asset_count,
    SUM(a.valuation) as total_valuation,
    AVG(a.valuation_change_30d) as avg_30d_change,
    AVG(dq.overall_score) as avg_data_quality
FROM watchlist w
JOIN assets a ON w.asset_id = a.id
LEFT JOIN data_quality dq ON a.id = dq.asset_id
GROUP BY w.user_id, a.type;

-- Market overview view
CREATE VIEW market_overview AS
SELECT
    type,
    COUNT(*) as total_assets,
    SUM(valuation) as total_market_cap,
    AVG(valuation) as avg_valuation,
    AVG(valuation_change_30d) as avg_30d_change,
    AVG(data_quality_score) as avg_data_quality
FROM assets
WHERE updated_at > NOW() - INTERVAL '30 days'
GROUP BY type;

-- ==================== INDEXES FOR PERFORMANCE ====================

-- Additional composite indexes for common queries
CREATE INDEX idx_assets_type_sector ON assets(type, sector);
CREATE INDEX idx_assets_type_geo ON assets(type, geography);
CREATE INDEX idx_assets_val_range ON assets(valuation) WHERE valuation > 0;

-- ==================== SAMPLE DATA INSERTION ====================

-- This would typically be done through the application, but here's an example
/*
INSERT INTO assets (id, type, name, sector, geography, revenue, valuation, metrics, description)
VALUES
('PE-001', 'private-equity', 'TechVentures Portfolio Co.', 'SaaS', 'North America',
 45000000, 125000000,
 '{"arr": 38000000, "growth_rate": 0.87, "ltv_cac": 4.2}'::jsonb,
 'Leading B2B SaaS platform for enterprise resource planning');
*/
