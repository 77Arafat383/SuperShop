const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');
const { loadEnvConfig } = require('@next/env');
const { Pool } = require('pg');

loadEnvConfig(process.cwd());

const shouldApply = process.argv.includes('--apply');
const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');
const mockDataPath = path.join(process.cwd(), 'src', 'lib', 'mockData.ts');

function normalizeConnectionString(value) {
  const match = value.match(/^((?:postgres|postgresql):\/\/[^:/?#]+:)([^@]*)(@.+)$/);
  if (!match || !match[2]) {
    return value;
  }

  try {
    return `${match[1]}${encodeURIComponent(decodeURIComponent(match[2]))}${match[3]}`;
  } catch {
    return `${match[1]}${encodeURIComponent(match[2])}${match[3]}`;
  }
}

function loadMockData() {
  const source = fs
    .readFileSync(mockDataPath, 'utf8')
    .replace(/^import .* from '@\/types';\r?\n/, '');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;

  const mod = new Module(mockDataPath, module.parent);
  mod.filename = mockDataPath;
  mod.paths = Module._nodeModulePaths(path.dirname(mockDataPath));
  mod._compile(compiled, mockDataPath);
  return mod.exports;
}

function toJson(value) {
  return value == null ? null : JSON.stringify(value);
}

function itemId(prefix, parentId, index) {
  return `${prefix}_${parentId}_${index + 1}`;
}

async function upsert(client, sql, values) {
  await client.query(sql, values);
}

async function seed() {
  const connectionString = normalizeConnectionString(
    process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || ''
  );

  if (!connectionString) {
    throw new Error('No POSTGRES_URL, DATABASE_URL, or POSTGRES_PRISMA_URL found in .env');
  }

  const data = loadMockData();
  const productIds = new Set(data.INITIAL_PRODUCTS.map((product) => product.id));
  const supplierProductRows = data.INITIAL_SUPPLIERS.flatMap((supplier) =>
    supplier.suppliedProducts.map((suppliedProduct) => ({ supplier, suppliedProduct }))
  );
  const validSupplierProductRows = supplierProductRows.filter(({ suppliedProduct }) =>
    productIds.has(suppliedProduct.productId)
  );
  const skippedSupplierProducts = supplierProductRows.filter(({ suppliedProduct }) =>
    !productIds.has(suppliedProduct.productId)
  );
  const counts = {
    users: data.INITIAL_USERS.length,
    categories: data.INITIAL_CATEGORIES.length,
    suppliers: data.INITIAL_SUPPLIERS.length,
    products: data.INITIAL_PRODUCTS.length,
    supplierProducts: validSupplierProductRows.length,
    purchases: data.INITIAL_PURCHASES.length,
    purchaseItems: data.INITIAL_PURCHASES.reduce((sum, purchase) => sum + purchase.items.length, 0),
    purchasePayments: data.INITIAL_PURCHASES.reduce((sum, purchase) => sum + purchase.paymentHistory.length, 0),
    sales: data.INITIAL_SALES.length,
    saleItems: data.INITIAL_SALES.reduce((sum, sale) => sum + sale.items.length, 0),
    stockAdjustments: data.INITIAL_ADJUSTMENTS.length,
    returns: data.INITIAL_RETURNS.length,
  };

  console.log('Mock data ready:', counts);
  if (skippedSupplierProducts.length > 0) {
    console.warn(
      'Skipping supplier_products rows for missing products:',
      skippedSupplierProducts.map(({ suppliedProduct }) => suppliedProduct.productId)
    );
  }

  if (!shouldApply) {
    console.log('Dry run only. Run `npm run db:seed -- --apply` to write this data to the database.');
    return;
  }

  const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(fs.readFileSync(schemaPath, 'utf8'));

    for (const user of data.INITIAL_USERS) {
      await upsert(
        client,
        `INSERT INTO users (id, name, email, password_hash, role, requested_role, status, phone, created_at, last_login)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role,
           requested_role = EXCLUDED.requested_role, status = EXCLUDED.status,
           phone = EXCLUDED.phone, created_at = EXCLUDED.created_at, last_login = EXCLUDED.last_login`,
        [user.id, user.name, user.email, 'demo_password_not_set', user.role, user.requestedRole || null, user.status, user.phone || null, user.createdAt, user.lastLogin || null]
      );
    }

    for (const category of data.INITIAL_CATEGORIES) {
      await upsert(
        client,
        `INSERT INTO categories (id, name, description, icon)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon`,
        [category.id, category.name, category.description || null, category.icon || null]
      );
    }

    for (const supplier of data.INITIAL_SUPPLIERS) {
      await upsert(
        client,
        `INSERT INTO suppliers (id, name, contact_person, phone, email, address, payment_terms, status, total_purchased, total_paid, total_due, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, contact_person = EXCLUDED.contact_person, phone = EXCLUDED.phone,
           email = EXCLUDED.email, address = EXCLUDED.address, payment_terms = EXCLUDED.payment_terms,
           status = EXCLUDED.status, total_purchased = EXCLUDED.total_purchased,
           total_paid = EXCLUDED.total_paid, total_due = EXCLUDED.total_due, created_at = EXCLUDED.created_at`,
        [supplier.id, supplier.name, supplier.contactPerson, supplier.phone, supplier.email || null, supplier.address, supplier.paymentTerms || null, supplier.status, supplier.totalPurchased, supplier.totalPaid, supplier.totalDue, supplier.createdAt]
      );
    }

    for (const product of data.INITIAL_PRODUCTS) {
      await upsert(
        client,
        `INSERT INTO products (id, name, sku, barcode, description, category_id, brand, purchase_price, selling_price, discount, stock_quantity, min_stock_level, unit, supplier_id, image_url, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, sku = EXCLUDED.sku, barcode = EXCLUDED.barcode,
           description = EXCLUDED.description, category_id = EXCLUDED.category_id, brand = EXCLUDED.brand,
           purchase_price = EXCLUDED.purchase_price, selling_price = EXCLUDED.selling_price,
           discount = EXCLUDED.discount, stock_quantity = EXCLUDED.stock_quantity,
           min_stock_level = EXCLUDED.min_stock_level, unit = EXCLUDED.unit,
           supplier_id = EXCLUDED.supplier_id, image_url = EXCLUDED.image_url,
           status = EXCLUDED.status, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at`,
        [product.id, product.name, product.sku, product.barcode, product.description || null, product.categoryId || null, product.brand || null, product.purchasePrice, product.sellingPrice, product.discount || 0, product.stockQuantity, product.minStockLevel, product.unit || 'pcs', product.supplierId || null, product.imageUrl || null, product.status, product.createdAt, product.updatedAt]
      );
    }

    for (const { supplier, suppliedProduct } of validSupplierProductRows) {
      await upsert(
        client,
        `INSERT INTO supplier_products (supplier_id, product_id, supplier_price, min_order_quantity)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (supplier_id, product_id) DO UPDATE SET
           supplier_price = EXCLUDED.supplier_price, min_order_quantity = EXCLUDED.min_order_quantity`,
        [supplier.id, suppliedProduct.productId, suppliedProduct.supplierPrice, suppliedProduct.minOrderQuantity || 1]
      );
    }

    for (const purchase of data.INITIAL_PURCHASES) {
      await upsert(
        client,
        `INSERT INTO purchase_orders (id, po_number, supplier_id, supplier_name, supplier_phone, total_amount, paid_amount, due_amount, status, payment_status, order_date, received_date, created_by, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           po_number = EXCLUDED.po_number, supplier_id = EXCLUDED.supplier_id,
           supplier_name = EXCLUDED.supplier_name, supplier_phone = EXCLUDED.supplier_phone,
           total_amount = EXCLUDED.total_amount, paid_amount = EXCLUDED.paid_amount,
           due_amount = EXCLUDED.due_amount, status = EXCLUDED.status,
           payment_status = EXCLUDED.payment_status, order_date = EXCLUDED.order_date,
           received_date = EXCLUDED.received_date, created_by = EXCLUDED.created_by, notes = EXCLUDED.notes`,
        [purchase.id, purchase.poNumber, purchase.supplierId, purchase.supplierName, purchase.supplierPhone || null, purchase.totalAmount, purchase.paidAmount, purchase.dueAmount, purchase.status, purchase.paymentStatus, purchase.orderDate, purchase.receivedDate || null, purchase.createdBy, purchase.notes || null]
      );

      for (const [index, item] of purchase.items.entries()) {
        await upsert(
          client,
          `INSERT INTO purchase_order_items (id, purchase_id, product_id, product_name, sku, unit_cost, quantity, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             purchase_id = EXCLUDED.purchase_id, product_id = EXCLUDED.product_id,
             product_name = EXCLUDED.product_name, sku = EXCLUDED.sku,
             unit_cost = EXCLUDED.unit_cost, quantity = EXCLUDED.quantity, subtotal = EXCLUDED.subtotal`,
          [itemId('poi', purchase.id, index), purchase.id, item.productId || null, item.productName, item.sku || null, item.unitCost, item.quantity, item.subtotal]
        );
      }

      for (const payment of purchase.paymentHistory) {
        await upsert(
          client,
          `INSERT INTO purchase_payment_records (id, purchase_id, supplier_id, payment_date, amount_paid, previous_due, remaining_due, payment_method, transaction_ref, receipt_number, notes, recorded_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             purchase_id = EXCLUDED.purchase_id, supplier_id = EXCLUDED.supplier_id,
             payment_date = EXCLUDED.payment_date, amount_paid = EXCLUDED.amount_paid,
             previous_due = EXCLUDED.previous_due, remaining_due = EXCLUDED.remaining_due,
             payment_method = EXCLUDED.payment_method, transaction_ref = EXCLUDED.transaction_ref,
             receipt_number = EXCLUDED.receipt_number, notes = EXCLUDED.notes, recorded_by = EXCLUDED.recorded_by`,
          [payment.id, purchase.id, purchase.supplierId, payment.paymentDate, payment.amountPaid, payment.previousDue, payment.remainingDue, payment.paymentMethod, payment.transactionRef || null, payment.receiptNumber, payment.notes || null, payment.recordedBy]
        );
      }
    }

    for (const sale of data.INITIAL_SALES) {
      await upsert(
        client,
        `INSERT INTO sales (id, invoice_number, cashier_id, cashier_name, customer_name, customer_phone, subtotal, discount_total, tax_rate, tax_amount, total_amount, paid_amount, change_amount, payment_method, payment_details, sale_date, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16, $17, $18)
         ON CONFLICT (id) DO UPDATE SET
           invoice_number = EXCLUDED.invoice_number, cashier_id = EXCLUDED.cashier_id,
           cashier_name = EXCLUDED.cashier_name, customer_name = EXCLUDED.customer_name,
           customer_phone = EXCLUDED.customer_phone, subtotal = EXCLUDED.subtotal,
           discount_total = EXCLUDED.discount_total, tax_rate = EXCLUDED.tax_rate,
           tax_amount = EXCLUDED.tax_amount, total_amount = EXCLUDED.total_amount,
           paid_amount = EXCLUDED.paid_amount, change_amount = EXCLUDED.change_amount,
           payment_method = EXCLUDED.payment_method, payment_details = EXCLUDED.payment_details,
           sale_date = EXCLUDED.sale_date, status = EXCLUDED.status, notes = EXCLUDED.notes`,
        [sale.id, sale.invoiceNumber, sale.cashierId || null, sale.cashierName, sale.customerName || 'Walk-in Customer', sale.customerPhone || null, sale.subtotal, sale.discountTotal, sale.taxRate, sale.taxAmount, sale.totalAmount, sale.paidAmount, sale.changeAmount, sale.paymentMethod, toJson(sale.paymentDetails), sale.saleDate, sale.status, sale.notes || null]
      );

      for (const [index, item] of sale.items.entries()) {
        await upsert(
          client,
          `INSERT INTO sale_items (id, sale_id, product_id, product_name, barcode, sku, unit_price, discount, quantity, subtotal, cost_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             sale_id = EXCLUDED.sale_id, product_id = EXCLUDED.product_id,
             product_name = EXCLUDED.product_name, barcode = EXCLUDED.barcode,
             sku = EXCLUDED.sku, unit_price = EXCLUDED.unit_price,
             discount = EXCLUDED.discount, quantity = EXCLUDED.quantity,
             subtotal = EXCLUDED.subtotal, cost_price = EXCLUDED.cost_price`,
          [itemId('sai', sale.id, index), sale.id, item.productId || null, item.productName, item.barcode || null, item.sku || null, item.unitPrice, item.discount || 0, item.quantity, item.subtotal, item.costPrice]
        );
      }
    }

    for (const adjustment of data.INITIAL_ADJUSTMENTS) {
      await upsert(
        client,
        `INSERT INTO stock_adjustments (id, product_id, product_name, sku, adjustment_type, quantity_before, quantity_change, quantity_after, reason, date, adjusted_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           product_id = EXCLUDED.product_id, product_name = EXCLUDED.product_name,
           sku = EXCLUDED.sku, adjustment_type = EXCLUDED.adjustment_type,
           quantity_before = EXCLUDED.quantity_before, quantity_change = EXCLUDED.quantity_change,
           quantity_after = EXCLUDED.quantity_after, reason = EXCLUDED.reason,
           date = EXCLUDED.date, adjusted_by = EXCLUDED.adjusted_by`,
        [adjustment.id, adjustment.productId || null, adjustment.productName, adjustment.sku || null, adjustment.adjustmentType, adjustment.quantityBefore, adjustment.quantityChange, adjustment.quantityAfter, adjustment.reason, adjustment.date, adjustment.adjustedBy]
      );
    }

    for (const productReturn of data.INITIAL_RETURNS) {
      await upsert(
        client,
        `INSERT INTO product_returns (id, return_number, sale_id, invoice_number, product_id, product_name, quantity, unit_price, refund_amount, reason, return_date, processed_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           return_number = EXCLUDED.return_number, sale_id = EXCLUDED.sale_id,
           invoice_number = EXCLUDED.invoice_number, product_id = EXCLUDED.product_id,
           product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity,
           unit_price = EXCLUDED.unit_price, refund_amount = EXCLUDED.refund_amount,
           reason = EXCLUDED.reason, return_date = EXCLUDED.return_date,
           processed_by = EXCLUDED.processed_by, status = EXCLUDED.status`,
        [productReturn.id, productReturn.returnNumber, productReturn.saleId || null, productReturn.invoiceNumber, productReturn.productId || null, productReturn.productName, productReturn.quantity, productReturn.unitPrice, productReturn.refundAmount, productReturn.reason, productReturn.returnDate, productReturn.processedBy, productReturn.status]
      );
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
});
