import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

const PUBLIC_PATHS = ['/api/health', '/api/auth/login', '/api/auth/register'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api') || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    const role = typeof payload.role === 'string' ? payload.role : null;

    if ((pathname.startsWith('/api/admin') || pathname.startsWith('/api/users')) && role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.next();
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*']
};
