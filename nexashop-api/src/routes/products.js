// src/routes/products.js

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── GET /api/products (paginated list) ───────────────
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve all products (paginated)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Array of product objects
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const { rows } = await db.query(
      'SELECT * FROM products ORDER BY product_id LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/products/:id ─────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM products WHERE product_id = $1', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/products ────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, description, price, stock_qty, category_id } = req.body;
    const { rows } = await db.query(
      `INSERT INTO products (name, description, price, stock_qty, category_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, price, stock_qty, category_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PUT /api/products/:id ─────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, stock_qty } = req.body;
    const { rows } = await db.query(
      `UPDATE products
       SET name=$1, description=$2, price=$3, stock_qty=$4
       WHERE product_id=$5 RETURNING *`,
      [name, description, price, stock_qty, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/products/:id ──────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM products WHERE product_id = $1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;