"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center border-2 border-brand-navy overflow-hidden">
      <button
        onClick={() => setLanguage("fr")}
        className={`px-3 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors ${
          language === "fr"
            ? "bg-brand-navy text-white"
            : "bg-white text-brand-navy hover:bg-brand-gray"
        }`}
        aria-label="Français"
      >
        FR
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors ${
          language === "en"
            ? "bg-brand-navy text-white"
            : "bg-white text-brand-navy hover:bg-brand-gray"
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
