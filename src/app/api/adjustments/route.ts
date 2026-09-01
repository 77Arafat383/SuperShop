import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbRes = await query('SELECT * FROM stock_adjustments ORDER BY date DESC');
    return NextResponse.json({ success: true, adjustments: dbRes?.rows ?? [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, adjustments: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adjustment = await request.json();
    await query(
      `INSERT INTO stock_adjustments (id, product_id, product_name, sku, adjustment_type, quantity_before, quantity_change, quantity_after, reason, date, adjusted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING`,
      [adjustment.id, adjustment.productId, adjustment.productName, adjustment.sku, adjustment.adjustmentType, adjustment.quantityBefore, adjustment.quantityChange, adjustment.quantityAfter, adjustment.reason, adjustment.date, adjustment.adjustedBy]
    );
    await query('UPDATE products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [adjustment.quantityAfter, adjustment.productId]);
    return NextResponse.json({ success: true, adjustment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Stock adjustment failed' }, { status: 500 });
  }
}
