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
