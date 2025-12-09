"use client";

import { useState } from "react";
import { Menu, X, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { href: "#services", labelKey: "nav.services" },
    { href: "#estimator", labelKey: "nav.estimator", highlight: true },
    { href: "#how-it-works", labelKey: "nav.howItWorks" },
    { href: "#testimonials", labelKey: "nav.testimonials" },
    { href: "#faq", labelKey: "nav.faq" },
    { href: "#contact", labelKey: "nav.contact" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-brand-navy hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-navy flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <span className="font-bold text-brand-red text-sm tracking-wide">REMORQUAGE</span>
                <span className="font-bold text-brand-navy text-lg block -mt-1 tracking-tight">MONT RAPIDO</span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors uppercase tracking-wide ${
                    link.highlight
                      ? "flex items-center gap-1 bg-brand-red text-white px-3 py-1.5 hover:bg-brand-red-dark"
                      : "text-brand-navy hover:text-brand-red"
                  }`}
                >
                  {link.highlight && <Calculator className="w-3.5 h-3.5" />}
                  {t(link.labelKey)}
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <Button
                asChild
                className="bg-brand-red text-white border-2 border-brand-navy font-bold uppercase tracking-wide shadow-3d transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-3d-sm"
              >
                <a href="#book">{t("nav.requestTow")}</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile App Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden bg-gradient-to-r from-brand-navy to-brand-navy shadow-lg safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo - Compact */}
          <a href="#" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-red flex items-center justify-center rounded-md shadow-md">
              <span className="text-white font-bold text-base">R</span>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-bold text-white text-[10px] tracking-wider leading-tight">REMORQUAGE</span>
              <span className="font-bold text-brand-red text-xs leading-tight tracking-tight">MONT RAPIDO</span>
            </div>
          </a>

          {/* Language Toggle + Menu Button */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              className="p-2 rounded-lg bg-white/10 text-white active:scale-95 transition-transform"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-brand-navy/95 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Content */}
          <div className="relative h-full flex flex-col pt-20 pb-24 px-6 overflow-y-auto">
            {/* Navigation Links */}
            <div className="space-y-1 flex-1">
              {navLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`block py-4 px-5 text-base font-bold uppercase tracking-wide rounded-xl transition-all active:scale-95 ${
                    link.highlight
                      ? "bg-brand-red text-white flex items-center justify-between shadow-md"
                      : "text-white bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => setIsOpen(false)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="flex items-center gap-3">
                    {link.highlight && <Calculator className="w-5 h-5" />}
                    {t(link.labelKey)}
                  </span>
                  {link.highlight && (
                    <span className="text-[10px] bg-white text-brand-red px-2 py-1 rounded-full font-bold">
                      {t("nav.new")}
                    </span>
                  )}
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-6 space-y-3">
              <Button
                asChild
                className="w-full h-14 bg-brand-red text-white font-bold uppercase tracking-wide text-base rounded-xl shadow-lg active:scale-95 transition-transform"
              >
                <a href="#book" onClick={() => setIsOpen(false)}>
                  {t("nav.requestTow")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile App Safe Area Styling */}
      <style jsx global>{`
        @media (max-width: 767px) {
          .safe-area-top {
            padding-top: max(env(safe-area-inset-top), 0px);
          }

          /* Prevent body scroll when menu is open */
          ${isOpen ? 'body { overflow: hidden; }' : ''}
        }
      `}</style>
    </>
  );
};

export default Navbar;
