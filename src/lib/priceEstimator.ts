/**
 * Price Estimator for Remorquage Mont Rapido
 * Calculates towing prices based on multiple factors
 */

export interface PriceEstimate {
  low: number;
  high: number;
  breakdown: {
    basePrice: number;
    distanceCharge: number;
    timeMultiplier: number;
    serviceMultiplier: number;
    total: number;
  };
}

interface PriceFactors {
  distance: number; // in km
  serviceType: string;
  timing?: string; // 'now', '1hour', 'today', 'tomorrow', 'scheduled'
  requestTime?: Date; // When the service is requested
}

// Base pricing configuration
const PRICING = {
  // Base price for showing up
  BASE_PRICE: 75,

  // Price per km
  PRICE_PER_KM: 3.5,

  // Service type multipliers
  SERVICE_MULTIPLIERS: {
    emergency: 1.5, // Emergency towing (accidents, breakdowns)
    flatbed: 1.3, // Flatbed towing (specialty vehicles)
    battery: 0.8, // Battery boost
    roadside: 0.7, // Roadside assistance
    lockout: 0.6, // Car lockout
    recovery: 1.4, // Vehicle recovery
  } as Record<string, number>,

  // Time-based multipliers
  TIME_MULTIPLIERS: {
    // Night time (10 PM - 6 AM)
    NIGHT: 1.4,

    // Weekend (Saturday & Sunday)
    WEEKEND: 1.25,

    // Rush hour (7-9 AM, 4-7 PM on weekdays)
    RUSH_HOUR: 1.15,

    // Holidays (applied separately)
    HOLIDAY: 1.5,

    // Regular hours
    REGULAR: 1.0,
  },

  // Urgency multipliers based on timing
  URGENCY_MULTIPLIERS: {
    now: 1.2, // Right now - highest urgency
    '1hour': 1.1, // Within 1 hour
    today: 1.0, // Today but not urgent
    tomorrow: 0.95, // Tomorrow - slight discount
    scheduled: 0.9, // Scheduled - discount for planning
  } as Record<string, number>,
};

/**
 * Determines time-based multiplier
 */
function getTimeMultiplier(requestTime: Date = new Date()): number {
  const hour = requestTime.getHours();
  const day = requestTime.getDay(); // 0 = Sunday, 6 = Saturday

  let multiplier = PRICING.TIME_MULTIPLIERS.REGULAR;

  // Night time (10 PM - 6 AM)
  if (hour >= 22 || hour < 6) {
    multiplier = Math.max(multiplier, PRICING.TIME_MULTIPLIERS.NIGHT);
  }

  // Weekend
  if (day === 0 || day === 6) {
    multiplier *= PRICING.TIME_MULTIPLIERS.WEEKEND;
  }

  // Rush hour on weekdays
  if (day >= 1 && day <= 5) {
    if ((hour >= 7 && hour < 9) || (hour >= 16 && hour < 19)) {
      multiplier = Math.max(multiplier, PRICING.TIME_MULTIPLIERS.RUSH_HOUR);
    }
  }

  return multiplier;
}

/**
 * Calculate price estimate with breakdown
 */
export function calculatePrice(factors: PriceFactors): PriceEstimate {
  const {
    distance,
    serviceType,
    timing = 'now',
    requestTime = new Date(),
  } = factors;

  // 1. Base price
  const basePrice = PRICING.BASE_PRICE;

  // 2. Distance charge
  const distanceCharge = distance * PRICING.PRICE_PER_KM;

  // 3. Service type multiplier
  const serviceMultiplier =
    PRICING.SERVICE_MULTIPLIERS[serviceType] ||
    PRICING.SERVICE_MULTIPLIERS.emergency;

  // 4. Time multiplier (night, weekend, rush hour)
  const timeMultiplier = getTimeMultiplier(requestTime);

  // 5. Urgency multiplier
  const urgencyMultiplier = PRICING.URGENCY_MULTIPLIERS[timing] || 1.0;

  // Calculate total
  const subtotal = (basePrice + distanceCharge) * serviceMultiplier;
  const total = subtotal * timeMultiplier * urgencyMultiplier;

  // Provide range (±10%)
  const low = Math.round(total * 0.9);
  const high = Math.round(total * 1.1);

  return {
    low,
    high,
    breakdown: {
      basePrice,
      distanceCharge: Math.round(distanceCharge),
      timeMultiplier,
      serviceMultiplier,
      total: Math.round(total),
    },
  };
}

/**
 * Get a human-readable explanation of price factors
 */
export function getEstimateExplanation(factors: PriceFactors): string[] {
  const explanations: string[] = [];
  const requestTime = factors.requestTime || new Date();
  const hour = requestTime.getHours();
  const day = requestTime.getDay();

  // Service type
  const serviceNames: Record<string, string> = {
    emergency: 'Remorquage d\'urgence',
    flatbed: 'Remorquage plateau',
    battery: 'Survoltage de batterie',
    roadside: 'Assistance routière',
    lockout: 'Déverrouillage de véhicule',
    recovery: 'Récupération de véhicule',
  };
  explanations.push(`Service: ${serviceNames[factors.serviceType] || 'Standard'}`);

  // Distance
  explanations.push(`Distance: ${factors.distance} km`);

  // Time factors
  if (hour >= 22 || hour < 6) {
    explanations.push('⏰ Tarif de nuit appliqué (22h-6h)');
  }

  if (day === 0 || day === 6) {
    explanations.push('📅 Tarif de fin de semaine appliqué');
  }

  // Urgency
  if (factors.timing === 'now') {
    explanations.push('🚨 Urgence immédiate');
  } else if (factors.timing === 'scheduled') {
    explanations.push('✅ Rabais pour réservation planifiée');
  }

  return explanations;
}
