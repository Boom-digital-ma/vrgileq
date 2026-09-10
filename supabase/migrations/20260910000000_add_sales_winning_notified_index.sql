CREATE INDEX IF NOT EXISTS idx_sales_winning_notified
  ON sales(winning_notified)
  WHERE winning_notified = false;
