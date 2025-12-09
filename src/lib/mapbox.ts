import mapboxgl from 'mapbox-gl';

// Initialize Mapbox
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
}

// Common Montreal highway exits/locations
export const COMMON_LOCATIONS = [
  { name: "Autoroute 40 Est - Sortie 68 (Décarie)", lat: 45.4935, lng: -73.6842 },
  { name: "Autoroute 40 Ouest - Sortie 60 (Saint-Laurent)", lat: 45.5017, lng: -73.7079 },
  { name: "Autoroute 20 Est - Sortie 60 (Angrignon)", lat: 45.4534, lng: -73.6042 },
  { name: "Autoroute 20 Ouest - Sortie 55 (1re Avenue)", lat: 45.4701, lng: -73.5698 },
  { name: "Autoroute 15 Nord - Sortie 63 (Côte-des-Neiges)", lat: 45.4924, lng: -73.6283 },
  { name: "Autoroute 15 Sud - Sortie 36 (Brossard)", lat: 45.4556, lng: -73.4638 },
  { name: "Autoroute 13 Nord - Sortie 14 (Henri-Bourassa)", lat: 45.5503, lng: -73.7357 },
  { name: "Autoroute 25 Nord - Sortie 7 (Sherbrooke)", lat: 45.5735, lng: -73.5668 },
  { name: "Autoroute 40 - Aéroport Montréal-Trudeau", lat: 45.4706, lng: -73.7408 },
  { name: "Centre-ville Montréal - Rue Sainte-Catherine", lat: 45.5060, lng: -73.5670 },
  { name: "Pont Jacques-Cartier", lat: 45.5195, lng: -73.5344 },
  { name: "Pont Champlain", lat: 45.4630, lng: -73.5155 },
  { name: "Laval - Autoroute 440", lat: 45.5834, lng: -73.7443 },
  { name: "Longueuil - Boulevard Taschereau", lat: 45.5310, lng: -73.4827 },
  { name: "Saint-Laurent - Boulevard Marcel-Laurin", lat: 45.5189, lng: -73.7123 }
];

// Company location (Montreal center - adjust to actual location)
export const COMPANY_LOCATION = {
  lat: 45.5017,
  lng: -73.5673,
  name: "Remorquage Mont Rapido"
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Starting latitude
 * @param lng1 - Starting longitude
 * @param lat2 - Ending latitude
 * @param lng2 - Ending longitude
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
