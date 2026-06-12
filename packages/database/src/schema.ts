import {
  mysqlTable,
  varchar,
  int,
  double,
  datetime,
  boolean,
  text,
  decimal,
} from 'drizzle-orm/mysql-core';

// ===================== TENANT & USERS =====================

export const tenants = mysqlTable('tenants', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  logo: varchar('logo', { length: 512 }).default(null),
  primaryColor: varchar('primary_color', { length: 32 }),
  secondaryColor: varchar('secondary_color', { length: 32 }),
  fontFamily: varchar('font_family', { length: 128 }),
  legalName: varchar('legal_name', { length: 255 }).default(null),
  taxNumber: varchar('tax_number', { length: 64 }).default(null),
  address: varchar('address', { length: 255 }).default(null),
  city: varchar('city', { length: 128 }).default(null),
  country: varchar('country', { length: 8 }),
  phone: varchar('phone', { length: 32 }).default(null),
  email: varchar('email', { length: 255 }).default(null),
  website: varchar('website', { length: 255 }).default(null),
  plan: varchar('plan', { length: 32 }),
  planStatus: varchar('plan_status', { length: 32 }),
  trialEndsAt: datetime('trial_ends_at').default(null),
  subscriptionEndsAt: datetime('subscription_ends_at').default(null),
  licenseKey: varchar('license_key', { length: 191 }).unique(),
  licenseValidatedAt: datetime('license_validated_at').default(null),
  maxUsers: int('max_users').notNull(),
  maxProducts: int('max_products').notNull(),
  smtpHost: varchar('smtp_host', { length: 255 }),
  smtpPort: int('smtp_port'),
  smtpUser: varchar('smtp_user', { length: 255 }),
  smtpPass: varchar('smtp_pass', { length: 512 }),
  smtpFrom: varchar('smtp_from', { length: 255 }),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
});

export const users = mysqlTable('users', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 128 }).notNull(),
  lastName: varchar('last_name', { length: 128 }).notNull(),
  phone: varchar('phone', { length: 32 }).default(null),
  avatar: varchar('avatar', { length: 512 }).default(null),
  role: varchar('role', { length: 32 }).default('CASHIER').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: datetime('last_login_at').default(null),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
});

export const passwordResetTokens = mysqlTable('password_reset_tokens', {
  id: varchar('id', { length: 191 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  tokenHash: varchar('token_hash', { length: 191 }).notNull(),
  expiresAt: datetime('expires_at').notNull(),
  usedAt: datetime('used_at'),
  createdAt: datetime('created_at').notNull(),
});

export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  recipientId: varchar('recipient_id', { length: 191 }).notNull(),
  senderId: varchar('sender_id', { length: 191 }),
  type: varchar('type', { length: 32 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  readAt: datetime('read_at'),
  createdAt: datetime('created_at').notNull(),
});

// ===================== CUSTOMERS & SUPPLIERS =====================

export const customers = mysqlTable('customers', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  code: varchar('code', { length: 64 }).notNull(),
  type: varchar('type', { length: 32 }).default('RETAIL').notNull(),
  denomination: varchar('denomination', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 32 }),
  phone2: varchar('phone2', { length: 32 }),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 128 }),
  wilaya: varchar('wilaya', { length: 128 }),
  country: varchar('country', { length: 8 }).default('DZ'),
  taxNumber: varchar('tax_number', { length: 64 }),
  discountRate: double('discount_rate').default(0),
  creditLimit: double('credit_limit').default(0),
  paymentTermDays: int('payment_term_days').default(30),
  currency: varchar('currency', { length: 8 }).default('DZD'),
  isActive: boolean('is_active').default(true).notNull(),
  notes: text('notes'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
});

export const suppliers = mysqlTable('suppliers', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  code: varchar('code', { length: 64 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 32 }),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 128 }),
  taxNumber: varchar('tax_number', { length: 64 }),
  paymentTermDays: int('payment_term_days').default(30),
  isActive: boolean('is_active').default(true).notNull(),
  notes: text('notes'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
});

// ===================== PRODUCTS & STOCK =====================

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 64 }),
  parentId: varchar('parent_id', { length: 191 }),
});

export const products = mysqlTable('products', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  categoryId: varchar('category_id', { length: 191 }),
  code: varchar('code', { length: 64 }).notNull(),
  barcode: varchar('barcode', { length: 64 }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  unit: varchar('unit', { length: 32 }).default('pcs').notNull(),
  purchasePrice: decimal('purchase_price', { precision: 10, scale: 2 }).default('0').notNull(),
  sellingPrice: decimal('selling_price', { precision: 10, scale: 2 }).default('0').notNull(),
  taxRate: double('tax_rate').default(19),
  discountRate: double('discount_rate').default(0),
  stockQuantity: double('stock_quantity').default(0),
  stockMin: double('stock_min').default(0),
  stockMax: double('stock_max'),
  stockLocation: varchar('stock_location', { length: 255 }),
  image: varchar('image', { length: 512 }),
  isActive: boolean('is_active').default(true).notNull(),
  isService: boolean('is_service').default(false).notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
});

export const stockMovements = mysqlTable('stock_movements', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  productId: varchar('product_id', { length: 191 }).notNull(),
  type: varchar('type', { length: 32 }).notNull(), // IN, OUT, ADJUSTMENT, RETURN
  quantity: double('quantity').notNull(),
  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }),
  reason: varchar('reason', { length: 255 }),
  reference: varchar('reference', { length: 255 }),
  createdAt: datetime('created_at').notNull(),
  createdBy: varchar('created_by', { length: 191 }),
});

// ===================== INVOICING =====================

export const invoices = mysqlTable('invoices', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  customerId: varchar('customer_id', { length: 191 }),
  customerName: varchar('customer_name', { length: 255 }),
  createdById: varchar('created_by_id', { length: 191 }),
  number: varchar('number', { length: 64 }).notNull(),
  type: varchar('type', { length: 32 }).default('INVOICE').notNull(),
  issueDate: datetime('issue_date').notNull(),
  dueDate: datetime('due_date'),
  deliveryDate: datetime('delivery_date'),
  status: varchar('status', { length: 32 }).default('DRAFT').notNull(),
  subtotalHT: decimal('subtotal_ht', { precision: 12, scale: 2 }).default('0').notNull(),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  discountRate: double('discount_rate').default(0),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  totalTTC: decimal('total_ttc', { precision: 12, scale: 2 }).default('0').notNull(),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  paymentMethod: varchar('payment_method', { length: 64 }),
  paymentDate: datetime('payment_date'),
  paymentRef: varchar('payment_ref', { length: 255 }),
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  terms: text('terms'),
  isBackdated: boolean('is_backdated').default(false).notNull(),
  sourceInvoiceId: varchar('source_invoice_id', { length: 191 }),
  sentAt: datetime('sent_at'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
});

export const invoiceItems = mysqlTable('invoice_items', {
  id: varchar('id', { length: 191 }).primaryKey(),
  invoiceId: varchar('invoice_id', { length: 191 }).notNull(),
  productId: varchar('product_id', { length: 191 }),
  description: varchar('description', { length: 255 }).notNull(),
  quantity: double('quantity').notNull(),
  unit: varchar('unit', { length: 32 }).default('pcs'),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  discountRate: double('discount_rate').default(0),
  taxRate: double('tax_rate').default(19),
  totalHT: decimal('total_ht', { precision: 12, scale: 2 }).notNull(),
  totalTTC: decimal('total_ttc', { precision: 12, scale: 2 }).notNull(),
  order: int('order_index').default(0),
});

export const payments = mysqlTable('payments', {
  id: varchar('id', { length: 191 }).primaryKey(),
  invoiceId: varchar('invoice_id', { length: 191 }).notNull(),
  createdById: varchar('created_by_id', { length: 191 }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  method: varchar('method', { length: 64 }).notNull(),
  reference: varchar('reference', { length: 255 }),
  date: datetime('date').notNull(),
  notes: text('notes'),
  createdAt: datetime('created_at').notNull(),
});

// ===================== PURCHASE ORDERS & EXPENSES =====================

export const purchaseOrders = mysqlTable('purchase_orders', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  supplierId: varchar('supplier_id', { length: 191 }).notNull(),
  number: varchar('number', { length: 64 }).notNull(),
  status: varchar('status', { length: 32 }).default('DRAFT').notNull(),
  orderDate: datetime('order_date').notNull(),
  expectedDate: datetime('expected_date'),
  receivedDate: datetime('received_date'),
  subtotalHT: decimal('subtotal_ht', { precision: 12, scale: 2 }).default('0').notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  totalTTC: decimal('total_ttc', { precision: 12, scale: 2 }).default('0').notNull(),
  notes: text('notes'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
});

export const purchaseOrderItems = mysqlTable('purchase_order_items', {
  id: varchar('id', { length: 191 }).primaryKey(),
  purchaseOrderId: varchar('purchase_order_id', { length: 191 }).notNull(),
  productId: varchar('product_id', { length: 191 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  quantity: double('quantity').notNull(),
  receivedQty: double('received_qty').default(0),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  taxRate: double('tax_rate').default(19),
  totalHT: decimal('total_ht', { precision: 12, scale: 2 }).notNull(),
});

export const expenses = mysqlTable('expenses', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  createdById: varchar('created_by_id', { length: 191 }),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  date: datetime('date').notNull(),
  method: varchar('method', { length: 64 }),
  reference: varchar('reference', { length: 255 }),
  notes: text('notes'),
  createdAt: datetime('created_at').notNull(),
});

// ===================== SUBSCRIPTIONS & AUDIT =====================

export const subscriptions = mysqlTable('subscriptions', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  plan: varchar('plan', { length: 32 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 8 }).default('DZD').notNull(),
  startDate: datetime('start_date').notNull(),
  endDate: datetime('end_date').notNull(),
  status: varchar('status', { length: 32 }).notNull(),
  paymentRef: varchar('payment_ref', { length: 255 }),
  createdAt: datetime('created_at').notNull(),
});

export const auditLogs = mysqlTable('audit_logs', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  userId: varchar('user_id', { length: 191 }),
  action: varchar('action', { length: 64 }).notNull(),
  resource: varchar('resource', { length: 64 }).notNull(),
  resourceId: varchar('resource_id', { length: 191 }),
  oldData: text('old_data'),
  newData: text('new_data'),
  ipAddress: varchar('ip_address', { length: 64 }),
  createdAt: datetime('created_at').notNull(),
});

// ===================== PAYMENT METHODS, NUMBERING, ATTACHMENTS, PRICE HISTORY =====================

export const paymentMethods = mysqlTable('payment_methods', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  code: varchar('code', { length: 64 }).notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
});

export const numberingConfig = mysqlTable('numbering_config', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  documentType: varchar('document_type', { length: 64 }).notNull(),
  prefix: varchar('prefix', { length: 64 }).notNull(),
  currentNumber: int('current_number').default(0).notNull(),
  padding: int('padding').default(4).notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
});

export const attachments = mysqlTable('attachments', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  resource: varchar('resource', { length: 64 }).notNull(),
  resourceId: varchar('resource_id', { length: 191 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  url: varchar('url', { length: 512 }).notNull(),
  mimeType: varchar('mime_type', { length: 128 }),
  createdAt: datetime('created_at').notNull(),
});

export const productPriceHistory = mysqlTable('product_price_history', {
  id: varchar('id', { length: 191 }).primaryKey(),
  productId: varchar('product_id', { length: 191 }).notNull(),
  oldPrice: decimal('old_price', { precision: 10, scale: 2 }).notNull(),
  newPrice: decimal('new_price', { precision: 10, scale: 2 }).notNull(),
  changedAt: datetime('changed_at').notNull(),
  changedById: varchar('changed_by_id', { length: 191 }),
});

export const recurringInvoices = mysqlTable('recurring_invoices', {
  id: varchar('id', { length: 191 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 191 }).notNull(),
  customerId: varchar('customer_id', { length: 191 }),
  label: varchar('label', { length: 255 }).notNull(),
  frequency: varchar('frequency', { length: 32 }).notNull(),
  nextRunAt: datetime('next_run_at').notNull(),
  lastRunAt: datetime('last_run_at'),
  itemsJson: text('items_json').notNull(),
  notes: text('notes'),
  terms: text('terms'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
});

