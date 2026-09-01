import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const purchasesRes = await query('SELECT * FROM purchase_orders ORDER BY order_date DESC');
    const itemsRes = await query('SELECT * FROM purchase_order_items ORDER BY id ASC');
    const paymentsRes = await query('SELECT * FROM purchase_payment_records ORDER BY payment_date ASC');
    const itemsByPurchase = new Map<string, any[]>();
    const paymentsByPurchase = new Map<string, any[]>();

    (itemsRes?.rows ?? []).forEach(item => {
      const items = itemsByPurchase.get(item.purchase_id) ?? [];
      items.push(item);
      itemsByPurchase.set(item.purchase_id, items);
    });

    (paymentsRes?.rows ?? []).forEach(payment => {
      const payments = paymentsByPurchase.get(payment.purchase_id) ?? [];
      payments.push(payment);
      paymentsByPurchase.set(payment.purchase_id, payments);
    });

    const purchases = (purchasesRes?.rows ?? []).map(purchase => ({
      ...purchase,
      items: itemsByPurchase.get(purchase.id) ?? [],
      payment_history: paymentsByPurchase.get(purchase.id) ?? [],
    }));

    return NextResponse.json({ success: true, purchases });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, purchases: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const purchase = await request.json();
    await query(
      `INSERT INTO purchase_orders (id, po_number, supplier_id, supplier_name, supplier_phone, total_amount, paid_amount, due_amount, status, payment_status, order_date, received_date, created_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING`,
      [purchase.id, purchase.poNumber, purchase.supplierId, purchase.supplierName, purchase.supplierPhone, purchase.totalAmount, purchase.paidAmount, purchase.dueAmount, purchase.status, purchase.paymentStatus, purchase.orderDate, purchase.receivedDate || null, purchase.createdBy, purchase.notes || null]
    );

    for (const item of purchase.items ?? []) {
      await query(
        `INSERT INTO purchase_order_items (id, purchase_id, product_id, product_name, sku, unit_cost, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [`${purchase.id}_${item.productId}`, purchase.id, item.productId, item.productName, item.sku, item.unitCost, item.quantity, item.subtotal]
      );
    }

    for (const payment of purchase.paymentHistory ?? []) {
      await query(
        `INSERT INTO purchase_payment_records (id, purchase_id, supplier_id, payment_date, amount_paid, previous_due, remaining_due, payment_method, transaction_ref, receipt_number, notes, recorded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [payment.id, purchase.id, purchase.supplierId, payment.paymentDate, payment.amountPaid, payment.previousDue, payment.remainingDue, payment.paymentMethod, payment.transactionRef, payment.receiptNumber, payment.notes || null, payment.recordedBy]
      );
    }

    await query(
      `UPDATE suppliers
       SET total_purchased = total_purchased + $1, total_paid = total_paid + $2, total_due = total_due + $3
       WHERE id = $4`,
      [purchase.totalAmount, purchase.paidAmount, purchase.dueAmount, purchase.supplierId]
    );

    return NextResponse.json({ success: true, purchase });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Purchase order save failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'receive') {
      const purchase = body.purchase;
      await query(
        `UPDATE purchase_orders SET status = 'Received', received_date = $1 WHERE id = $2`,
        [purchase.receivedDate, purchase.id]
      );

      return NextResponse.json({ success: true });
    }

    if (body.action === 'payment') {
      const { purchaseId, supplierId, paidAmount, dueAmount, paymentStatus, payment } = body;
      await query(
        `UPDATE purchase_orders SET paid_amount = $1, due_amount = $2, payment_status = $3 WHERE id = $4`,
        [paidAmount, dueAmount, paymentStatus, purchaseId]
      );
      await query(
        `INSERT INTO purchase_payment_records (id, purchase_id, supplier_id, payment_date, amount_paid, previous_due, remaining_due, payment_method, transaction_ref, receipt_number, notes, recorded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [payment.id, purchaseId, supplierId, payment.paymentDate, payment.amountPaid, payment.previousDue, payment.remainingDue, payment.paymentMethod, payment.transactionRef, payment.receiptNumber, payment.notes || null, payment.recordedBy]
      );
      await query('UPDATE suppliers SET total_paid = total_paid + $1, total_due = GREATEST(0, total_due - $1) WHERE id = $2', [payment.amountPaid, supplierId]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown purchase action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Purchase update failed' }, { status: 500 });
  }
}
