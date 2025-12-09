"use client";

import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import { siteConfig } from "@/constants/site";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { href: "#services", labelKey: "nav.services" },
    { href: "#how-it-works", labelKey: "nav.howItWorks" },
    { href: "#testimonials", labelKey: "nav.testimonials" },
    { href: "#faq", labelKey: "nav.faq" },
    { href: "#book", labelKey: "nav.requestTow" },
  ];

  const services = [
    "services.emergency",
    "services.flatbed",
    "services.roadside",
    "services.battery",
    "services.lockout",
    "services.recovery",
  ];

  return (
    <footer id="contact" className="bg-brand-navy text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand-red flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <span className="font-bold text-brand-red text-sm tracking-wide">REMORQUAGE</span>
                <span className="font-bold text-white text-lg block -mt-1 tracking-tight">MONT RAPIDO</span>
              </div>
            </div>
            <p className="text-white/70 text-sm mb-6">
              {t("footer.description")}
            </p>
            <div className="flex gap-4">
              <a
                href={siteConfig.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-2 border-white/20 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-2 border-white/20 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wide text-white">{t("footer.quickLinks")}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-brand-red transition-colors text-sm"
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wide text-white">{t("footer.services")}</h3>
            <ul className="space-y-3">
              {services.map((serviceKey) => (
                <li key={serviceKey}>
                  <span className="text-white/70 text-sm">{t(serviceKey)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wide text-white">{t("footer.contactUs")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-white/70">{t("footer.emergency247")}</div>
                  <a href={`tel:${siteConfig.phone}`} className="font-bold hover:text-brand-red transition-colors">
                    {siteConfig.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-white/70">{t("footer.email")}</div>
                  <a href={`mailto:${siteConfig.email}`} className="font-bold hover:text-brand-red transition-colors">
                    {siteConfig.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-white/70">{t("footer.serviceZone")}</div>
                  <span className="font-bold">Montréal + 50 km</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-white/70">{t("footer.hours")}</div>
                  <span className="font-bold">{t("footer.hoursValue")}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} {siteConfig.name}. {t("footer.rights")}
          </p>
          <div className="flex gap-6 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">{t("footer.privacy")}</a>
            <a href="#" className="hover:text-white transition-colors">{t("footer.terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
