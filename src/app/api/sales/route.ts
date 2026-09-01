import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const salesRes = await query('SELECT * FROM sales ORDER BY sale_date DESC');
    const itemsRes = await query('SELECT * FROM sale_items ORDER BY id ASC');
    const itemsBySale = new Map<string, any[]>();

    (itemsRes?.rows ?? []).forEach(item => {
      const items = itemsBySale.get(item.sale_id) ?? [];
      items.push(item);
      itemsBySale.set(item.sale_id, items);
    });

    const sales = (salesRes?.rows ?? []).map(sale => ({ ...sale, items: itemsBySale.get(sale.id) ?? [] }));
    return NextResponse.json({ success: true, sales });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, sales: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sale = await request.json();
    await query(
      `INSERT INTO sales (id, invoice_number, cashier_id, cashier_name, customer_name, customer_phone, subtotal, discount_total, tax_rate, tax_amount, total_amount, paid_amount, change_amount, payment_method, payment_details, sale_date, status, notes)
       VALUES ($1, $2, NULLIF($3, ''), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       ON CONFLICT (id) DO NOTHING`,
      [sale.id, sale.invoiceNumber, sale.cashierId, sale.cashierName, sale.customerName, sale.customerPhone || null, sale.subtotal, sale.discountTotal, sale.taxRate, sale.taxAmount, sale.totalAmount, sale.paidAmount, sale.changeAmount, sale.paymentMethod, JSON.stringify(sale.paymentDetails || {}), sale.saleDate, sale.status, sale.notes || null]
    );

    for (const item of sale.items ?? []) {
      await query(
        `INSERT INTO sale_items (id, sale_id, product_id, product_name, barcode, sku, unit_price, discount, quantity, subtotal, cost_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [`${sale.id}_${item.productId}`, sale.id, item.productId, item.productName, item.barcode, item.sku, item.unitPrice, item.discount, item.quantity, item.subtotal, item.costPrice]
      );
    }

    return NextResponse.json({ success: true, sale });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Sale save failed' }, { status: 500 });
  }
}
