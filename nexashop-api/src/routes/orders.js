// src/routes/orders.js

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── GET /api/orders (filter by status / date) ────────
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: List orders — filter by status or date range
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Array of order objects
 */
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query  = 'SELECT * FROM orders';
    let params = [];
    if (status) {
      query += ' WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params = [status, limit, offset];
    } else {
      query += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params = [limit, offset];
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/orders/:id ───────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM orders WHERE order_id = $1', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/orders (triggers fire automatically) ───
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Place a new order (inventory triggers fire automatically)
 *     tags: [Orders]
 *     responses:
 *       201:
 *         description: Created order object
 */
router.post('/', async (req, res) => {
  try {
    const { customer_id, status, total_amount } = req.body;
    const { rows } = await db.query(
      `INSERT INTO orders (customer_id, status, total_amount)
       VALUES ($1, $2, $3) RETURNING *`,
      [customer_id, status || 'pending', total_amount]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PUT /api/orders/:id ───────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { status, total_amount } = req.body;
    const { rows } = await db.query(
      `UPDATE orders
       SET status=$1, total_amount=$2, updated_at=NOW()
       WHERE order_id=$3 RETURNING *`,
      [status, total_amount, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;