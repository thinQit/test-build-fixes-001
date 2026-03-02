import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-helpers';

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  sortBy: z.enum(['dueDate', 'createdAt', 'updatedAt', 'priority', 'status', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = querySchema.parse({
      page: request.nextUrl.searchParams.get('page') || undefined,
      limit: request.nextUrl.searchParams.get('limit') || undefined,
      status: request.nextUrl.searchParams.get('status') || undefined,
      sortBy: request.nextUrl.searchParams.get('sortBy') || undefined,
      sortOrder: request.nextUrl.searchParams.get('sortOrder') || undefined
    });

    const page = Math.max(1, Number(parsed.page || '1'));
    const limit = Math.min(100, Math.max(1, Number(parsed.limit || '20')));
    const sortBy = parsed.sortBy || 'dueDate';
    const sortOrder = parsed.sortOrder || 'asc';

    const where = {
      ownerId: user.id,
      ...(parsed.status ? { status: parsed.status } : {})
    };

    const [items, total] = await Promise.all([
      db.task.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.task.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: { items, page, limit, total }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load tasks';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    const task = await db.task.create({
      data: {
        ownerId: user.id,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        priority: data.priority || 'medium',
        status: 'todo'
      }
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
