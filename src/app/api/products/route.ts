import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function GET() {
  try {
    const dbRes = await query('SELECT * FROM products ORDER BY name ASC');
    if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
      return NextResponse.json({ success: true, products: dbRes.rows });
    }
    return NextResponse.json({ success: true, products: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, products: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `prod_${Date.now()}`;
    const product = { ...body, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    await query(
      `INSERT INTO products (id, name, sku, barcode, description, category_id, brand, purchase_price, selling_price, discount, stock_quantity, min_stock_level, unit, supplier_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        id, product.name, product.sku, product.barcode, product.description, product.categoryId, product.brand,
        product.purchasePrice, product.sellingPrice, product.discount || 0, product.stockQuantity, product.minStockLevel || 5,
        product.unit || 'pcs', product.supplierId || null, product.status || 'Active'
      ]
    );

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
