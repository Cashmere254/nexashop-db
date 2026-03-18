-- ═══════════════════════════════════════════════════
-- NexaShop Seed Data | db/seed.sql
-- Run AFTER schema.sql
-- Run: psql -U nexashop_user -d nexashop -f db/seed.sql
-- ═══════════════════════════════════════════════════

-- Categories (5 rows)
INSERT INTO categories (name) VALUES
('Electronics'),('Clothing'),('Home & Garden'),('Sports'),('Books');

-- Products (500 rows)
INSERT INTO products (name, description, price, stock_qty, category_id)
SELECT
  'Product ' || i,
  'High-quality product number ' || i,
  ROUND((RANDOM()*9900+100)::NUMERIC, 2),
  (RANDOM()*500+50)::INT,
  (RANDOM()*4+1)::INT
FROM generate_series(1, 500) AS i;

-- Customers (10,000 rows)
INSERT INTO customers (first_name, last_name, email, phone, address)
SELECT
  'FirstName' || i,
  'LastName'  || i,
  'user' || i || '@nexashop.com',
  '+2547' || LPAD(i::TEXT, 8, '0'),
  i || ' Main Street, Nairobi'
FROM generate_series(1, 10000) AS i;

-- Orders (20,000 rows)
INSERT INTO orders (customer_id, status, total_amount, created_at)
SELECT
  (RANDOM()*9999+1)::INT,
  (ARRAY['pending','confirmed','shipped','delivered'])[floor(RANDOM()*4+1)::INT],
  ROUND((RANDOM()*49000+1000)::NUMERIC, 2),
  NOW() - (RANDOM()*INTERVAL '365 days')
FROM generate_series(1, 20000) AS i;

-- Order Items (50,000 rows)
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT
  (RANDOM()*19999+1)::INT,
  (RANDOM()*499+1)::INT,
  (RANDOM()*9+1)::INT,
  ROUND((RANDOM()*4900+100)::NUMERIC, 2)
FROM generate_series(1, 50000) AS i;

-- Payments (20,000 rows — one per order)
INSERT INTO payments (order_id, method, amount, status)
SELECT
  order_id,
  (ARRAY['card','mpesa','paypal','cash'])[floor(RANDOM()*4+1)::INT],
  total_amount,
  (ARRAY['completed','completed','pending','failed'])[floor(RANDOM()*4+1)::INT]
FROM orders;

-- ── Verify record counts ──────────────────────────
SELECT 'customers'   AS tbl, COUNT(*) FROM customers  UNION ALL
SELECT 'products',          COUNT(*) FROM products    UNION ALL
SELECT 'orders',            COUNT(*) FROM orders      UNION ALL
SELECT 'order_items',       COUNT(*) FROM order_items UNION ALL
SELECT 'payments',          COUNT(*) FROM payments;