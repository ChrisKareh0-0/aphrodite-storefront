import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/settings/hero`, {
      cache: 'no-store', // Always get fresh data
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hero settings from backend');
    }

    const data = await response.json();

    // Handle relative image URLs
    if (data.imageUrl && !data.imageUrl.startsWith('http')) {
      data.imageUrl = `${BACKEND_URL}${data.imageUrl}`;
    }

    // If no image URL is set, use default
    if (!data.imageUrl) {
      data.imageUrl = 'https://i.postimg.cc/t403yfn9/home2.jpg';
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching hero settings:', error);

    // Return default values on error
    return NextResponse.json({
      imageUrl: 'https://i.postimg.cc/t403yfn9/home2.jpg',
      title: 'SUMMER COLLECTION',
      heading: 'FALL - WINTER\nCollection 2025',
      description: 'A specialist label creating luxury essentials. Ethically crafted with an unwavering commitment to exceptional quality.',
      buttonText: 'New Collection',
      buttonLink: '#new-collection'
    });
  }
}
