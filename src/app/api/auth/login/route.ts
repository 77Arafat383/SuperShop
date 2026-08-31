import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { INITIAL_USERS } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check Postgres if pool is configured
    const dbRes = await query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
      const user = dbRes.rows[0];
      if (user.status === 'Pending Approval') {
        return NextResponse.json({ error: 'Account pending Administrator approval' }, { status: 403 });
      }
      return NextResponse.json({ success: true, user });
    }

    // Fallback in-memory
    const mockUser = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (!mockUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (mockUser.status === 'Pending Approval') {
      return NextResponse.json({ error: 'Account pending Administrator approval' }, { status: 403 });
    }

    return NextResponse.json({ success: true, user: mockUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
