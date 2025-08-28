import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.text();
    
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics from backend' },
      { status: 500 }
    );
  }
}