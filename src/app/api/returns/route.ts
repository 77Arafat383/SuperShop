import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbRes = await query('SELECT * FROM product_returns ORDER BY return_date DESC');
    return NextResponse.json({ success: true, returns: dbRes?.rows ?? [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, returns: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const productReturn = await request.json();
    await query(
      `INSERT INTO product_returns (id, return_number, sale_id, invoice_number, product_id, product_name, quantity, unit_price, refund_amount, reason, return_date, processed_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO NOTHING`,
      [productReturn.id, productReturn.returnNumber, productReturn.saleId, productReturn.invoiceNumber, productReturn.productId, productReturn.productName, productReturn.quantity, productReturn.unitPrice, productReturn.refundAmount, productReturn.reason, productReturn.returnDate, productReturn.processedBy, productReturn.status]
    );
    return NextResponse.json({ success: true, return: productReturn });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Return save failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    await query(
      `UPDATE product_returns SET status = $1 WHERE id = $2`,
      [status, id]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Return update failed' }, { status: 500 });
  }
}
