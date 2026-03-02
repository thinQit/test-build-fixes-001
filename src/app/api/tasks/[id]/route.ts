import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-helpers';

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const task = await db.task.findUnique({ where: { id: params.id } });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    if (task.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load task';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const task = await db.task.findUnique({ where: { id: params.id } });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    if (task.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const updateData: {
      title?: string;
      description?: string | null;
      status?: string;
      priority?: string;
      dueDate?: Date | null;
    } = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const updated = await db.task.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const task = await db.task.findUnique({ where: { id: params.id } });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    if (task.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await db.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete task';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
