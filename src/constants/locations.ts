// Company depot/base location
export const DEPOT_LOCATION = {
  name: "Remorquage Mont Rapido - Dépôt",
  address: "Montréal, QC",
  lat: 45.5017,  // Montreal downtown coordinates
  lng: -73.5673,
  description: "Notre base d'opération"
};

// Common service areas
export const SERVICE_AREAS = [
  {
    name: "Montréal",
    center: { lat: 45.5017, lng: -73.5673 },
    radius: 25 // km
  },
  {
    name: "Laval",
    center: { lat: 45.6066, lng: -73.7124 },
    radius: 15
  },
  {
    name: "Longueuil",
    center: { lat: 45.5312, lng: -73.5186 },
    radius: 15
  }
];
