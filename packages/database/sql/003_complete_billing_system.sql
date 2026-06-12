-- Migration: système de facturation complet
-- Compatible MySQL 5.7+ / MariaDB (sans ADD COLUMN IF NOT EXISTS)

-- Colonne source_invoice_id
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'invoices'
    AND COLUMN_NAME = 'source_invoice_id'
);
SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE invoices ADD COLUMN source_invoice_id VARCHAR(191) NULL',
  'SELECT ''source_invoice_id déjà présent'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Colonne sent_at
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'invoices'
    AND COLUMN_NAME = 'sent_at'
);
SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE invoices ADD COLUMN sent_at DATETIME NULL',
  'SELECT ''sent_at déjà présent'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS recurring_invoices (
  id VARCHAR(191) PRIMARY KEY,
  tenant_id VARCHAR(191) NOT NULL,
  customer_id VARCHAR(191) NULL,
  label VARCHAR(255) NOT NULL,
  frequency VARCHAR(32) NOT NULL,
  next_run_at DATETIME NOT NULL,
  last_run_at DATETIME NULL,
  items_json TEXT NOT NULL,
  notes TEXT NULL,
  terms TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
