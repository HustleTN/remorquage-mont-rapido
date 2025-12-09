"use client";

import Image from "next/image";
import { Phone, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/constants/site";
import heroImage from "@/assets/hero-tow-truck.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center pt-16 md:pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Dépanneuse professionnelle sur l'autoroute"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
        />
        <div className="absolute inset-0 bg-brand-navy/80" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-red px-4 py-2 mb-6">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              {t("hero.badge")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            {t("hero.title1")}
            <br />
            <span className="text-brand-red">{t("hero.title2")}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
            {t("hero.subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="bg-brand-red text-white hover:bg-brand-red-dark border-2 border-white text-lg font-bold uppercase tracking-wide px-8 py-6"
            >
              <a href={`tel:${siteConfig.phone}`}>
                <Phone className="w-5 h-5 mr-2" />
                {t("hero.callNow")}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white text-brand-navy hover:bg-white/90 border-2 border-white text-lg font-bold uppercase tracking-wide px-8 py-6"
            >
              <a href="#book">{t("hero.onlineRequest")}</a>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-red" />
              <span className="text-sm font-medium">{t("hero.avgTime")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-red" />
              <span className="text-sm font-medium">{t("hero.serviceArea")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-red font-bold">5.0</span>
              <span className="text-sm font-medium">{t("hero.reviews")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
