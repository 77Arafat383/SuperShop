import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

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
    const id = body.id || `prod_${Date.now()}`;
    const product = { ...body, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    await query(
      `INSERT INTO products (id, name, sku, barcode, description, category_id, brand, purchase_price, selling_price, discount, stock_quantity, min_stock_level, unit, supplier_id, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        id, product.name, product.sku, product.barcode, product.description, product.categoryId, product.brand,
        product.purchasePrice, product.sellingPrice, product.discount || 0, product.stockQuantity, product.minStockLevel || 5,
        product.unit || 'pcs', product.supplierId || null, product.imageUrl || null, product.status || 'Active'
      ]
    );

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const product = await request.json();
    if (!product.id) return NextResponse.json({ error: 'Product id is required' }, { status: 400 });

    await query(
      `UPDATE products
       SET name = COALESCE($1, name), sku = COALESCE($2, sku), barcode = COALESCE($3, barcode), description = COALESCE($4, description),
           category_id = COALESCE($5, category_id), brand = COALESCE($6, brand), purchase_price = COALESCE($7, purchase_price),
           selling_price = COALESCE($8, selling_price), discount = COALESCE($9, discount), stock_quantity = COALESCE($10, stock_quantity),
           min_stock_level = COALESCE($11, min_stock_level), unit = COALESCE($12, unit), supplier_id = COALESCE($13, supplier_id),
           image_url = COALESCE($14, image_url), status = COALESCE($15, status), updated_at = CURRENT_TIMESTAMP
       WHERE id = $16`,
      [
        product.name, product.sku, product.barcode, product.description, product.categoryId, product.brand,
        product.purchasePrice, product.sellingPrice, product.discount, product.stockQuantity, product.minStockLevel,
        product.unit, product.supplierId || null, product.imageUrl || null, product.status, product.id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Product update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
    await query('DELETE FROM products WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Product delete failed' }, { status: 500 });
  }
}
