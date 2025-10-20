import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // For now, just return success
    // In the future, this can be connected to a cart backend or use localStorage
    return NextResponse.json({
      success: true,
      message: 'Product added to cart',
      cart: {
        productId,
        quantity
      }
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}
