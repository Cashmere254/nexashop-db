-- ═══════════════════════════════════════════════════
-- NexaShop Stored Procedures | db/procedures.sql
-- Run: psql -U nexashop_user -d nexashop -f db/procedures.sql
-- ═══════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════
-- PROCEDURE 1: Sales Summary by Date Range
-- Usage: SELECT * FROM get_sales_summary('2025-01-01', '2026-01-01');
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_sales_summary(
  p_start_date TIMESTAMPTZ,
  p_end_date   TIMESTAMPTZ
)
RETURNS TABLE (
  total_revenue   NUMERIC,
  order_count     BIGINT,
  avg_order_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(SUM(o.total_amount), 2) AS total_revenue,
    COUNT(o.order_id)             AS order_count,
    ROUND(AVG(o.total_amount), 2) AS avg_order_value
  FROM orders o
  WHERE o.status IN ('confirmed','shipped','delivered')
  AND   o.created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════
-- PROCEDURE 2: Top Products by Units Sold
-- Usage: SELECT * FROM get_top_products(10);
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_top_products(p_limit INT DEFAULT 10)
RETURNS TABLE (
  product_id   INT,
  product_name VARCHAR,
  units_sold   BIGINT,
  revenue      NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.product_id,
    p.name                              AS product_name,
    SUM(oi.quantity)                    AS units_sold,
    ROUND(SUM(oi.quantity*oi.unit_price), 2) AS revenue
  FROM order_items oi
  JOIN products p ON oi.product_id = p.product_id
  GROUP BY p.product_id, p.name
  ORDER BY units_sold DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;