"use client";

import { useState, useMemo } from "react";
import { Calculator, Car, Truck, MapPin, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteConfig } from "@/constants/site";
import { useLanguage } from "@/contexts/LanguageContext";
import MapPicker from "./MapPicker";

// Pricing configuration based on Montreal market research
const PRICING = {
  services: {
    standard: { name: "Remorquage standard", base: 85, icon: "🚗" },
    flatbed: { name: "Remorquage plateau", base: 125, icon: "🚛" },
    battery: { name: "Survoltage batterie", base: 55, icon: "🔋" },
    lockout: { name: "Déverrouillage", base: 75, icon: "🔑" },
    tire: { name: "Changement de pneu", base: 65, icon: "🛞" },
    fuel: { name: "Livraison carburant", base: 65, icon: "⛽" },
    winch: { name: "Extraction (winch)", base: 125, icon: "🪝" },
  },
  vehicleTypes: {
    compact: { name: "Compacte (Civic, Corolla)", multiplier: 1.0 },
    sedan: { name: "Berline (Camry, Accord)", multiplier: 1.0 },
    suv: { name: "VUS (RAV4, CR-V)", multiplier: 1.15 },
    suv_large: { name: "Grand VUS (Suburban, Tahoe)", multiplier: 1.25 },
    pickup: { name: "Camionnette (F-150, Sierra)", multiplier: 1.2 },
    van: { name: "Fourgonnette", multiplier: 1.15 },
    luxury: { name: "Véhicule de luxe", multiplier: 1.35 },
    electric: { name: "Véhicule électrique", multiplier: 1.4 },
    motorcycle: { name: "Motocyclette", multiplier: 0.85 },
  },
  // Per km rate after included distance
  perKm: 4,
  includedKm: 10,
  // Time surcharges
  timeSurcharges: {
    day: { name: "Jour (7h-19h)", surcharge: 0 },
    evening: { name: "Soir (19h-23h)", surcharge: 25 },
    night: { name: "Nuit (23h-7h)", surcharge: 50 },
  },
  // Weekend/holiday surcharge
  weekendSurcharge: 20,
  // Minimum charge
  minimumCharge: 75,
};

const PriceEstimator = () => {
  const { t } = useLanguage();
  const [service, setService] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [distance, setDistance] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [isWeekend, setIsWeekend] = useState(false);
  const [location, setLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
    distance: number;
  } | null>(null);

  const estimate = useMemo(() => {
    // Use location.distance if available, otherwise use the distance state
    const currentDistance = location?.distance || parseFloat(distance) || 0;

    if (!service || !vehicleType || !currentDistance || !timeOfDay) {
      return null;
    }

    const serviceData = PRICING.services[service as keyof typeof PRICING.services];
    const vehicleData = PRICING.vehicleTypes[vehicleType as keyof typeof PRICING.vehicleTypes];
    const timeData = PRICING.timeSurcharges[timeOfDay as keyof typeof PRICING.timeSurcharges];

    // Calculate distance fee
    const extraKm = Math.max(0, currentDistance - PRICING.includedKm);
    const distanceFee = extraKm * PRICING.perKm;

    // Base + distance
    let subtotal = serviceData.base + distanceFee;

    // Apply vehicle multiplier
    subtotal = subtotal * vehicleData.multiplier;

    // Add time surcharge
    subtotal += timeData.surcharge;

    // Add weekend surcharge if applicable
    if (isWeekend) {
      subtotal += PRICING.weekendSurcharge;
    }

    // Apply minimum charge
    const total = Math.max(subtotal, PRICING.minimumCharge);

    // Return a range (±10%)
    const low = Math.round(total * 0.9);
    const high = Math.round(total * 1.1);

    return {
      low,
      high,
      breakdown: {
        base: serviceData.base,
        distance: Math.round(distanceFee),
        vehicleMultiplier: vehicleData.multiplier,
        timeSurcharge: timeData.surcharge,
        weekendSurcharge: isWeekend ? PRICING.weekendSurcharge : 0,
      },
    };
  }, [service, vehicleType, distance, timeOfDay, isWeekend, location]);

  const isFormComplete = service && vehicleType && distance && timeOfDay;

  return (
    <section id="estimator" className="py-20 md:py-32 bg-brand-navy">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block bg-brand-red text-white px-4 py-2 text-sm font-bold uppercase tracking-wider mb-4">
              {t("estimator.badge")}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white">
              {t("estimator.title1")}
              <br />
              <span className="text-brand-red">{t("estimator.title2")}</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              {t("estimator.subtitle")}
            </p>
          </div>

          {/* Calculator Card - Compact Layout */}
          <div className="bg-white border-2 border-brand-navy shadow-3d p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* LEFT COLUMN: Form Fields + Map */}
              <div className="space-y-5">
                {/* Form Fields - Compact Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Service Type */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1 text-brand-navy">
                      <Car className="w-3 h-3 inline mr-1" />
                      {t("estimator.serviceType")} *
                    </label>
                    <Select value={service} onValueChange={setService}>
                      <SelectTrigger className="border-2 border-brand-navy h-9 text-sm">
                        <SelectValue placeholder={t("estimator.selectService")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRICING.services).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.icon} {value.name} - {value.base}$
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vehicle Type */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1 text-brand-navy">
                      <Truck className="w-3 h-3 inline mr-1" />
                      {t("estimator.vehicleType")} *
                    </label>
                    <Select value={vehicleType} onValueChange={setVehicleType}>
                      <SelectTrigger className="border-2 border-brand-navy h-9 text-sm">
                        <SelectValue placeholder={t("estimator.selectVehicle")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRICING.vehicleTypes).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time of Day */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1 text-brand-navy">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {t("estimator.timeOfDay")} *
                    </label>
                    <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                      <SelectTrigger className="border-2 border-brand-navy h-9 text-sm">
                        <SelectValue placeholder={t("estimator.selectTime")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRICING.timeSurcharges).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.name} {value.surcharge > 0 && `(+${value.surcharge}$)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Weekend Checkbox */}
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isWeekend}
                        onChange={(e) => setIsWeekend(e.target.checked)}
                        className="w-4 h-4 border-2 border-brand-navy rounded accent-brand-red"
                      />
                      <span className="text-xs font-medium text-brand-navy">
                        {t("estimator.weekend")} (+{PRICING.weekendSurcharge}$)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Map - Compact */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-brand-navy">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {t("estimator.location")} *
                  </label>
                  <MapPicker
                    onLocationSelect={(loc) => {
                      setLocation(loc);
                      setDistance(loc.distance.toString());
                    }}
                  />
                  {location && (
                    <div className="mt-2 p-2 bg-brand-gray border-l-4 border-brand-red text-xs">
                      <p className="font-bold text-brand-navy">📍 {location.address}</p>
                      <p className="text-brand-navy/70">Distance: {location.distance} km</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Estimation Display */}
              <div className="flex flex-col">
                {estimate && isFormComplete ? (
                  <div className="bg-brand-gray border-2 border-brand-navy p-6">
                    <div className="text-center mb-6">
                      <p className="text-sm font-bold uppercase tracking-wide text-brand-navy/60 mb-2">
                        {t("estimator.result")}
                      </p>
                      <div className="text-4xl md:text-5xl font-bold text-brand-navy">
                        {estimate.low}$ - {estimate.high}$
                      </div>
                      <p className="text-sm text-brand-navy/60 mt-2">
                        *{t("estimator.finalPrice")}
                      </p>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2 text-sm border-t-2 border-brand-navy/10 pt-4">
                      <div className="flex justify-between text-brand-navy">
                        <span>{t("estimator.baseRate")}</span>
                        <span className="font-bold">{estimate.breakdown.base}$</span>
                      </div>
                      {estimate.breakdown.distance > 0 && (
                        <div className="flex justify-between text-brand-navy">
                          <span>{t("estimator.distanceFee")} ({parseInt(distance) - PRICING.includedKm} km × {PRICING.perKm}$/km)</span>
                          <span className="font-bold">{estimate.breakdown.distance}$</span>
                        </div>
                      )}
                      {estimate.breakdown.vehicleMultiplier !== 1 && (
                        <div className="flex justify-between text-brand-navy">
                          <span>{t("estimator.vehicleAdjust")} (×{estimate.breakdown.vehicleMultiplier})</span>
                          <span className="font-bold">{t("estimator.included")}</span>
                        </div>
                      )}
                      {estimate.breakdown.timeSurcharge > 0 && (
                        <div className="flex justify-between text-brand-navy">
                          <span>{t("estimator.timeSurcharge")}</span>
                          <span className="font-bold">+{estimate.breakdown.timeSurcharge}$</span>
                        </div>
                      )}
                      {estimate.breakdown.weekendSurcharge > 0 && (
                        <div className="flex justify-between text-brand-navy">
                          <span>{t("estimator.weekendSurcharge")}</span>
                          <span className="font-bold">+{estimate.breakdown.weekendSurcharge}$</span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-6 flex flex-col gap-3">
                      <Button
                        asChild
                        className="w-full bg-brand-red text-white !border-2 !border-brand-navy font-bold uppercase tracking-wide shadow-3d transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-3d-sm text-sm py-3 focus:outline-none !outline-none !ring-0 !ring-offset-0"
                      >
                        <a href={`tel:${siteConfig.phone}`} className="inline-flex items-center justify-center">
                          {t("estimator.callNow")}
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full bg-white text-brand-navy !border-2 !border-brand-navy font-bold uppercase tracking-wide shadow-3d transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-3d-sm hover:bg-white text-sm py-3 focus:outline-none !outline-none !ring-0 !ring-offset-0"
                      >
                        <a href="#book" className="inline-flex items-center justify-center gap-1">
                          {t("estimator.bookOnline")}
                          <ChevronRight className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-brand-gray border-2 border-brand-navy p-8 flex-1 flex items-center justify-center text-center">
                    <div>
                      <Calculator className="w-12 h-12 text-brand-navy/30 mx-auto mb-4" />
                      <p className="text-sm font-bold text-brand-navy/60 uppercase">
                        {t("estimator.result")}
                      </p>
                      <p className="text-xs text-brand-navy/40 mt-2">
                        Remplissez tous les champs pour voir votre estimation
                      </p>
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="mt-4 flex items-start gap-2 text-xs text-brand-navy/60">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    {t("estimator.disclaimer")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriceEstimator;
