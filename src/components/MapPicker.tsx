"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { COMMON_LOCATIONS, COMPANY_LOCATION, calculateDistance } from '@/lib/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

interface MapPickerProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
    distance: number;
  }) => void;
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const initializingRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization from React Strict Mode
    if (!mapContainer.current || map.current || initializingRef.current) return;

    initializingRef.current = true;

    console.log('🗺️ Starting map initialization...');
    console.log('📍 Mapbox token exists:', !!mapboxgl.accessToken);
    console.log('📍 Mapbox token:', mapboxgl.accessToken?.substring(0, 20) + '...');
    console.log('📦 Map container dimensions:', {
      width: mapContainer.current.offsetWidth,
      height: mapContainer.current.offsetHeight,
      clientWidth: mapContainer.current.clientWidth,
      clientHeight: mapContainer.current.clientHeight
    });

    // CRITICAL FIX: Set token explicitly before creating map
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    console.log('🔑 Token explicitly set:', mapboxgl.accessToken.substring(0, 30) + '...');

    // Initialize map centered on Montreal
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [COMPANY_LOCATION.lng, COMPANY_LOCATION.lat],
        zoom: 11
      });

      console.log('✅ Map instance created successfully');
      console.log('🗺️ Map object:', map.current);
    } catch (error) {
      console.error('❌ Error creating map:', error);
      return;
    }

    console.log('⏳ Waiting for map events...');

    // Add error listener
    map.current.on('error', (e) => {
      console.error('❌ MAP ERROR:', e);
      console.error('❌ Error details:', {
        error: e.error,
        message: e.error?.message,
        status: e.error?.status
      });
    });

    // Add ALL map events for debugging
    map.current.on('styledata', () => {
      console.log('🎨 Map style data loaded');
    });

    map.current.on('render', () => {
      console.log('🖼️ Map render event fired');
    });

    map.current.on('sourcedataloading', (e) => {
      console.log('📥 Source data loading:', e.sourceId);
    });

    map.current.on('sourcedata', (e) => {
      console.log('📦 Source data loaded:', e.sourceId, 'isSourceLoaded:', e.isSourceLoaded);
    });

    // Check if map is already loaded (in case events fire immediately)
    try {
      console.log('🔍 Map loaded status:', map.current.loaded());
      console.log('🔍 Map style loaded:', map.current.isStyleLoaded());
    } catch (e) {
      console.warn('⚠️ Could not check style loaded status:', e);
    }

    // Add data loading event to see if tiles are being fetched
    map.current.on('dataloading', (e) => {
      console.log('📡 Data loading event:', e.dataType);
    });

    // Check for network errors
    map.current.on('data', (e) => {
      if (e.dataType === 'style') {
        console.log('✅ Style data received!');
      }
    });

    // Function to initialize map features
    const initializeMapFeatures = () => {
      console.log('🎉 INITIALIZING MAP FEATURES!');
      if (!map.current) return;

      // Add company marker
      console.log('📍 Adding company marker...');
      new mapboxgl.Marker({ color: '#e63946' })
        .setLngLat([COMPANY_LOCATION.lng, COMPANY_LOCATION.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${COMPANY_LOCATION.name}</strong>`))
        .addTo(map.current);

      // Add geocoder AFTER map loads
      console.log('🔍 Creating geocoder...');
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl as any,
        marker: false,
        placeholder: 'Rechercher une adresse...',
        countries: 'ca',
        proximity: { longitude: COMPANY_LOCATION.lng, latitude: COMPANY_LOCATION.lat } as any
      });

      console.log('➕ Adding geocoder to map...');
      map.current.addControl(geocoder);

      // Handle geocoder result
      geocoder.on('result', (e: any) => {
        const { center, place_name } = e.result;
        updateLocation(center[1], center[0], place_name);
      });

      // Mark map as loaded
      console.log('✅ Setting isMapLoaded to true');
      setIsMapLoaded(true);

      // Handle map click
      map.current.on('click', async (e: mapboxgl.MapMouseEvent) => {
        const { lng, lat } = e.lngLat;

        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
          );
          const data = await response.json();
          const address = data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

          updateLocation(lat, lng, address);
        } catch (error) {
          console.error('Geocoding error:', error);
          updateLocation(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      });
    };

    // Try multiple events to initialize map features
    let initialized = false;

    // Primary: load event
    map.current.on('load', () => {
      console.log('🎉 Load event fired!');
      if (!initialized) {
        initialized = true;
        initializeMapFeatures();
      }
    });

    // Fallback: idle event (fires when map finishes loading or rendering)
    map.current.on('idle', () => {
      console.log('⚡ Idle event fired as fallback');
      if (!initialized) {
        initialized = true;
        initializeMapFeatures();
      }
    });

    // Check immediately if already loaded (sometimes happens synchronously)
    setTimeout(() => {
      if (!initialized && map.current && map.current.isStyleLoaded()) {
        console.log('🚀 Map already loaded, initializing immediately');
        initialized = true;
        initializeMapFeatures();
      }
    }, 100);

    // Safety timeout: force initialization after 1 second
    const loadTimeout = setTimeout(() => {
      console.warn('⚠️ TIMEOUT: Forcing map initialization after 1 second');
      if (!initialized) {
        initialized = true;
        initializeMapFeatures();
      }
    }, 1000);

    return () => {
      // Don't cleanup during React Strict Mode double mount
      clearTimeout(loadTimeout);
    };
  }, []);

  const updateLocation = (lat: number, lng: number, address: string) => {
    // Safety check: ensure map is ready
    if (!map.current) {
      console.error('Map not initialized');
      return;
    }

    // Update marker
    if (marker.current) marker.current.remove();
    marker.current = new mapboxgl.Marker({ color: '#1e3a5f' })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Calculate distance from company
    const distance = calculateDistance(
      COMPANY_LOCATION.lat,
      COMPANY_LOCATION.lng,
      lat,
      lng
    );

    // Callback
    onLocationSelect({ address, lat, lng, distance: Math.round(distance) });
    setSelectedLocation(address);
  };

  const handleCommonLocationClick = (location: typeof COMMON_LOCATIONS[0]) => {
    if (!isMapLoaded || !map.current) {
      console.warn('Map not loaded yet');
      return;
    }
    map.current.flyTo({ center: [location.lng, location.lat], zoom: 14 });
    updateLocation(location.lat, location.lng, location.name);
  };

  const handleUseMyLocation = () => {
    if (!isMapLoaded || !map.current) {
      alert("La carte est en cours de chargement, veuillez patienter...");
      return;
    }

    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        // Reverse geocode
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
          );
          const data = await response.json();
          const address = data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

          map.current?.flyTo({ center: [lng, lat], zoom: 15 });
          updateLocation(lat, lng, address);
        } catch (error) {
          console.error('Geocoding error:', error);
          updateLocation(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      },
      (error) => {
        alert("Erreur de géolocalisation: " + error.message);
      }
    );
  };

  return (
    <div className="space-y-3 w-full">
      {/* Use My Location Button */}
      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={!isMapLoaded}
        className="w-full bg-brand-red text-white px-3 py-2 border-2 border-brand-navy font-bold uppercase text-xs hover:bg-brand-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed box-border"
      >
        {isMapLoaded ? '📍 Utiliser ma position' : '⏳ Chargement...'}
      </button>

      {/* Common Locations */}
      <div>
        <label className="block text-xs font-bold uppercase mb-1">Emplacements communs:</label>
        <select
          value={selectedLocation}
          onChange={(e) => {
            const location = COMMON_LOCATIONS.find(l => l.name === e.target.value);
            if (location) handleCommonLocationClick(location);
          }}
          disabled={!isMapLoaded}
          className="w-full border-2 border-brand-navy px-2 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed box-border"
        >
          <option value="">{isMapLoaded ? 'Sélectionner un emplacement...' : 'Chargement...'}</option>
          {COMMON_LOCATIONS.map((loc) => (
            <option key={loc.name} value={loc.name}>{loc.name}</option>
          ))}
        </select>
      </div>

      {/* Map Container */}
      <div className="relative w-full">
        <div
          ref={mapContainer}
          className="w-full h-64 border-4 border-brand-navy box-border"
          style={{ minHeight: '256px' }}
        />
        {!isMapLoaded && (
          <div className="absolute inset-0 bg-brand-navy/10 flex items-center justify-center border-4 border-brand-navy box-border">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-brand-navy font-bold text-sm">Chargement de la carte...</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-brand-navy/70">
        💡 Cliquez sur la carte, recherchez une adresse, ou sélectionnez un emplacement commun
      </p>
    </div>
  );
}
