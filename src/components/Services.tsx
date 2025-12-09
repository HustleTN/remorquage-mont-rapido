"use client";

import { Truck, Car, Battery, Wrench, Key, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Services = () => {
  const { t } = useLanguage();

  const services = [
    { icon: Truck, titleKey: "services.emergency", descKey: "services.emergencyDesc", price: "75$" },
    { icon: Car, titleKey: "services.flatbed", descKey: "services.flatbedDesc", price: "95$" },
    { icon: Battery, titleKey: "services.battery", descKey: "services.batteryDesc", price: "45$" },
    { icon: Wrench, titleKey: "services.roadside", descKey: "services.roadsideDesc", price: "55$" },
    { icon: Key, titleKey: "services.lockout", descKey: "services.lockoutDesc", price: "65$" },
    { icon: Shield, titleKey: "services.recovery", descKey: "services.recoveryDesc", price: "150$" },
  ];

  return (
    <section id="services" className="py-20 md:py-32 bg-brand-gray">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-brand-navy text-white px-4 py-2 text-sm font-bold uppercase tracking-wider mb-4">
            {t("services.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-brand-navy">
            {t("services.title1")}
            <br />
            <span className="text-brand-red">{t("services.title2")}</span>
          </h2>
          <p className="text-brand-navy/70 max-w-2xl mx-auto">
            {t("services.subtitle")}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white border-2 border-brand-navy p-6 shadow-3d transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-3d-sm group"
            >
              <div className="w-14 h-14 bg-brand-red flex items-center justify-center mb-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                <service.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight text-brand-navy">{t(service.titleKey)}</h3>
              <p className="text-brand-navy/60 text-sm mb-4">{t(service.descKey)}</p>
              <div className="flex items-center justify-between pt-4 border-t-2 border-brand-navy/10">
                <span className="font-bold text-brand-red">{t("services.startingAt")} {service.price}</span>
                <a
                  href="#book"
                  className="text-sm font-bold uppercase tracking-wide text-brand-navy hover:text-brand-red transition-colors"
                >
                  {t("services.book")} →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
