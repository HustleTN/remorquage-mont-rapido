"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, Navigation, LogOut, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  pickup_location: string;
  pickup_lat: number;
  pickup_lng: number;
  service_type: string;
  status: string;
  timing: string;
  distance_km: number | null;
  estimated_price_low: number | null;
  estimated_price_high: number | null;
}

export default function DriverDashboard() {
  const router = useRouter();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locationLink, setLocationLink] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // GPS tracking state
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsBooking, setGpsBooking] = useState<string | null>(null);
  const [lastGpsUpdate, setLastGpsUpdate] = useState<Date | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 3;

  useEffect(() => {
    const id = localStorage.getItem('driver_id');
    const name = localStorage.getItem('driver_name');

    if (!id) {
      router.push('/driver/login');
      return;
    }

    setDriverId(id);
    setDriverName(name || 'Chauffeur');
    fetchBookings(id);
  }, [router]);

  // Subscribe to real-time booking updates
  useEffect(() => {
    if (!driverId) return;

    console.log('Setting up real-time subscription for driver:', driverId);

    const channel = supabase
      .channel('driver-bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `driver_id=eq.${driverId}`
        },
        (payload) => {
          console.log('New booking received:', payload);
          const newBooking = payload.new as Booking;
          setBookings(prev => [newBooking, ...prev]);
          toast.success('🚨 Nouvelle demande reçue!', { duration: 5000 });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `driver_id=eq.${driverId}`
        },
        (payload) => {
          console.log('Booking updated:', payload);
          const updatedBooking = payload.new as Booking;
          setBookings(prev =>
            prev.map(b => b.id === updatedBooking.id ? updatedBooking : b)
          );
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [driverId]);

  const fetchBookings = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('driver_id', id)
        .in('status', ['pending', 'assigned', 'dispatched', 'en_route', 'arrived', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    if (!driverId) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Get initial GPS location and send immediately
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Send initial location update
              await supabase.from('location_updates').insert({
                booking_id: bookingId,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                source: 'gps',
                driver_id: driverId
              });

              // Update driver's current location
              await supabase.from('drivers').update({
                current_lat: position.coords.latitude,
                current_lng: position.coords.longitude
              }).eq('id', driverId);

              console.log('Initial GPS location sent:', position.coords.latitude, position.coords.longitude);
            } catch (err) {
              console.error('Error sending initial location:', err);
            }
          },
          (error) => {
            console.error('Error getting initial location:', error);
            toast.error('Impossible d\'obtenir votre position. Vérifiez les permissions GPS.');
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }

      // Automatically start GPS tracking when accepting a booking
      setGpsEnabled(true);
      setGpsBooking(bookingId);
      setGpsError(null);

      toast.success('✅ Réservation acceptée! GPS activé automatiquement.');
      fetchBookings(driverId);
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const handleRefuseBooking = async (bookingId: string) => {
    if (!driverId) return;

    toast.custom(
      (t) => (
        <div className="bg-white border-2 border-brand-navy p-4 shadow-lg">
          <p className="font-bold text-brand-navy mb-3">Êtes-vous sûr de refuser cette réservation?</p>
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                toast.dismiss(t);
                try {
                  const { error } = await supabase
                    .from('bookings')
                    .update({ status: 'refused' })
                    .eq('id', bookingId);

                  if (error) throw error;

                  toast.success('❌ Réservation refusée');
                  fetchBookings(driverId);
                } catch (error: any) {
                  toast.error('Erreur: ' + error.message);
                }
              }}
              className="bg-brand-red text-white hover:bg-brand-red/90 text-sm px-4 py-2"
            >
              Oui, refuser
            </Button>
            <Button
              onClick={() => toast.dismiss(t)}
              variant="outline"
              className="text-sm px-4 py-2"
            >
              Annuler
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleCompleteBooking = async (bookingId: string) => {
    if (!driverId) return;

    toast.custom(
      (t) => (
        <div className="bg-white border-2 border-brand-navy p-4 shadow-lg">
          <p className="font-bold text-brand-navy mb-3">Marquer cette course comme terminée?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  const completedAt = new Date().toISOString();

                  // Update database
                  const { error } = await supabase
                    .from('bookings')
                    .update({
                      status: 'completed',
                      completed_at: completedAt
                    })
                    .eq('id', bookingId);

                  if (error) throw error;

                  // Immediately update local state for instant UI update
                  setBookings(prev =>
                    prev.map(b =>
                      b.id === bookingId
                        ? { ...b, status: 'completed', completed_at: completedAt }
                        : b
                    )
                  );

                  // Stop GPS tracking if this booking is being tracked
                  if (gpsEnabled && gpsBooking === bookingId) {
                    // Clear driver's current location
                    await supabase
                      .from('drivers')
                      .update({
                        current_lat: null,
                        current_lng: null
                      })
                      .eq('id', driverId);

                    setGpsEnabled(false);
                    setGpsBooking(null);
                    setGpsError(null);
                    setLastGpsUpdate(null);
                  }

                  toast.dismiss(t);
                  toast.success('✅ Course terminée!');
                } catch (error: any) {
                  toast.dismiss(t);
                  toast.error('Erreur: ' + error.message);
                }
              }}
              className="bg-green-600 text-white hover:bg-green-700 text-sm px-4 py-2 rounded font-bold"
            >
              Oui, terminer
            </button>
            <button
              onClick={() => toast.dismiss(t)}
              className="border-2 border-brand-navy text-brand-navy hover:bg-brand-gray text-sm px-4 py-2 rounded font-bold"
            >
              Annuler
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const parseLocationLink = async (link: string): Promise<{ lat: number; lng: number } | null> => {
    // Parse WhatsApp location: https://wa.me/?text=https://maps.google.com/?q=45.5017,-73.5673
    // Parse Google Maps: https://maps.google.com/?q=45.5017,-73.5673
    // Parse Google Maps share: https://goo.gl/maps/... or https://maps.app.goo.gl/...

    const patterns = [
      /q=([-\d.]+),([-\d.]+)/,           // Google Maps q parameter
      /@([-\d.]+),([-\d.]+)/,            // Google Maps @ parameter
      /loc:([-\d.]+)\+([-\d.]+)/,        // WhatsApp location format
      /([-\d.]+),([-\d.]+)/,             // Plain coordinates
    ];

    // First try parsing directly from the URL
    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        // Validate coordinates are in reasonable range
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }

    // If no match and it's a shortened URL, resolve it via API
    if (link.includes('goo.gl') || link.includes('maps.app.goo.gl')) {
      try {
        console.log('Resolving shortened URL:', link);
        const response = await fetch('/api/resolve-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: link })
        });

        const data = await response.json();
        console.log('API response:', data);

        if (response.ok && data.lat && data.lng) {
          return { lat: data.lat, lng: data.lng };
        } else {
          console.error('API error:', data.error);
        }
      } catch (error) {
        console.error('Error resolving shortened URL:', error);
      }
    }

    return null;
  };

  const handleSubmitLocation = async () => {
    if (!selectedBooking || !locationLink || !driverId) return;

    setIsSubmitting(true);

    const coords = await parseLocationLink(locationLink);
    if (!coords) {
      alert('Lien de localisation invalide. Utilisez un lien Google Maps ou WhatsApp.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('location_updates')
        .insert({
          booking_id: selectedBooking,
          lat: coords.lat,
          lng: coords.lng,
          source: locationLink.includes('wa.me') ? 'whatsapp' : 'google_maps',
          driver_id: driverId
        });

      if (error) throw error;

      toast.success('✓ Position partagée avec succès!');
      setLocationLink('');
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('driver_id');
    localStorage.removeItem('driver_name');
    router.push('/driver/login');
  };

  // GPS tracking functionality
  useEffect(() => {
    let watchId: number | null = null;
    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 10000; // 10 seconds for real-time tracking

    if (gpsEnabled && gpsBooking && driverId) {
      if (!navigator.geolocation) {
        setGpsError('GPS non disponible sur cet appareil');
        setGpsEnabled(false);
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const now = Date.now();

          // Only update if interval has passed since last update
          if (now - lastUpdateTime >= UPDATE_INTERVAL) {
            try {
              // Insert location update for this booking
              const { error: locationError } = await supabase
                .from('location_updates')
                .insert({
                  booking_id: gpsBooking,
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  source: 'gps',
                  driver_id: driverId
                });

              if (locationError) throw locationError;

              // Update driver's current location
              const { error: driverError } = await supabase
                .from('drivers')
                .update({
                  current_lat: position.coords.latitude,
                  current_lng: position.coords.longitude
                })
                .eq('id', driverId);

              if (driverError) console.error('Driver location update error:', driverError);

              setLastGpsUpdate(new Date());
              setGpsError(null);
              lastUpdateTime = now;
            } catch (err: any) {
              console.error('GPS update error:', err);
              setGpsError('Erreur lors de la mise à jour GPS');
            }
          }
        },
        (error) => {
          setGpsError(`Erreur GPS: ${error.message}`);
          setGpsEnabled(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [gpsEnabled, gpsBooking, driverId]);

  const toggleGpsTracking = async (bookingId: string) => {
    if (gpsEnabled && gpsBooking === bookingId) {
      // Stop tracking and clear driver location
      try {
        // Clear driver's current location from database
        await supabase
          .from('drivers')
          .update({
            current_lat: null,
            current_lng: null
          })
          .eq('id', driverId);

        console.log('GPS stopped - driver location cleared');
      } catch (error) {
        console.error('Error clearing driver location:', error);
      }

      setGpsEnabled(false);
      setGpsBooking(null);
      setGpsError(null);
      setLastGpsUpdate(null);
      toast.success('GPS arrêté');
    } else {
      // Start tracking
      setGpsEnabled(true);
      setGpsBooking(bookingId);
      setGpsError(null);
      toast.success('GPS démarré');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      {/* Toast Container */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" />

      {/* Mobile App Header */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navy md:bg-brand-navy text-white md:p-6 safe-area-top sticky top-0 z-40 shadow-lg md:shadow-none">
        {/* Mobile Header - Compact */}
        <div className="md:hidden px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center font-bold text-white text-lg shadow-md">
                {driverName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white/70 text-xs uppercase tracking-wide font-medium">Chauffeur</p>
                <h1 className="text-white font-bold text-lg leading-tight">{driverName}</h1>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              size="sm"
              className="bg-white/10 text-white border border-white/20 hover:bg-white/20 rounded-lg px-3 py-2 active:scale-95 transition-transform"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Mes Courses</h1>
              <p className="text-white/80">Bonjour, {driverName}!</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white text-brand-navy border-2 border-white hover:bg-brand-gray"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto md:px-4 px-3 py-4 md:py-6 max-w-7xl">
        {/* GPS Status Bar - Mobile App Style */}
        {gpsEnabled && gpsBooking && (
          <div className="bg-gradient-to-r from-brand-red to-brand-red-dark md:border-4 md:border-brand-navy rounded-xl md:rounded-none p-4 md:p-5 mb-4 md:mb-6 shadow-xl md:shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-brand-red rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-white text-sm md:text-lg uppercase tracking-wide">GPS EN TEMPS RÉEL</p>
                  <p className="text-xs md:text-sm text-white/90 font-medium">
                    {lastGpsUpdate
                      ? `Mis à jour: ${lastGpsUpdate.toLocaleTimeString('fr-CA')}`
                      : 'Acquisition du signal GPS...'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => toggleGpsTracking(gpsBooking)}
                size="sm"
                className="bg-white text-brand-red hover:bg-gray-100 md:border-4 border-2 border-brand-navy font-bold uppercase px-4 md:px-6 rounded-lg md:rounded-none active:scale-95 transition-transform"
              >
                ⏹ Arrêter
              </Button>
            </div>
            {gpsError && (
              <div className="mt-3 md:mt-4 p-3 bg-white rounded-lg md:rounded-none md:border-2 border-brand-navy text-xs md:text-sm font-bold text-brand-red">
                ⚠️ {gpsError}
              </div>
            )}
          </div>
        )}

        {/* Manual Location Sharing - Enhanced */}
        <details className="mb-8 group" open={!gpsEnabled}>
          <summary className="bg-white border-4 border-brand-navy p-5 cursor-pointer hover:bg-brand-gray transition-colors list-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-navy flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-navy text-lg uppercase">Partage Manuel de Position</h3>
                  <p className="text-xs text-brand-navy/60 font-medium">Google Maps ou WhatsApp</p>
                </div>
              </div>
              <div className="text-brand-navy group-open:rotate-180 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </summary>

          <div className="bg-brand-gray border-4 border-t-0 border-brand-navy p-6">
            <div className="grid md:grid-cols-[1fr,2fr,auto] gap-4 mb-5">
              {/* Booking Selection */}
              <div>
                <label className="block font-bold mb-2 text-brand-navy text-xs uppercase tracking-wide">
                  Sélectionner Course
                </label>
                <select
                  value={selectedBooking || ''}
                  onChange={(e) => setSelectedBooking(e.target.value)}
                  className="w-full border-3 border-brand-navy px-3 py-2.5 bg-white font-bold text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                >
                  <option value="">-- Choisir --</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.customer_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Link Input */}
              <div>
                <label className="block font-bold mb-2 text-brand-navy text-xs uppercase tracking-wide">
                  Coller Lien de Position
                </label>
                <Input
                  type="text"
                  value={locationLink}
                  onChange={(e) => setLocationLink(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="border-3 border-brand-navy h-auto py-2.5 font-medium focus:ring-2 focus:ring-brand-red"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <Button
                  onClick={handleSubmitLocation}
                  disabled={!selectedBooking || !locationLink || isSubmitting}
                  className="bg-brand-red text-white hover:bg-brand-red/90 border-3 border-brand-navy disabled:opacity-50 font-bold uppercase px-8 py-2.5 h-auto shadow-lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white border-2 border-brand-navy p-4">
              <p className="text-xs font-bold text-brand-navy uppercase mb-2">📱 Instructions Rapides:</p>
              <ol className="text-xs text-brand-navy/80 space-y-1 font-medium pl-4 list-decimal">
                <li>Ouvrez <strong>Google Maps</strong> sur votre téléphone</li>
                <li>Appuyez sur votre position bleue → <strong>"Partager la position"</strong></li>
                <li>Copiez le lien et collez-le ci-dessus</li>
              </ol>
            </div>
          </div>
        </details>

        {/* Active Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-brand-navy text-xl uppercase">Courses</h2>
              <p className="text-xs text-brand-navy/60 font-medium">{bookings.length} course(s)</p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white border-4 border-brand-navy p-8 text-center">
              <MapPin className="w-10 h-10 text-brand-navy/40 mx-auto mb-3" />
              <p className="text-brand-navy font-bold text-lg uppercase">Aucune Course</p>
              <p className="text-brand-navy/60 text-xs">
                Les nouvelles courses apparaîtront ici
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {bookings
                  .slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage)
                  .map((booking) => {
                    const isCompleted = booking.status === 'completed';

                    if (isCompleted) {
                      // Completed booking - collapsed accordion
                      return (
                        <details key={booking.id} className="bg-green-50 md:border-3 border-2 border-green-600 rounded-xl md:rounded-none overflow-hidden shadow-md md:shadow-none">
                          <summary className="bg-green-600 text-white px-4 py-3 md:py-2.5 cursor-pointer active:bg-green-700 md:hover:bg-green-700 transition-colors list-none">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full md:rounded-none flex items-center justify-center shadow-sm md:shadow-none">
                                  <span className="text-green-600 font-bold text-lg">✓</span>
                                </div>
                                <div>
                                  <h3 className="font-bold text-base">{booking.customer_name}</h3>
                                  <p className="text-xs text-white/70 line-clamp-1">{booking.pickup_location}</p>
                                </div>
                              </div>
                              <span className="text-[10px] md:text-xs font-bold uppercase bg-white/20 px-2 py-1 rounded-md md:rounded-none md:bg-transparent md:px-0">TERMINÉ</span>
                            </div>
                          </summary>

                          {/* Collapsed Content */}
                          <div className="p-4 space-y-3">
                            <div className="bg-white p-3 border-2 border-green-600">
                              <div className="flex items-center gap-1.5 mb-1">
                                <MapPin className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-xs font-bold text-brand-navy">DESTINATION</span>
                              </div>
                              <p className="text-brand-navy font-bold text-sm">{booking.pickup_location}</p>
                            </div>

                            <div className="flex gap-2 text-xs">
                              <div className="bg-white px-3 py-2 flex-1 text-center border border-green-600">
                                <p className="text-brand-navy/60 font-bold mb-0.5">SERVICE</p>
                                <p className="font-bold text-brand-navy">{booking.service_type}</p>
                              </div>
                              <div className="bg-white px-3 py-2 flex-1 text-center border border-green-600">
                                <p className="text-brand-navy/60 font-bold mb-0.5">TIMING</p>
                                <p className="font-bold text-brand-navy">{booking.timing}</p>
                              </div>
                              {booking.distance_km && (
                                <div className="bg-white px-3 py-2 flex-1 text-center border border-green-600">
                                  <p className="text-brand-navy/60 font-bold mb-0.5">DISTANCE</p>
                                  <p className="font-bold text-brand-navy">{booking.distance_km} km</p>
                                </div>
                              )}
                              {booking.estimated_price_low && booking.estimated_price_high && (
                                <div className="bg-green-600 text-white px-3 py-2 flex-1 text-center">
                                  <p className="text-white/70 font-bold mb-0.5">PRIX</p>
                                  <p className="font-bold text-sm">{booking.estimated_price_low}$-{booking.estimated_price_high}$</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </details>
                      );
                    }

                    // Active booking - normal card
                    return (
                      <div
                        key={booking.id}
                        className={`bg-white md:border-3 border-2 rounded-xl md:rounded-none overflow-hidden shadow-lg md:shadow-none transition-all ${
                          booking.status === 'pending' ? 'border-yellow-500' :
                          gpsEnabled && gpsBooking === booking.id ? 'border-brand-red' : 'border-brand-navy'
                        }`}
                      >
                        {/* Header - Compact */}
                        <div className="bg-gradient-to-r from-brand-navy to-brand-navy md:bg-brand-navy text-white px-4 py-3 md:py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-red rounded-full md:rounded-none flex items-center justify-center shadow-md md:shadow-none">
                            <span className="text-white font-bold text-lg">
                              {booking.customer_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-base">{booking.customer_name}</h3>
                            <p className="text-xs text-white/70">{booking.customer_phone}</p>
                          </div>
                        </div>
                        {gpsEnabled && gpsBooking === booking.id && (
                          <div className="flex items-center gap-1.5 bg-brand-red px-2.5 py-1.5 rounded-full md:rounded-none shadow-sm md:shadow-none">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold">GPS</span>
                          </div>
                        )}
                      </div>

                      {/* Content - Compact */}
                      <div className="p-4 space-y-3">
                        {/* Location */}
                        <div className="bg-brand-gray p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-red" />
                            <span className="text-xs font-bold text-brand-navy">DESTINATION</span>
                          </div>
                          <p className="text-brand-navy font-bold text-sm">{booking.pickup_location}</p>
                        </div>

                        {/* Info - Inline with Price */}
                        <div className="flex gap-2 text-xs">
                          <div className="bg-brand-navy/5 px-3 py-2 flex-1 text-center">
                            <p className="text-brand-navy/60 font-bold mb-0.5">SERVICE</p>
                            <p className="font-bold text-brand-navy">{booking.service_type}</p>
                          </div>
                          <div className="bg-brand-navy/5 px-3 py-2 flex-1 text-center">
                            <p className="text-brand-navy/60 font-bold mb-0.5">TIMING</p>
                            <p className="font-bold text-brand-navy">{booking.timing}</p>
                          </div>
                          {booking.distance_km && (
                            <div className="bg-brand-navy/5 px-3 py-2 flex-1 text-center">
                              <p className="text-brand-navy/60 font-bold mb-0.5">DISTANCE</p>
                              <p className="font-bold text-brand-navy">{booking.distance_km} km</p>
                            </div>
                          )}
                          {booking.estimated_price_low && booking.estimated_price_high && (
                            <div className="bg-brand-red text-white px-3 py-2 flex-1 text-center">
                              <p className="text-brand-navy/60 font-bold mb-0.5 text-white/70">PRIX</p>
                              <p className="font-bold text-sm">{booking.estimated_price_low}$-{booking.estimated_price_high}$</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {booking.status === 'pending' ? (
                          // Accept/Refuse for pending bookings
                          <div className="grid grid-cols-2 gap-2 md:gap-2">
                            <Button
                              onClick={() => handleAcceptBooking(booking.id)}
                              className="bg-green-600 hover:bg-green-700 active:scale-95 md:active:scale-100 text-white !border-0 py-4 md:py-4 rounded-lg md:rounded-none shadow-md md:shadow-none transition-transform"
                            >
                              <span className="font-bold text-sm">✓ Accepter</span>
                            </Button>
                            <Button
                              onClick={() => handleRefuseBooking(booking.id)}
                              className="bg-gray-600 hover:bg-gray-700 active:scale-95 md:active:scale-100 text-white !border-0 py-4 md:py-4 rounded-lg md:rounded-none shadow-md md:shadow-none transition-transform"
                            >
                              <span className="font-bold text-sm">✗ Refuser</span>
                            </Button>
                          </div>
                        ) : (
                          // Normal actions for assigned bookings
                          <div className="grid grid-cols-4 gap-2">
                            <Button
                              asChild
                              className="bg-brand-navy hover:bg-brand-navy/90 text-white !border-0 py-5 flex-col gap-1"
                            >
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${booking.pickup_lat},${booking.pickup_lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Navigation className="w-5 h-5" />
                                <span className="text-xs font-bold">Nav</span>
                              </a>
                            </Button>
                            <Button
                              asChild
                              className="bg-white hover:bg-brand-gray text-brand-navy border-2 border-brand-navy py-5 flex-col gap-1"
                            >
                              <a href={`tel:${booking.customer_phone}`}>
                                <Phone className="w-5 h-5" />
                                <span className="text-xs font-bold">Call</span>
                              </a>
                            </Button>
                            <Button
                              onClick={() => toggleGpsTracking(booking.id)}
                              className={`py-3 ${
                                gpsEnabled && gpsBooking === booking.id
                                  ? 'bg-brand-red hover:bg-brand-red/90 text-white !border-0'
                                  : 'bg-brand-red/10 hover:bg-brand-red/20 text-brand-red border-2 border-brand-red'
                              }`}
                            >
                              <span className="text-xs font-bold">
                                {gpsEnabled && gpsBooking === booking.id ? 'Stop GPS' : 'Start GPS'}
                              </span>
                            </Button>
                            <Button
                              onClick={() => handleCompleteBooking(booking.id)}
                              className="bg-green-600 hover:bg-green-700 text-white !border-0 py-3"
                            >
                              <span className="text-xs font-bold">Done</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {bookings.length > bookingsPerPage && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="bg-brand-navy text-white disabled:opacity-50 px-4 py-2 text-sm font-bold shadow-3d"
                  >
                    ← Précédent
                  </Button>
                  <span className="text-brand-navy font-bold text-sm px-4">
                    Page {currentPage} / {Math.ceil(bookings.length / bookingsPerPage)}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(bookings.length / bookingsPerPage), p + 1))}
                    disabled={currentPage >= Math.ceil(bookings.length / bookingsPerPage)}
                    className="bg-brand-navy text-white disabled:opacity-50 px-4 py-2 text-sm font-bold shadow-3d"
                  >
                    Suivant →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
