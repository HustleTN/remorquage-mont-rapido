import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateTrackingToken } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      serviceType,
      timing,
      notes,
      pickupLocation,
      pickupLat,
      pickupLng,
      distanceKm,
      estimatedPriceLow,
      estimatedPriceHigh
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone || !serviceType || !timing || !pickupLocation || !pickupLat || !pickupLng) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate tracking token
    const trackingToken = generateTrackingToken();

    // Get the default driver "raed"
    const { data: defaultDriver } = await supabase
      .from('drivers')
      .select('id')
      .eq('name', 'raed')
      .single();

    // Insert booking into Supabase (starts as pending)
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        service_type: serviceType,
        timing: timing,
        notes: notes || null,
        pickup_location: pickupLocation,
        pickup_lat: pickupLat,
        pickup_lng: pickupLng,
        distance_km: distanceKm,
        estimated_price_low: estimatedPriceLow || null,
        estimated_price_high: estimatedPriceHigh || null,
        tracking_token: trackingToken,
        status: 'pending',
        driver_id: defaultDriver?.id || null,
        assigned_at: null
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Send email with tracking link (only if email provided)
    if (customerEmail) {
      try {
        const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${trackingToken}`;

        await resend.emails.send({
          from: 'Remorquage Mont Rapido <noreply@remorquagemontrapido.ca>',
          to: customerEmail,
          subject: 'Demande de remorquage reçue - Suivez votre chauffeur',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1e3a5f; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Remorquage Mont Rapido</h1>
              </div>

              <div style="padding: 20px; background-color: #f5f5f5;">
                <h2 style="color: #1e3a5f;">Merci pour votre demande!</h2>
                <p>Bonjour ${customerName},</p>
                <p>Nous avons bien reçu votre demande de <strong>${serviceType}</strong>.</p>

                <div style="background-color: white; border: 2px solid #1e3a5f; padding: 15px; margin: 20px 0;">
                  <h3 style="color: #1e3a5f; margin-top: 0;">Détails de votre demande:</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li>📍 <strong>Emplacement:</strong> ${pickupLocation}</li>
                    <li>⏰ <strong>Quand:</strong> ${timing}</li>
                    <li>📏 <strong>Distance:</strong> ${distanceKm} km</li>
                    ${estimatedPriceLow && estimatedPriceHigh ?
                      `<li>💰 <strong>Prix estimé:</strong> ${estimatedPriceLow}$ - ${estimatedPriceHigh}$</li>`
                      : ''}
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${trackingUrl}" style="background-color: #e63946; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; font-weight: bold; border-radius: 4px;">
                    📍 Suivre mon chauffeur
                  </a>
                </div>

                <p style="font-size: 14px; color: #666;">
                  Lien de suivi: <a href="${trackingUrl}" style="color: #e63946;">${trackingUrl}</a>
                </p>

                <p>Nous vous contacterons sous peu pour confirmer.</p>

                <div style="background-color: #e63946; color: white; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-weight: bold;">📞 Ligne d'urgence 24/7:</p>
                  <p style="margin: 5px 0 0 0; font-size: 20px;">+1 (514) 000-0000</p>
                </div>
              </div>

              <div style="background-color: #1e3a5f; color: white; padding: 15px; text-align: center; font-size: 12px;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} Remorquage Mont Rapido. Tous droits réservés.</p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the booking if email fails
      }
    }

    // Return success with tracking info
    return NextResponse.json({
      success: true,
      trackingToken,
      trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/track/${trackingToken}`,
      bookingId: booking.id
    });

  } catch (error: any) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
