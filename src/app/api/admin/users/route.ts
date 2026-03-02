import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('limit') || 20)));

    const [items, total] = await Promise.all([
      db.user.findMany({
        select: { id: true, name: true, email: true, role: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count()
    ]);

    return NextResponse.json({ success: true, data: { items, page, limit, total } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load users';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
