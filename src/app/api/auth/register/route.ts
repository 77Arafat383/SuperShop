import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, requestedRole } = await request.json();

    if (!name || !email || !requestedRole) {
      return NextResponse.json({ error: 'Name, email, and requested role are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const id = `usr_${Date.now()}`;

    // Try inserting into PostgreSQL
    await query(
      `INSERT INTO users (id, name, email, password_hash, role, requested_role, status, phone) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, name, cleanEmail, password || 'hashed_pwd', requestedRole, requestedRole, 'Pending Approval', phone || null]
    );

    return NextResponse.json({
      success: true,
      message: `Registration received! Your request for "${requestedRole}" role is awaiting Admin approval.`,
      user: {
        id,
        name,
        email: cleanEmail,
        role: requestedRole,
        requestedRole,
        status: 'Pending Approval',
        phone,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
