CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id VARCHAR(191) PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  token_hash VARCHAR(191) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_password_reset_user (user_id),
  INDEX idx_password_reset_hash (token_hash)
);
