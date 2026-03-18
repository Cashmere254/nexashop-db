// src/db.js | PostgreSQL connection pool

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:                    process.env.DB_HOST,
  port:                    process.env.DB_PORT,
  database:                process.env.DB_NAME,
  user:                    process.env.DB_USER,
  password:                process.env.DB_PASSWORD,
  max:                     20,    // max concurrent connections
  idleTimeoutMillis:       30000, // close idle connections after 30s
  connectionTimeoutMillis: 2000,  // fail fast if pool is exhausted
});

// Health check — logs connection errors without crashing the server
pool.on('error', (err) => {
  console.error('Unexpected pool error:', err.message);
});

module.exports = { query: (text, params) => pool.query(text, params) };