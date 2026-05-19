-- Client facultatif sur les factures
ALTER TABLE invoices MODIFY customer_id VARCHAR(191) NULL;
