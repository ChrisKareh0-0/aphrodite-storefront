import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://aphrodite-admin.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Frontend API: Creating order with data:', {
      customer: body.customer?.name,
      itemCount: body.items?.length,
      total: body.total
    });

    const response = await fetch(`${BACKEND_URL}/api/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Frontend API: Backend response:', {
      success: response.ok,
      status: response.status,
      orderNumber: data.order?.orderNumber
    });

    if (!response.ok) {
      console.error('Frontend API: Order creation failed:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to create order' },
        { status: response.status }
      );
    }

    console.log('Frontend API: Order created successfully:', data.order?.orderNumber);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Frontend API: Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
