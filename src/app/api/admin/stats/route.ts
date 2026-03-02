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

    const [totalUsers, totalTasks, grouped] = await Promise.all([
      db.user.count(),
      db.task.count(),
      db.task.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    const tasksByStatus = grouped.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, { todo: 0, in_progress: 0, done: 0 });

    return NextResponse.json({
      success: true,
      data: { totalUsers, totalTasks, tasksByStatus }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load stats';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
