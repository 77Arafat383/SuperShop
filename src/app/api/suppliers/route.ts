import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbRes = await query('SELECT * FROM suppliers ORDER BY name ASC');
    if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
      return NextResponse.json({ success: true, suppliers: dbRes.rows });
    }
    return NextResponse.json({ success: true, suppliers: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, suppliers: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supplier = await request.json();
    await query(
      `INSERT INTO suppliers (id, name, contact_person, phone, email, address, payment_terms, status, total_purchased, total_paid, total_due, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO NOTHING`,
      [supplier.id, supplier.name, supplier.contactPerson, supplier.phone, supplier.email || null, supplier.address, supplier.paymentTerms || 'Net 30', supplier.status || 'Active', supplier.totalPurchased || 0, supplier.totalPaid || 0, supplier.totalDue || 0, supplier.createdAt]
    );
    return NextResponse.json({ success: true, supplier });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Supplier save failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supplier = await request.json();
    if (!supplier.id) return NextResponse.json({ error: 'Supplier id is required' }, { status: 400 });

    await query(
      `UPDATE suppliers
       SET name = COALESCE($1, name), contact_person = COALESCE($2, contact_person), phone = COALESCE($3, phone),
           email = COALESCE($4, email), address = COALESCE($5, address), payment_terms = COALESCE($6, payment_terms),
           status = COALESCE($7, status), total_purchased = COALESCE($8, total_purchased), total_paid = COALESCE($9, total_paid),
           total_due = COALESCE($10, total_due)
       WHERE id = $11`,
      [supplier.name, supplier.contactPerson, supplier.phone, supplier.email, supplier.address, supplier.paymentTerms, supplier.status, supplier.totalPurchased, supplier.totalPaid, supplier.totalDue, supplier.id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Supplier update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Supplier id is required' }, { status: 400 });
    await query('DELETE FROM suppliers WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Supplier delete failed' }, { status: 500 });
  }
}
