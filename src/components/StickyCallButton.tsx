"use client";

import { Phone } from "lucide-react";
import { siteConfig } from "@/constants/site";
import { useLanguage } from "@/contexts/LanguageContext";

const StickyCallButton = () => {
  const { t, language } = useLanguage();

  const smsBody = language === "fr"
    ? "Bonjour, j'ai besoin d'un remorquage. Mon emplacement:"
    : "Hello, I need a tow. My location:";

  return (
    <>
      {/* Mobile App Style - Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-gradient-to-r from-brand-red to-brand-red-dark border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] safe-area-bottom">
        <div className="flex items-stretch h-16">
          {/* Call Button */}
          <a
            href={`tel:${siteConfig.phone}`}
            className="flex-1 flex items-center justify-center gap-2.5 bg-brand-red text-white font-bold uppercase tracking-wide text-sm transition-all active:scale-95 active:brightness-90"
          >
            <Phone className="w-5 h-5" />
            {t("sticky.call")}
          </a>
          {/* Divider */}
          <div className="w-px bg-white/20" />
          {/* SMS/Text Button */}
          <a
            href={`sms:${siteConfig.phone}?body=${encodeURIComponent(smsBody)}`}
            className="flex-1 flex items-center justify-center gap-2.5 bg-brand-red text-white font-bold uppercase tracking-wide text-sm transition-all active:scale-95 active:brightness-90"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
            </svg>
            {t("sticky.text")}
          </a>
        </div>
      </div>

      {/* Mobile App Styling */}
      <style jsx global>{`
        @media (max-width: 767px) {
          /* Mobile app layout */
          body {
            padding-bottom: 64px;
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
          }

          /* Safe area support for notched devices */
          .safe-area-bottom {
            padding-bottom: max(env(safe-area-inset-bottom), 0px);
          }

          /* Mobile app smooth scrolling */
          html {
            scroll-behavior: smooth;
            -webkit-tap-highlight-color: transparent;
          }

          /* Touch feedback */
          * {
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </>
  );
};

export default StickyCallButton;
