import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const full = request.nextUrl.searchParams.get('full') === 'true';
    const data = {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };

    if (!full) {
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        memory: process.memoryUsage(),
        nodeVersion: process.version
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Health check failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
