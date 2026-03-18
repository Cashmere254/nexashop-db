-- ═══════════════════════════════════════════════════
-- NexaShop Database Schema | db/schema.sql
-- Run: psql -U nexashop_user -d nexashop -f db/schema.sql
-- ═══════════════════════════════════════════════════

-- 1. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  customer_id  SERIAL PRIMARY KEY,
  first_name   VARCHAR(80)  NOT NULL,
  last_name    VARCHAR(80)  NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  phone        VARCHAR(20),
  address      TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_email      ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  category_id  SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  parent_id    INT REFERENCES categories(category_id)
);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  product_id   SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  price        NUMERIC(12,2) NOT NULL CHECK(price >= 0),
  stock_qty    INT NOT NULL DEFAULT 0 CHECK(stock_qty >= 0),
  category_id  INT REFERENCES categories(category_id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_name        ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price       ON products(price);

-- 4. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  order_id      SERIAL PRIMARY KEY,
  customer_id   INT NOT NULL REFERENCES customers(customer_id),
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK(status IN ('pending','confirmed','shipped','delivered','cancelled')),
  total_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at  ON orders(created_at);

-- 5. ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  item_id     SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id  INT NOT NULL REFERENCES products(product_id),
  quantity    INT NOT NULL CHECK(quantity > 0),
  unit_price  NUMERIC(12,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 6. INVENTORY_LOG
CREATE TABLE IF NOT EXISTS inventory_log (
  log_id      SERIAL PRIMARY KEY,
  product_id  INT NOT NULL REFERENCES products(product_id),
  change_qty  INT NOT NULL,
  reason      VARCHAR(200),
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inv_log_product_id ON inventory_log(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_log_changed_at ON inventory_log(changed_at);

-- 7. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  payment_id  SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(order_id),
  method      VARCHAR(50) NOT NULL
              CHECK(method IN ('card','mpesa','paypal','cash')),
  amount      NUMERIC(14,2) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
              CHECK(status IN ('pending','completed','failed','refunded')),
  paid_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status   ON payments(status);