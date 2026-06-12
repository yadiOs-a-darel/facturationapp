-- Idempotent : ignore si la colonne existe déjà
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'invoices'
    AND COLUMN_NAME = 'customer_name'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE invoices ADD COLUMN customer_name VARCHAR(255) NULL AFTER customer_id',
  'SELECT ''customer_name déjà présente'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
