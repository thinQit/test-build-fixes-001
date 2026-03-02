import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
