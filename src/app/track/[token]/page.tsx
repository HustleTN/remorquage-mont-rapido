"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Clock, Loader2 } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Booking {
  id: string;
  customer_name: string;
  pickup_location: string;
  pickup_lat: number;
  pickup_lng: number;
  service_type: string;
  status: string;
  driver_id: string | null;
  distance_km: number;
  estimated_price_low: number | null;
  estimated_price_high: number | null;
  timing: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  current_lat: number | null;
  current_lng: number | null;
}

interface LocationUpdate {
  lat: number;
  lng: number;
  created_at: string;
}

export default function TrackingPage() {
  const params = useParams();
  const token = params.token as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [locations, setLocations] = useState<LocationUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);

  // Fetch booking data
  useEffect(() => {
    fetchBooking();
  }, [token]);

  // Subscribe to real-time booking status updates
  useEffect(() => {
    if (!booking) return;

    const channel = supabase
      .channel(`booking-track-${booking.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${booking.id}`
        },
        async (payload) => {
          const updatedBooking = payload.new as Booking;
          setBooking(updatedBooking);

          // Fetch driver if newly assigned
          if (updatedBooking.driver_id && !driver) {
            const { data: driverData } = await supabase
              .from('drivers')
              .select('*')
              .eq('id', updatedBooking.driver_id)
              .single();

            if (driverData) setDriver(driverData);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'location_updates',
          filter: `booking_id=eq.${booking.id}`
        },
        (payload) => {
          const newLocation = payload.new as LocationUpdate;
          setLocations(prev => [newLocation, ...prev]);
          updateDriverMarker(newLocation.lat, newLocation.lng);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drivers',
          filter: `id=eq.${booking.driver_id}`
        },
        (payload) => {
          const updatedDriver = payload.new as Driver;
          setDriver(updatedDriver);

          // If driver location is cleared (GPS stopped), remove marker
          if (updatedDriver.current_lat === null || updatedDriver.current_lng === null) {
            if (driverMarker.current) {
              driverMarker.current.remove();
              driverMarker.current = null;
            }
            // Remove route
            if (map.current && map.current.getSource('route')) {
              map.current.removeLayer('route');
              map.current.removeSource('route');
            }
            console.log('Driver marker removed - GPS stopped');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking?.id, booking?.driver_id, driver?.id]);

  const fetchBooking = async () => {
    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('tracking_token', token)
        .single();

      if (bookingError) throw new Error('Réservation introuvable');

      setBooking(bookingData);

      // Fetch driver if assigned
      if (bookingData.driver_id) {
        const { data: driverData } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', bookingData.driver_id)
          .single();

        if (driverData) setDriver(driverData);
      }

      // Fetch location history
      const { data: locationData } = await supabase
        .from('location_updates')
        .select('*')
        .eq('booking_id', bookingData.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (locationData) setLocations(locationData);

      setLoading(false);
      initializeMap(bookingData, locationData?.[0]);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const initializeMap = (bookingData: Booking, latestLocation?: LocationUpdate) => {
    if (!mapContainer.current || map.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [bookingData.pickup_lng, bookingData.pickup_lat],
      zoom: 13
    });

    // Add pickup location marker
    new mapboxgl.Marker({ color: '#1e3a5f' })
      .setLngLat([bookingData.pickup_lng, bookingData.pickup_lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>📍 Votre emplacement</strong><br/>${bookingData.pickup_location}`))
      .addTo(map.current);

    // Add driver marker if location exists
    if (latestLocation) {
      updateDriverMarker(latestLocation.lat, latestLocation.lng);
      drawRoute(latestLocation.lng, latestLocation.lat, bookingData.pickup_lng, bookingData.pickup_lat);
    }
  };

  const updateDriverMarker = (lat: number, lng: number) => {
    if (!map.current) return;

    if (driverMarker.current) {
      driverMarker.current.setLngLat([lng, lat]);
    } else {
      driverMarker.current = new mapboxgl.Marker({ color: '#e63946' })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>🚛 Votre chauffeur</strong>`))
        .addTo(map.current);
    }

    // Draw route and fit bounds
    if (booking) {
      drawRoute(lng, lat, booking.pickup_lng, booking.pickup_lat);
    }
  };

  const drawRoute = async (startLng: number, startLat: number, endLng: number, endLat: number) => {
    if (!map.current) return;

    try {
      // Fetch route from Mapbox Directions API
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        setRouteDistance((route.distance / 1000).toFixed(1) as any); // km
        setRouteDuration((route.duration / 60).toFixed(0) as any); // minutes

        // Remove existing route layer if it exists
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }

        // Add route line to map
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#e63946',
            'line-width': 4,
            'line-opacity': 0.75
          }
        });

        // Fit map to show route
        const coordinates = route.geometry.coordinates;
        const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        map.current.fitBounds(bounds, { padding: 100 });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-red mx-auto mb-4" />
          <p className="text-brand-navy font-bold">Chargement de votre suivi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-brand-gray border-2 border-brand-navy p-8 text-center">
          <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">✕</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy mb-2">Erreur</h1>
          <p className="text-brand-navy/70 mb-6">{error}</p>
          <Button asChild className="bg-brand-navy text-white border-2 border-brand-navy">
            <a href="/">Retour à l'accueil</a>
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-brand-navy">Réservation introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      {/* Mobile App Header */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navy md:bg-brand-navy text-white md:p-6 p-4 sticky top-0 z-40 shadow-lg md:shadow-none safe-area-top">
        <div className="container mx-auto">
          <h1 className="text-xl md:text-2xl md:text-3xl font-bold">Suivi de votre remorquage</h1>
          <p className="text-white/80 text-sm md:text-base">Réservation #{booking.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto md:px-4 px-3 md:py-8 py-4">
        {/* Status Card */}
        <div className="bg-white md:bg-brand-gray md:border-2 border-0 border-brand-navy md:p-6 p-4 mb-4 md:mb-6 rounded-xl md:rounded-none shadow-xl md:shadow-none">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <h3 className="font-bold text-brand-navy mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                DÉTAILS DE LA DEMANDE
              </h3>
              <div className="space-y-2 text-xs md:text-sm bg-brand-gray md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none">
                <p><strong>Service:</strong> {booking.service_type}</p>
                <p className="line-clamp-2"><strong>Emplacement:</strong> {booking.pickup_location}</p>
                <p><strong>Distance:</strong> {booking.distance_km} km</p>
                <p><strong>Quand:</strong> {booking.timing}</p>
                {booking.estimated_price_low && booking.estimated_price_high && (
                  <p>
                    <strong>Prix estimé:</strong> {booking.estimated_price_low}$ - {booking.estimated_price_high}$
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-brand-navy mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                STATUT
              </h3>
              <div className={`text-xl md:text-2xl font-bold uppercase mb-3 md:mb-4 ${
                booking.status === 'pending' ? 'text-yellow-600' :
                booking.status === 'assigned' ? 'text-brand-navy' :
                booking.status === 'completed' ? 'text-green-600' :
                'text-brand-red'
              }`}>
                {booking.status === 'pending' && 'EN ATTENTE'}
                {booking.status === 'assigned' && 'CHAUFFEUR ASSIGNÉ'}
                {booking.status === 'completed' && 'TERMINÉ'}
                {booking.status === 'refused' && 'REFUSÉ'}
                {!['pending', 'assigned', 'completed', 'refused'].includes(booking.status) && booking.status}
              </div>
              {driver && (
                <div className="space-y-2 text-xs md:text-sm bg-brand-gray md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none">
                  <p><strong>Chauffeur:</strong> {driver.name}</p>
                  <p><strong>Téléphone:</strong> {driver.phone}</p>
                  {routeDistance && routeDuration && (
                    <>
                      <p><strong>Distance:</strong> {routeDistance} km</p>
                      <p><strong>Temps estimé:</strong> {routeDuration} min</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mb-4 md:mb-6">
          <h3 className="font-bold text-brand-navy mb-3 md:mb-4 text-base md:text-lg">CARTE</h3>
          <div ref={mapContainer} className="w-full h-80 md:h-96 md:border-4 border-2 border-brand-navy rounded-xl md:rounded-none overflow-hidden shadow-lg md:shadow-none" />
        </div>

        {/* Live Updates */}
        {locations.length > 0 && (
          <div className="bg-white md:border-2 border-0 border-brand-navy md:p-6 p-4 mb-4 md:mb-6 rounded-xl md:rounded-none shadow-lg md:shadow-none">
            <h3 className="font-bold text-brand-navy mb-3 md:mb-4 text-sm md:text-base">DERNIÈRES POSITIONS</h3>
            <div className="space-y-2 md:space-y-3">
              {locations.slice(0, 5).map((loc, i) => (
                <div key={i} className="flex items-center gap-3 p-2 md:p-3 bg-brand-gray rounded-lg md:rounded-none">
                  <div className="w-2 h-2 rounded-full bg-brand-red flex-shrink-0"></div>
                  <div className="flex-1">
                    <span className="text-xs md:text-sm text-brand-navy/70 block md:inline">
                      {new Date(loc.created_at).toLocaleString('fr-CA')}
                    </span>
                    <span className="text-xs md:text-sm font-bold text-brand-navy block md:inline md:ml-4">
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Buttons - Mobile App Style */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pb-4 md:pb-0">
          <Button
            asChild
            className="flex-1 bg-brand-red text-white md:border-2 border-0 border-brand-navy font-bold uppercase py-4 md:py-auto rounded-xl md:rounded-none shadow-lg md:shadow-none active:scale-95 md:active:scale-100 transition-transform"
          >
            <a href="tel:+15140000000">
              <Phone className="w-5 h-5 mr-2" />
              Appeler le service
            </a>
          </Button>
          {driver && (
            <Button
              asChild
              variant="outline"
              className="flex-1 bg-white text-brand-navy md:border-2 border-2 border-brand-navy font-bold uppercase py-4 md:py-auto rounded-xl md:rounded-none shadow-lg md:shadow-none active:scale-95 md:active:scale-100 transition-transform"
            >
              <a href={`tel:${driver.phone}`}>
                <Phone className="w-5 h-5 mr-2" />
                Appeler le chauffeur
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
