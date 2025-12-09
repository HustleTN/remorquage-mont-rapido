"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, Clock, Send, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { siteConfig } from "@/constants/site";
import { useLanguage } from "@/contexts/LanguageContext";
import MapPicker from "./MapPicker";
import { calculatePrice, getEstimateExplanation, PriceEstimate } from "@/lib/priceEstimator";

const BookingForm = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    location: "",
    timing: "",
    notes: "",
  });

  // Format Canadian phone number
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);

    // Format as (XXX) XXX-XXXX
    if (limitedDigits.length <= 3) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    } else {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };
  const [location, setLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
    distance: number;
  } | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);

  // Calculate price estimate when relevant fields change
  useEffect(() => {
    console.log('useEffect triggered - location:', location, 'service:', formData.service, 'timing:', formData.timing);

    if (location && formData.service && formData.timing) {
      console.log('✓ All conditions met - Calculating price with:', {
        distance: location.distance,
        service: formData.service,
        timing: formData.timing
      });

      const estimate = calculatePrice({
        distance: location.distance,
        serviceType: formData.service,
        timing: formData.timing,
        requestTime: new Date(),
      });

      console.log('✓ Price estimate calculated:', estimate);
      setPriceEstimate(estimate);
    } else {
      console.log('✗ Price estimate reset - missing:', {
        hasLocation: !!location,
        locationDistance: location?.distance,
        hasService: !!formData.service,
        serviceValue: formData.service,
        hasTiming: !!formData.timing,
        timingValue: formData.timing
      });
      setPriceEstimate(null);
    }
  }, [location, formData.service, formData.timing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast.error("Veuillez sélectionner un emplacement sur la carte");
      return;
    }

    // Validate phone number (must be 10 digits)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      toast.error("Veuillez entrer un numéro de téléphone valide à 10 chiffres");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format phone number with +1 country code for submission
      const formattedPhone = `+1 ${formData.phone}`;

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerPhone: formattedPhone,
          customerEmail: formData.email,
          serviceType: formData.service,
          timing: formData.timing,
          notes: formData.notes,
          pickupLocation: location.address,
          pickupLat: location.lat,
          pickupLng: location.lng,
          distanceKm: location.distance,
          estimatedPriceLow: priceEstimate?.low,
          estimatedPriceHigh: priceEstimate?.high,
        })
      });

      const data = await response.json();

      if (data.success) {
        // Open tracking page in new tab immediately
        if (data.trackingUrl) {
          window.open(data.trackingUrl, '_blank');

          const successMsg = formData.email
            ? "✅ Demande envoyée! Page de suivi ouverte dans un nouvel onglet. Vérifiez aussi votre email!"
            : "✅ Demande envoyée! Page de suivi ouverte dans un nouvel onglet.";

          toast.success(successMsg, {
            duration: 5000,
          });
        } else {
          const successMsg = formData.email
            ? "✅ Demande envoyée! Vérifiez votre email pour le lien de suivi."
            : "✅ Demande envoyée! Nous vous contacterons sous peu.";

          toast.success(successMsg, {
            duration: 5000,
          });
        }

        // Reset form
        setFormData({
          name: "",
          phone: "",
          email: "",
          service: "",
          location: "",
          timing: "",
          notes: "",
        });
        setLocation(null);
      } else {
        throw new Error(data.error || "Erreur lors de la soumission");
      }
    } catch (error: any) {
      toast.error(error.message || "❌ Une erreur est survenue. Veuillez réessayer.", {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="book" className="py-20 md:py-28 bg-brand-gray">
      <div className="container mx-auto px-4">
        {/* Header - Compact */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-brand-navy">
            {t("book.title1")} <span className="text-brand-red">{t("book.title2")}</span>
          </h2>
          <p className="text-brand-navy/70 text-lg">{t("book.subtitle")}</p>
        </div>

        {/* Contact Info - Horizontal Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-5xl mx-auto">
          <div className="bg-white border-2 border-brand-navy p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-red flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs text-brand-navy/60 font-bold uppercase">{t("book.emergencyLine")}</div>
              <a href={`tel:${siteConfig.phone}`} className="font-bold text-brand-navy text-sm">{siteConfig.phone}</a>
            </div>
          </div>
          <div className="bg-white border-2 border-brand-navy p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-navy flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs text-brand-navy/60 font-bold uppercase">{t("book.hours")}</div>
              <div className="font-bold text-brand-navy text-sm">{t("book.hoursValue")}</div>
            </div>
          </div>
          <div className="bg-white border-2 border-brand-navy p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-navy flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs text-brand-navy/60 font-bold uppercase">{t("book.serviceZone")}</div>
              <div className="font-bold text-brand-navy text-sm">{t("book.serviceZoneValue")}</div>
            </div>
          </div>
        </div>

        {/* Main Form - Compact Layout */}
        <div className="bg-white border-4 border-brand-navy max-w-5xl mx-auto">
          <form onSubmit={handleSubmit}>
            {/* Form Grid */}
            <div className="p-8 grid lg:grid-cols-2 gap-8">
              {/* Left Column: Contact + Service + Map */}
              <div className="space-y-5">
                {/* Contact Info */}
                <div className="space-y-3.5">
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={`${t("book.fullName")} *`}
                    className="border-2 border-brand-navy h-10"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-navy font-bold text-sm">
                      +1
                    </span>
                    <Input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="(514) 555-1234 *"
                      className="border-2 border-brand-navy h-10 pl-10"
                      maxLength={14}
                    />
                  </div>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t("book.email")}
                    className="border-2 border-brand-navy h-10"
                  />
                  <Select
                    value={formData.service}
                    onValueChange={(value) => setFormData({ ...formData, service: value })}
                    required
                  >
                    <SelectTrigger className="border-2 border-brand-navy h-10">
                      <SelectValue placeholder={t("book.selectService")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">{t("book.serviceEmergency")}</SelectItem>
                      <SelectItem value="flatbed">{t("book.serviceFlatbed")}</SelectItem>
                      <SelectItem value="battery">{t("book.serviceBattery")}</SelectItem>
                      <SelectItem value="roadside">{t("book.serviceRoadside")}</SelectItem>
                      <SelectItem value="lockout">{t("book.serviceLockout")}</SelectItem>
                      <SelectItem value="recovery">{t("book.serviceRecovery")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.timing}
                    onValueChange={(value) => setFormData({ ...formData, timing: value })}
                    required
                  >
                    <SelectTrigger className="border-2 border-brand-navy h-10">
                      <SelectValue placeholder={t("book.selectWhen")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">{t("book.timeNow")}</SelectItem>
                      <SelectItem value="1hour">{t("book.time1Hour")}</SelectItem>
                      <SelectItem value="today">{t("book.timeToday")}</SelectItem>
                      <SelectItem value="tomorrow">{t("book.timeTomorrow")}</SelectItem>
                      <SelectItem value="scheduled">{t("book.timeScheduled")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Map */}
                <div>
                  <div className="font-bold text-brand-navy text-xs uppercase flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-brand-red" />
                    VOTRE EMPLACEMENT *
                  </div>
                  <MapPicker
                    onLocationSelect={(loc) => {
                      setLocation(loc);
                      setFormData(prev => ({ ...prev, location: loc.address }));
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

              {/* Right Column: Notes + Submit */}
              <div className="space-y-5">
                {/* Price Estimate - Compact Horizontal */}
                {priceEstimate && location ? (
                  <div className="bg-brand-navy p-3 text-white flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-brand-red" />
                      <div>
                        <p className="text-xs font-bold uppercase opacity-80">Estimation</p>
                        <p className="text-2xl font-bold text-brand-red">
                          {priceEstimate.low}$ - {priceEstimate.high}$
                        </p>
                      </div>
                    </div>
                    <details className="group text-right">
                      <summary className="text-xs cursor-pointer hover:text-brand-red transition-colors list-none">
                        <span className="underline">Détails</span>
                      </summary>
                      <div className="absolute right-0 mt-2 bg-white border-2 border-brand-navy p-3 text-brand-navy text-xs space-y-1 shadow-lg z-10 min-w-[250px]">
                        {getEstimateExplanation({
                          distance: location.distance,
                          serviceType: formData.service,
                          timing: formData.timing,
                          requestTime: new Date(),
                        }).map((exp, i) => (
                          <p key={i}>• {exp}</p>
                        ))}
                      </div>
                    </details>
                  </div>
                ) : (
                  <div className="bg-brand-gray border-2 border-brand-navy p-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-brand-navy/30" />
                    <p className="text-xs font-bold text-brand-navy/60">
                      Sélectionnez un emplacement pour voir l'estimation
                    </p>
                  </div>
                )}

                {/* Notes */}
                <details className="group">
                  <summary className="cursor-pointer text-sm font-bold text-brand-navy hover:text-brand-red">
                    + Ajouter des notes (optionnel)
                  </summary>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t("book.notesPlaceholder")}
                    className="border-2 border-brand-navy min-h-[80px] mt-2"
                  />
                </details>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-red text-white hover:bg-brand-red/90 !border-0 font-bold uppercase tracking-wide py-6 text-base focus:outline-none !outline-none !ring-0 !ring-offset-0 shadow-3d transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-3d-sm"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("book.sending")}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Send className="w-5 h-5" />
                      {t("book.submit")}
                    </div>
                  )}
                </Button>
                <p className="text-xs text-brand-navy/60 text-center">🔒 {t("book.terms")}</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
