import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keycloakId, email, firstName, lastName, role = 'user', emailVerified = false } = body;

    // Validate required fields
    if (!keycloakId || !email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: keycloakId, email, firstName, lastName' },
        { status: 400 }
      );
    }

    // Get API base URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';

    // Forward to actual backend service
    const backendResponse = await fetch(`${API_BASE_URL}/auth/keycloak-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || 'unknown',
        'user-agent': request.headers.get('user-agent') || 'unknown'
      },
      body: JSON.stringify({
        keycloakId,
        email,
        firstName,
        lastName,
        role,
        emailVerified
      })
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Backend sync failed' }));
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    const result = await backendResponse.json();

    // Log the sync attempt
    console.log('Keycloak user sync request:', {
      keycloakId,
      email,
      firstName,
      lastName,
      role,
      emailVerified,
    });

    console.log('Keycloak user sync response:', result);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Keycloak sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error during Keycloak sync' },
      { status: 500 }
    );
  }
}