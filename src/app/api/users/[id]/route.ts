import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { getUserFromRequest } from '@/lib/auth-helpers';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['user', 'admin']).optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, lastLogin: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    if (data.email) {
      const existing = await db.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 });
      }
    }

    const updateData: {
      name?: string;
      email?: string;
      passwordHash?: string;
      role?: string;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.password !== undefined) updateData.passwordHash = await hashPassword(data.password);
    if (data.role !== undefined) updateData.role = data.role;

    const user = await db.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true }
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await db.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
