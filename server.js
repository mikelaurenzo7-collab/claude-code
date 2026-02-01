// server.js - Main Express Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const Redis = require('ioredis');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connections
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const redis = new Redis(process.env.REDIS_URL);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

// ==================== AUTHENTICATION ====================

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Permission middleware
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const { rows } = await db.query(
      'SELECT permissions FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (!rows[0] || !rows[0].permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, tier: user.tier },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log activity
    await db.query(
      'INSERT INTO user_activity (user_id, action, ip_address) VALUES ($1, $2, $3)',
      [user.id, 'login', req.ip]
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        firm: user.firm,
        tier: user.tier,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ASSET ENDPOINTS ====================

// Get all assets (with filtering, pagination)
app.get('/api/assets', authenticateToken, async (req, res) => {
  try {
    const {
      type,          // private-equity, venture-capital, real-estate
      sector,
      geography,
      minValuation,
      maxValuation,
      page = 1,
      limit = 50,
      sortBy = 'valuation',
      sortOrder = 'DESC'
    } = req.query;

    // Check cache first
    const cacheKey = `assets:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    let query = `
      SELECT
        a.*,
        dq.score as data_quality_score,
        vm.methodology,
        COALESCE(ad.alternative_data, '{}'::jsonb) as alt_data
      FROM assets a
      LEFT JOIN data_quality dq ON a.id = dq.asset_id
      LEFT JOIN valuation_methodology vm ON a.id = vm.asset_id
      LEFT JOIN alternative_data ad ON a.id = ad.asset_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (type) {
      query += ` AND a.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (sector) {
      query += ` AND a.sector = $${paramCount}`;
      params.push(sector);
      paramCount++;
    }

    if (geography) {
      query += ` AND a.geography ILIKE $${paramCount}`;
      params.push(`%${geography}%`);
      paramCount++;
    }

    if (minValuation) {
      query += ` AND a.valuation >= $${paramCount}`;
      params.push(minValuation);
      paramCount++;
    }

    if (maxValuation) {
      query += ` AND a.valuation <= $${paramCount}`;
      params.push(maxValuation);
      paramCount++;
    }

    query += ` ORDER BY a.${sortBy} ${sortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, (page - 1) * limit);

    const { rows } = await db.query(query, params);

    // Get total count for pagination
    const countQuery = query.split('ORDER BY')[0].replace('SELECT a.*', 'SELECT COUNT(*)');
    const { rows: countRows } = await db.query(countQuery, params.slice(0, -2));

    const result = {
      assets: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countRows[0].count),
        pages: Math.ceil(countRows[0].count / limit)
      }
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(result));

    res.json(result);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single asset details
app.get('/api/assets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(`
      SELECT
        a.*,
        dq.score as data_quality_score,
        dq.last_updated as data_last_updated,
        vm.methodology,
        vm.comparable_companies,
        ad.alternative_data,
        ad.satellite_data,
        ad.credit_data,
        ad.web_data,
        json_agg(DISTINCT jsonb_build_object(
          'date', vh.date,
          'valuation', vh.valuation,
          'change_reason', vh.change_reason
        )) as valuation_history
      FROM assets a
      LEFT JOIN data_quality dq ON a.id = dq.asset_id
      LEFT JOIN valuation_methodology vm ON a.id = vm.asset_id
      LEFT JOIN alternative_data ad ON a.id = ad.asset_id
      LEFT JOIN valuation_history vh ON a.id = vh.asset_id
      WHERE a.id = $1
      GROUP BY a.id, dq.score, dq.last_updated, vm.methodology,
               vm.comparable_companies, ad.alternative_data,
               ad.satellite_data, ad.credit_data, ad.web_data
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Log view activity
    await db.query(
      'INSERT INTO user_activity (user_id, action, asset_id) VALUES ($1, $2, $3)',
      [req.user.userId, 'view_asset', id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== MARKET DATA ====================

app.get('/api/market/overview', authenticateToken, async (req, res) => {
  try {
    // Check cache
    const cached = await redis.get('market:overview');
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const [indices, dealFlow, marketCap] = await Promise.all([
      // Calculate indices
      db.query(`
        SELECT
          type,
          AVG(valuation_change_30d) as avg_change
        FROM assets
        WHERE updated_at > NOW() - INTERVAL '30 days'
        GROUP BY type
      `),

      // Deal flow
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as this_week,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '14 days'
                           AND created_at <= NOW() - INTERVAL '7 days') as last_week,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as this_month
        FROM assets
      `),

      // Market cap by type
      db.query(`
        SELECT
          type,
          SUM(valuation) as total_valuation
        FROM assets
        GROUP BY type
      `)
    ]);

    const result = {
      indices: {
        privateEquityIndex: {
          value: 2847, // Would be calculated from historical data
          change: indices.rows.find(r => r.type === 'private-equity')?.avg_change || 0
        },
        realEstateIndex: {
          value: 1523,
          change: indices.rows.find(r => r.type === 'real-estate')?.avg_change || 0
        },
        ventureIndex: {
          value: 3621,
          change: indices.rows.find(r => r.type === 'venture-capital')?.avg_change || 0
        }
      },
      dealFlow: dealFlow.rows[0],
      marketCap: {
        total: marketCap.rows.reduce((sum, row) => sum + parseFloat(row.total_valuation), 0),
        byType: marketCap.rows.reduce((acc, row) => {
          acc[row.type] = parseFloat(row.total_valuation);
          return acc;
        }, {})
      }
    };

    // Cache for 10 minutes
    await redis.setex('market:overview', 600, JSON.stringify(result));

    res.json(result);
  } catch (error) {
    console.error('Market overview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== SEARCH ====================

app.get('/api/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query too short' });
    }

    const { rows } = await db.query(`
      SELECT
        id, name, type, sector, geography, valuation,
        ts_rank(search_vector, plainto_tsquery('english', $1)) as rank
      FROM assets
      WHERE search_vector @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT 20
    `, [q]);

    res.json({ results: rows });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== WATCHLIST ====================

app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT a.*, w.added_at, w.notes
      FROM watchlist w
      JOIN assets a ON w.asset_id = a.id
      WHERE w.user_id = $1
      ORDER BY w.added_at DESC
    `, [req.user.userId]);

    res.json({ watchlist: rows });
  } catch (error) {
    console.error('Watchlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const { assetId, notes } = req.body;

    const { rows } = await db.query(`
      INSERT INTO watchlist (user_id, asset_id, notes)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, asset_id) DO UPDATE SET notes = $3
      RETURNING *
    `, [req.user.userId, assetId, notes]);

    res.json(rows[0]);
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== WEBHOOKS (for data updates) ====================

app.post('/webhooks/data-update', async (req, res) => {
  // Verify webhook signature
  const signature = req.headers['x-webhook-signature'];
  if (signature !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const { assetId, dataType, newData } = req.body;

    // Update asset data
    await db.query(`
      UPDATE alternative_data
      SET ${dataType} = $1, updated_at = NOW()
      WHERE asset_id = $2
    `, [newData, assetId]);

    // Invalidate cache
    await redis.del(`asset:${assetId}`);

    // Trigger valuation recalculation
    // This would be handled by a background job

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ANALYTICS ====================

app.get('/api/analytics/portfolio', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        a.type,
        COUNT(*) as count,
        SUM(a.valuation) as total_valuation,
        AVG(a.valuation_change_30d) as avg_change
      FROM watchlist w
      JOIN assets a ON w.asset_id = a.id
      WHERE w.user_id = $1
      GROUP BY a.type
    `, [req.user.userId]);

    res.json({ portfolio: rows });
  } catch (error) {
    console.error('Portfolio analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`Laurenzo Terminal API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await db.end();
  await redis.quit();
  process.exit(0);
});
