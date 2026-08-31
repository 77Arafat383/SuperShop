-- Sales & Inventory Tracking System (RBMS) - PostgreSQL Schema
-- Based on Class Diagram and ERD from NSTU CSTE 3208 Project Report

-- 1. USERS & AUTHENTICATION TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'Inventory Manager', 'Purchase Manager', 'Cashier')),
    requested_role VARCHAR(50) CHECK (requested_role IN ('Administrator', 'Inventory Manager', 'Purchase Manager', 'Cashier')),
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Pending Approval', 'Inactive', 'Suspended')),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'Layers'
);

-- 3. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    payment_terms VARCHAR(100) DEFAULT 'Net 30',
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    total_purchased DECIMAL(12, 2) DEFAULT 0.00,
    total_paid DECIMAL(12, 2) DEFAULT 0.00,
    total_due DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
    brand VARCHAR(100),
    purchase_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(5, 2) DEFAULT 0.00, -- Percentage discount or fixed
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 5,
    unit VARCHAR(50) DEFAULT 'pcs',
    supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE SET NULL,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SUPPLIER_PRODUCTS TABLE (Which products are supplied by which supplier with unit pricing)
CREATE TABLE IF NOT EXISTS supplier_products (
    supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    supplier_price DECIMAL(12, 2) NOT NULL,
    min_order_quantity INTEGER DEFAULT 1,
    PRIMARY KEY (supplier_id, product_id)
);

-- 6. SALES TABLE
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    cashier_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    cashier_name VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
    customer_phone VARCHAR(50),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5, 2) DEFAULT 5.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) NOT NULL,
    change_amount DECIMAL(12, 2) DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('Cash', 'bKash', 'Nagad', 'Card', 'Split')),
    payment_details JSONB,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Completed' CHECK (status IN ('Completed', 'Refunded', 'Cancelled')),
    notes TEXT
);

-- 7. SALE_ITEMS TABLE
CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR(64) PRIMARY KEY,
    sale_id VARCHAR(64) REFERENCES sales(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100),
    sku VARCHAR(100),
    unit_price DECIMAL(12, 2) NOT NULL,
    discount DECIMAL(12, 2) DEFAULT 0.00,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    cost_price DECIMAL(12, 2) NOT NULL
);

-- 8. PURCHASE_ORDERS TABLE
CREATE TABLE IF NOT EXISTS purchase_orders (
    id VARCHAR(64) PRIMARY KEY,
    po_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE RESTRICT,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_phone VARCHAR(50),
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    due_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Requested', 'Accepted', 'Received', 'Cancelled')),
    payment_status VARCHAR(20) DEFAULT 'Due' CHECK (payment_status IN ('Paid', 'Partial', 'Due')),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    received_date TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255) NOT NULL,
    notes TEXT
);

-- 9. PURCHASE_ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id VARCHAR(64) PRIMARY KEY,
    purchase_id VARCHAR(64) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    unit_cost DECIMAL(12, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL
);

-- 10. PURCHASE_PAYMENT_RECORDS TABLE (Ledger for payments against purchase orders/suppliers)
CREATE TABLE IF NOT EXISTS purchase_payment_records (
    id VARCHAR(64) PRIMARY KEY,
    purchase_id VARCHAR(64) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE CASCADE,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    amount_paid DECIMAL(12, 2) NOT NULL,
    previous_due DECIMAL(12, 2) NOT NULL,
    remaining_due DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('Cash', 'bKash', 'Nagad', 'Bank Transfer')),
    transaction_ref VARCHAR(100),
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    notes TEXT,
    recorded_by VARCHAR(255) NOT NULL
);

-- 11. STOCK_ADJUSTMENTS TABLE (Stock in, Stock out, Corrections)
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    adjustment_type VARCHAR(50) NOT NULL CHECK (adjustment_type IN ('Stock In', 'Stock Out', 'Correction')),
    quantity_before INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reason TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    adjusted_by VARCHAR(255) NOT NULL
);

-- 12. PRODUCT_RETURNS TABLE
CREATE TABLE IF NOT EXISTS product_returns (
    id VARCHAR(64) PRIMARY KEY,
    return_number VARCHAR(100) UNIQUE NOT NULL,
    sale_id VARCHAR(64) REFERENCES sales(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    refund_amount DECIMAL(12, 2) NOT NULL,
    reason TEXT NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_by VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Approved' CHECK (status IN ('Approved', 'Pending', 'Rejected'))
);

-- INDEXES for fast lookup
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchase_orders(supplier_id);
