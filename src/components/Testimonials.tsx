"use client";

import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Testimonials = () => {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: "Michel R.",
      location: "Centre-ville",
      rating: 5,
      textKey: "testimonials.1.text",
      serviceKey: "testimonials.1.service",
    },
    {
      name: "Sophie K.",
      location: "Westmount",
      rating: 5,
      textKey: "testimonials.2.text",
      serviceKey: "testimonials.2.service",
    },
    {
      name: "David L.",
      location: "Laval",
      rating: 5,
      textKey: "testimonials.3.text",
      serviceKey: "testimonials.3.service",
    },
    {
      name: "Julie M.",
      location: "Longueuil",
      rating: 5,
      textKey: "testimonials.4.text",
      serviceKey: "testimonials.4.service",
    },
  ];

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-brand-navy text-white px-4 py-2 text-sm font-bold uppercase tracking-wider mb-4">
            {t("testimonials.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-brand-navy">
            {t("testimonials.title1")}
            <br />
            <span className="text-brand-red">{t("testimonials.title2")}</span>
          </h2>
          <p className="text-brand-navy/70 max-w-2xl mx-auto">
            {t("testimonials.subtitle")}
          </p>
        </div>

        {/* Overall Rating */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-brand-red text-brand-red" />
            ))}
          </div>
          <span className="text-2xl font-bold text-brand-navy">4.9/5</span>
          <span className="text-brand-navy/70">{t("testimonials.from")} 500+ {t("testimonials.reviews")}</span>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white border-2 border-brand-navy p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-brand-red mb-4" />

              {/* Text */}
              <p className="text-brand-navy mb-4">&quot;{t(testimonial.textKey)}&quot;</p>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-red text-brand-red" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-brand-navy/10">
                <div>
                  <div className="font-bold text-brand-navy">{testimonial.name}</div>
                  <div className="text-sm text-brand-navy/60">{testimonial.location}</div>
                </div>
                <div className="text-xs bg-brand-gray text-brand-navy px-3 py-1 font-medium">
                  {t(testimonial.serviceKey)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
