import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbRes = await query(
      `SELECT c.id, c.name, c.description, c.icon, COUNT(p.id)::int AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id, c.name, c.description, c.icon
       ORDER BY c.name ASC`
    );
    return NextResponse.json({ success: true, categories: dbRes?.rows ?? [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, categories: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const category = await request.json();
    await query(
      `INSERT INTO categories (id, name, description, icon)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon`,
      [category.id, category.name, category.description || null, category.icon || 'Layers']
    );
    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Category save failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const category = await request.json();
    if (!category.id) return NextResponse.json({ error: 'Category id is required' }, { status: 400 });
    await query(
      `UPDATE categories SET name = COALESCE($1, name), description = COALESCE($2, description), icon = COALESCE($3, icon)
       WHERE id = $4`,
      [category.name, category.description, category.icon, category.id]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Category update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Category id is required' }, { status: 400 });
    await query('DELETE FROM categories WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Category delete failed' }, { status: 500 });
  }
}
