-- ═══════════════════════════════════════════════════
-- NexaShop Triggers | db/triggers.sql
-- Run: psql -U nexashop_user -d nexashop -f db/triggers.sql
-- ═══════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════
-- TRIGGER 1: Deduct inventory when order item inserted
-- Fires AFTER every INSERT on order_items
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trg_deduct_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- Step 1: Reduce stock
  UPDATE products
  SET stock_qty = stock_qty - NEW.quantity
  WHERE product_id = NEW.product_id;

  -- Step 2: Guard against negative stock
  IF (SELECT stock_qty FROM products WHERE product_id = NEW.product_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id;
  END IF;

  -- Step 3: Write audit log
  INSERT INTO inventory_log (product_id, change_qty, reason)
  VALUES (NEW.product_id, -NEW.quantity, 'Order item #' || NEW.item_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_order_item_insert
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION trg_deduct_inventory();

-- ═══════════════════════════════════════════════════
-- TRIGGER 2: Auto-update orders.updated_at on row change
-- Fires BEFORE every UPDATE on orders
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trg_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_order_update
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION trg_orders_updated_at();