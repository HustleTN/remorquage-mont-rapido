export const siteConfig = {
  name: "Remorquage Mont Rapido",
  description: "Service de remorquage rapide et fiable 24/7. Assistance routière professionnelle à Montréal et ses environs.",
  url: "https://remorquagemontrapido.ca",
  phone: "+1 (514) 000-0000",
  email: "info@remorquagemontrapido.ca",
  address: {
    street: "123 Rue Principale",
    city: "Montréal",
    province: "QC",
    postalCode: "H1A 1A1",
    country: "Canada",
  },
  socialLinks: {
    facebook: "https://facebook.com/remorquagemontrapido",
    instagram: "https://instagram.com/remorquagemontrapido",
  },
  businessHours: {
    weekdays: "24/7",
    weekends: "24/7",
  },
} as const;

export const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
] as const;
