import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Follow redirects and get the final URL
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const finalUrl = response.url;

    console.log('Original URL:', url);
    console.log('Final URL after redirect:', finalUrl);

    // Parse coordinates from the final URL
    const patterns = [
      /search\/([-\d.]+),\+?([-\d.]+)/,  // Google Maps search format: /search/lat,+lng
      /q=([-\d.]+),\+?([-\d.]+)/,        // Google Maps q parameter
      /@([-\d.]+),\+?([-\d.]+)/,         // Google Maps @ parameter
      /loc:([-\d.]+)\+([-\d.]+)/,        // WhatsApp location format
      /!3d([-\d.]+)!4d([-\d.]+)/,        // Google Maps !3d latitude !4d longitude format
      /([-\d.]+),\+?([-\d.]+)/,          // Plain coordinates with optional +
    ];

    for (const pattern of patterns) {
      const match = finalUrl.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);

        console.log(`Found coordinates: lat=${lat}, lng=${lng}`);

        // Validate coordinates are in reasonable range
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return NextResponse.json({ lat, lng });
        }
      }
    }

    console.log('Could not extract coordinates from final URL');
    return NextResponse.json(
      { error: `Could not extract coordinates. Final URL: ${finalUrl.substring(0, 200)}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error resolving location:', error);
    return NextResponse.json(
      { error: 'Failed to resolve location URL' },
      { status: 500 }
    );
  }
}
