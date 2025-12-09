"use client";

import { Phone, Truck, MapPin, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Phone,
      number: "01",
      titleKey: "how.step1Title",
      descKey: "how.step1Desc",
    },
    {
      icon: Truck,
      number: "02",
      titleKey: "how.step2Title",
      descKey: "how.step2Desc",
    },
    {
      icon: MapPin,
      number: "03",
      titleKey: "how.step3Title",
      descKey: "how.step3Desc",
    },
    {
      icon: CheckCircle,
      number: "04",
      titleKey: "how.step4Title",
      descKey: "how.step4Desc",
    },
  ];

  const stats = [
    { valueKey: "how.stat1Value", labelKey: "how.stat1Label" },
    { valueKey: "how.stat2Value", labelKey: "how.stat2Label" },
    { valueKey: "how.stat3Value", labelKey: "how.stat3Label" },
    { valueKey: "how.stat4Value", labelKey: "how.stat4Label" },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-brand-navy text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-brand-red text-white px-4 py-2 text-sm font-bold uppercase tracking-wider mb-4">
            {t("how.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            {t("how.title1")}
            <br />
            <span className="text-brand-red">{t("how.title2")}</span>
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            {t("how.subtitle")}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-white/5 border-2 border-white/20 p-6 hover:border-brand-red transition-colors group"
            >
              {/* Number */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-brand-red flex items-center justify-center">
                <span className="text-white font-bold text-lg">{step.number}</span>
              </div>

              {/* Icon */}
              <div className="w-16 h-16 border-2 border-white/30 flex items-center justify-center mb-6 group-hover:border-brand-red group-hover:bg-brand-red transition-all">
                <step.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3 tracking-tight">{t(step.titleKey)}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{t(step.descKey)}</p>

              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-white/20" />
              )}
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4 border-2 border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-brand-red mb-1">{t(stat.valueKey)}</div>
              <div className="text-sm text-white/60 uppercase tracking-wide">{t(stat.labelKey)}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/5 border-2 border-white/20 p-6">
            <span className="text-lg font-bold">{t("how.ctaText")}</span>
            <a
              href="#book"
              className="bg-brand-red text-white px-6 py-3 font-bold uppercase tracking-wide hover:bg-brand-red-dark transition-colors border-2 border-white"
            >
              {t("how.ctaButton")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
