// src/routes/customers.js

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── GET /api/customers (paginated) ───────────────────
/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Retrieve all customers (paginated)
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Array of customer objects
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const { rows } = await db.query(
      'SELECT * FROM customers ORDER BY customer_id LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/customers/:id ────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM customers WHERE customer_id = $1', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/customers ───────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address } = req.body;
    const { rows } = await db.query(
      `INSERT INTO customers (first_name, last_name, email, phone, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [first_name, last_name, email, phone, address]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PUT /api/customers/:id ────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address } = req.body;
    const { rows } = await db.query(
      `UPDATE customers
       SET first_name=$1, last_name=$2, email=$3, phone=$4, address=$5
       WHERE customer_id=$6 RETURNING *`,
      [first_name, last_name, email, phone, address, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/customers/:id ─────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM customers WHERE customer_id = $1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;