// src/routes/reports.js

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── GET /api/reports/sales ────────────────────────────
/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Total sales summary for a date range
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: start
 *         schema: { type: string, example: '2025-01-01' }
 *       - in: query
 *         name: end
 *         schema: { type: string, example: '2026-01-01' }
 *     responses:
 *       200:
 *         description: Sales summary object
 */
router.get('/sales', async (req, res) => {
  try {
    const { start = '2025-01-01', end = '2026-12-31' } = req.query;
    const { rows } = await db.query(
      'SELECT * FROM get_sales_summary($1::TIMESTAMPTZ, $2::TIMESTAMPTZ)',
      [start, end]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/reports/top-products ─────────────────────
/**
 * @swagger
 * /api/reports/top-products:
 *   get:
 *     summary: Top N products by units sold
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Array of top products
 */
router.get('/top-products', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const { rows } = await db.query(
      'SELECT * FROM get_top_products($1)', [limit]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;