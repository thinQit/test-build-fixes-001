import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { getUserFromRequest } from '@/lib/auth-helpers';

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional()
});

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).optional()
});

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const parsed = querySchema.parse({
      page: request.nextUrl.searchParams.get('page') || undefined,
      limit: request.nextUrl.searchParams.get('limit') || undefined
    });

    const page = Math.max(1, Number(parsed.page || '1'));
    const limit = Math.min(100, Math.max(1, Number(parsed.limit || '20')));

    const [items, total] = await Promise.all([
      db.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true, lastLogin: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.user.count()
    ]);

    return NextResponse.json({ success: true, data: { items, page, limit, total } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load users';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 });
    }

    const passwordHash = await hashPassword(data.password);
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role || 'user'
      }
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role }
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
