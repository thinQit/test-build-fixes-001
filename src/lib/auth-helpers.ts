import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

type UserRole = 'user' | 'admin';

export interface AuthPayload {
  sub: string;
  role: UserRole;
}

export function getAuthPayload(request: NextRequest): AuthPayload | null {
  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    const sub = typeof payload.sub === 'string' ? payload.sub : null;
    const role = typeof payload.role === 'string' ? (payload.role as UserRole) : null;
    if (!sub || !role) return null;
    return { sub, role };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return null;
  return db.user.findUnique({ where: { id: payload.sub } });
}
