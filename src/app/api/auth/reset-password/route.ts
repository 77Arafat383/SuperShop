import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();
    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    await query(
      `UPDATE users SET password_hash = $1 WHERE LOWER(email) = $2`,
      [newPassword, cleanEmail]
    );

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Password reset failed' }, { status: 500 });
  }
}
