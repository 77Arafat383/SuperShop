import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbRes = await query(
      `SELECT id, name, email, role, requested_role, status, phone, created_at, last_login
       FROM users
       ORDER BY created_at DESC`
    );
    return NextResponse.json({ success: true, users: dbRes?.rows ?? [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, users: [] }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, role, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }

    if (role && status) {
      await query('UPDATE users SET role = $1, requested_role = $1, status = $2 WHERE id = $3', [role, status, id]);
    } else if (role) {
      await query('UPDATE users SET role = $1, requested_role = $1 WHERE id = $2', [role, id]);
    } else if (status) {
      await query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
    } else {
      return NextResponse.json({ error: 'Role or status is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'User update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }

    await query('DELETE FROM users WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'User delete failed' }, { status: 500 });
  }
}
