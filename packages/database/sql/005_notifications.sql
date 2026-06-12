CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(191) PRIMARY KEY,
  tenant_id VARCHAR(191) NOT NULL,
  recipient_id VARCHAR(191) NOT NULL,
  sender_id VARCHAR(191) NULL,
  type VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_notifications_recipient (recipient_id, created_at),
  INDEX idx_notifications_tenant (tenant_id)
);
