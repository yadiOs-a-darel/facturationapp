CREATE TABLE `attachments` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`resource` varchar(64) NOT NULL,
	`resource_id` varchar(191) NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`url` varchar(512) NOT NULL,
	`mime_type` varchar(128),
	`created_at` datetime NOT NULL,
	CONSTRAINT `attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`user_id` varchar(191),
	`action` varchar(64) NOT NULL,
	`resource` varchar(64) NOT NULL,
	`resource_id` varchar(191),
	`old_data` text,
	`new_data` text,
	`ip_address` varchar(64),
	`created_at` datetime NOT NULL,
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(64),
	`parent_id` varchar(191),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`code` varchar(64) NOT NULL,
	`type` varchar(32) NOT NULL DEFAULT 'RETAIL',
	`denomination` varchar(255) NOT NULL,
	`contact_name` varchar(255),
	`email` varchar(255),
	`phone` varchar(32),
	`phone2` varchar(32),
	`address` varchar(255),
	`city` varchar(128),
	`wilaya` varchar(128),
	`country` varchar(8) DEFAULT 'DZ',
	`tax_number` varchar(64),
	`discount_rate` double DEFAULT 0,
	`credit_limit` double DEFAULT 0,
	`payment_term_days` int DEFAULT 30,
	`currency` varchar(8) DEFAULT 'DZD',
	`is_active` boolean NOT NULL DEFAULT true,
	`notes` text,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`date` datetime NOT NULL,
	`method` varchar(64),
	`reference` varchar(255),
	`notes` text,
	`created_at` datetime NOT NULL,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` varchar(191) NOT NULL,
	`invoice_id` varchar(191) NOT NULL,
	`product_id` varchar(191),
	`description` varchar(255) NOT NULL,
	`quantity` double NOT NULL,
	`unit` varchar(32) DEFAULT 'pcs',
	`unit_price` decimal(10,2) NOT NULL,
	`discount_rate` double DEFAULT 0,
	`tax_rate` double DEFAULT 19,
	`total_ht` decimal(12,2) NOT NULL,
	`total_ttc` decimal(12,2) NOT NULL,
	`order_index` int DEFAULT 0,
	CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`customer_id` varchar(191) NOT NULL,
	`created_by_id` varchar(191),
	`number` varchar(64) NOT NULL,
	`type` varchar(32) NOT NULL DEFAULT 'INVOICE',
	`issue_date` datetime NOT NULL,
	`due_date` datetime,
	`delivery_date` datetime,
	`status` varchar(32) NOT NULL DEFAULT 'DRAFT',
	`subtotal_ht` decimal(12,2) NOT NULL DEFAULT '0',
	`discount_amount` decimal(12,2) NOT NULL DEFAULT '0',
	`discount_rate` double DEFAULT 0,
	`tax_amount` decimal(12,2) NOT NULL DEFAULT '0',
	`total_ttc` decimal(12,2) NOT NULL DEFAULT '0',
	`paid_amount` decimal(12,2) NOT NULL DEFAULT '0',
	`payment_method` varchar(64),
	`payment_date` datetime,
	`payment_ref` varchar(255),
	`notes` text,
	`internal_notes` text,
	`terms` text,
	`is_backdated` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `numbering_config` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`document_type` varchar(64) NOT NULL,
	`prefix` varchar(64) NOT NULL,
	`current_number` int NOT NULL DEFAULT 0,
	`padding` int NOT NULL DEFAULT 4,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `numbering_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`code` varchar(64) NOT NULL,
	`label` varchar(255) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` varchar(191) NOT NULL,
	`invoice_id` varchar(191) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`method` varchar(64) NOT NULL,
	`reference` varchar(255),
	`date` datetime NOT NULL,
	`notes` text,
	`created_at` datetime NOT NULL,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_price_history` (
	`id` varchar(191) NOT NULL,
	`product_id` varchar(191) NOT NULL,
	`old_price` decimal(10,2) NOT NULL,
	`new_price` decimal(10,2) NOT NULL,
	`changed_at` datetime NOT NULL,
	`changed_by_id` varchar(191),
	CONSTRAINT `product_price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`category_id` varchar(191),
	`code` varchar(64) NOT NULL,
	`barcode` varchar(64),
	`name` varchar(255) NOT NULL,
	`description` text,
	`unit` varchar(32) NOT NULL DEFAULT 'pcs',
	`purchase_price` decimal(10,2) NOT NULL DEFAULT '0',
	`selling_price` decimal(10,2) NOT NULL DEFAULT '0',
	`tax_rate` double DEFAULT 19,
	`discount_rate` double DEFAULT 0,
	`stock_quantity` double DEFAULT 0,
	`stock_min` double DEFAULT 0,
	`stock_max` double,
	`stock_location` varchar(255),
	`image` varchar(512),
	`is_active` boolean NOT NULL DEFAULT true,
	`is_service` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_order_items` (
	`id` varchar(191) NOT NULL,
	`purchase_order_id` varchar(191) NOT NULL,
	`product_id` varchar(191) NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` double NOT NULL,
	`received_qty` double DEFAULT 0,
	`unit_price` decimal(10,2) NOT NULL,
	`tax_rate` double DEFAULT 19,
	`total_ht` decimal(12,2) NOT NULL,
	CONSTRAINT `purchase_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`supplier_id` varchar(191) NOT NULL,
	`number` varchar(64) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'DRAFT',
	`order_date` datetime NOT NULL,
	`expected_date` datetime,
	`received_date` datetime,
	`subtotal_ht` decimal(12,2) NOT NULL DEFAULT '0',
	`tax_amount` decimal(12,2) NOT NULL DEFAULT '0',
	`total_ttc` decimal(12,2) NOT NULL DEFAULT '0',
	`notes` text,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `purchase_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`product_id` varchar(191) NOT NULL,
	`type` varchar(32) NOT NULL,
	`quantity` double NOT NULL,
	`unit_cost` decimal(10,2),
	`reason` varchar(255),
	`reference` varchar(255),
	`created_at` datetime NOT NULL,
	`created_by` varchar(191),
	CONSTRAINT `stock_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`plan` varchar(32) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'DZD',
	`start_date` datetime NOT NULL,
	`end_date` datetime NOT NULL,
	`status` varchar(32) NOT NULL,
	`payment_ref` varchar(255),
	`created_at` datetime NOT NULL,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`code` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`contact_name` varchar(255),
	`email` varchar(255),
	`phone` varchar(32),
	`address` varchar(255),
	`city` varchar(128),
	`tax_number` varchar(64),
	`payment_term_days` int DEFAULT 30,
	`is_active` boolean NOT NULL DEFAULT true,
	`notes` text,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`logo` varchar(512),
	`primary_color` varchar(32) DEFAULT '#1976d2',
	`secondary_color` varchar(32) DEFAULT '#ffffff',
	`font_family` varchar(128) DEFAULT 'Inter',
	`legal_name` varchar(255),
	`tax_number` varchar(64),
	`address` varchar(255),
	`city` varchar(128),
	`country` varchar(8) DEFAULT 'DZ',
	`phone` varchar(32),
	`email` varchar(255),
	`website` varchar(255),
	`plan` varchar(32) DEFAULT 'BASIC',
	`plan_status` varchar(32) DEFAULT 'TRIAL',
	`trial_ends_at` datetime,
	`subscription_ends_at` datetime,
	`max_users` int NOT NULL DEFAULT 3,
	`max_products` int NOT NULL DEFAULT 500,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(191) NOT NULL,
	`tenant_id` varchar(191) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`first_name` varchar(128) NOT NULL,
	`last_name` varchar(128) NOT NULL,
	`phone` varchar(32),
	`avatar` varchar(512),
	`role` varchar(32) NOT NULL DEFAULT 'CASHIER',
	`is_active` boolean NOT NULL DEFAULT true,
	`last_login_at` datetime,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
