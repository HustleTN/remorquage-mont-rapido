"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navbar
    "nav.services": "Services",
    "nav.estimator": "Estimation",
    "nav.howItWorks": "Comment ça marche",
    "nav.testimonials": "Avis",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.requestTow": "Demander un remorquage",
    "nav.new": "Nouveau",

    // Hero
    "hero.badge": "Service d'urgence 24/7",
    "hero.title1": "REMORQUAGE",
    "hero.title2": "RAPIDE & FIABLE",
    "hero.subtitle": "En panne sur la route? Nous sommes là pour vous. Service de remorquage professionnel et assistance routière quand vous en avez le plus besoin.",
    "hero.callNow": "Appelez maintenant",
    "hero.onlineRequest": "Demande en ligne",
    "hero.avgTime": "30 Min Temps moyen",
    "hero.serviceArea": "Montréal et environs",
    "hero.reviews": "500+ Avis positifs",

    // Services
    "services.badge": "Nos Services",
    "services.title1": "REMORQUAGE PROFESSIONNEL",
    "services.title2": "& ASSISTANCE ROUTIÈRE",
    "services.subtitle": "Du remorquage d'urgence à l'assistance routière, nous offrons des services complets pour vous garder en sécurité et en mouvement.",
    "services.emergency": "Remorquage d'urgence",
    "services.emergencyDesc": "Réponse rapide 24/7 pour les pannes, accidents et urgences routières.",
    "services.flatbed": "Remorquage plateau",
    "services.flatbedDesc": "Transport sécurisé pour véhicules de luxe, classiques et à faible garde au sol.",
    "services.battery": "Survoltage batterie",
    "services.batteryDesc": "Service rapide de batterie pour vous remettre sur la route rapidement.",
    "services.roadside": "Assistance routière",
    "services.roadsideDesc": "Changement de pneus, livraison de carburant et réparations mineures sur place.",
    "services.lockout": "Déverrouillage",
    "services.lockoutDesc": "Assistance professionnelle de déverrouillage sans endommager votre véhicule.",
    "services.recovery": "Récupération de véhicule",
    "services.recoveryDesc": "Extraction experte de fossés, boue, neige ou situations hors route.",
    "services.startingAt": "À partir de",
    "services.book": "Réserver",

    // Price Estimator
    "estimator.badge": "Estimateur de prix",
    "estimator.title1": "OBTENEZ UNE",
    "estimator.title2": "ESTIMATION INSTANTANÉE",
    "estimator.subtitle": "Calculez le coût approximatif de votre service de remorquage en quelques clics. Prix transparents, sans surprise.",
    "estimator.serviceType": "Type de service",
    "estimator.selectService": "Sélectionner un service",
    "estimator.vehicleType": "Type de véhicule",
    "estimator.selectVehicle": "Sélectionner votre véhicule",
    "estimator.location": "Votre emplacement",
    "estimator.distance": "Distance estimée (km)",
    "estimator.distanceIncluded": "Les premiers 10 km sont inclus dans le tarif de base",
    "estimator.timeOfDay": "Moment de la journée",
    "estimator.selectTime": "Sélectionner le moment",
    "estimator.weekend": "Fin de semaine ou jour férié",
    "estimator.calculate": "Calculer le prix",
    "estimator.result": "Estimation de prix",
    "estimator.finalPrice": "Prix final confirmé par notre répartiteur",
    "estimator.baseRate": "Tarif de base",
    "estimator.distanceFee": "Distance",
    "estimator.vehicleAdjust": "Ajustement véhicule",
    "estimator.included": "Inclus",
    "estimator.timeSurcharge": "Supplément horaire",
    "estimator.weekendSurcharge": "Supplément fin de semaine",
    "estimator.callNow": "Appeler maintenant",
    "estimator.bookOnline": "Réserver en ligne",
    "estimator.disclaimer": "Cette estimation est fournie à titre indicatif seulement. Le prix final peut varier selon les conditions sur place.",

    // How It Works
    "how.badge": "Comment ça marche",
    "how.title1": "DE LA PANNE À LA SOLUTION",
    "how.title2": "EN 4 ÉTAPES",
    "how.subtitle": "Pas de stress, pas de complications. Notre processus est conçu pour vous remettre sur la route rapidement.",
    "how.step1Title": "Appelez-nous",
    "how.step1Desc": "Un simple appel ou une demande en ligne suffit. Notre équipe est disponible 24/7.",
    "how.step2Title": "On arrive",
    "how.step2Desc": "La dépanneuse la plus proche est envoyée immédiatement vers votre position.",
    "how.step3Title": "Suivez en direct",
    "how.step3Desc": "Recevez un lien pour suivre l'arrivée de votre chauffeur en temps réel.",
    "how.step4Title": "C'est réglé",
    "how.step4Desc": "Paiement flexible sur place ou en ligne. Simple, rapide et transparent.",
    "how.stat1Value": "24/7",
    "how.stat1Label": "Disponibilité",
    "how.stat2Value": "25 min",
    "how.stat2Label": "Temps moyen",
    "how.stat3Value": "50 km",
    "how.stat3Label": "Zone couverte",
    "how.stat4Value": "500+",
    "how.stat4Label": "Clients satisfaits",
    "how.ctaText": "Besoin d'aide maintenant?",
    "how.ctaButton": "Demander un remorquage",

    // Booking Form
    "book.badge": "Demande de service",
    "book.title1": "BESOIN D'UN REMORQUAGE?",
    "book.title2": "NOUS SOMMES LÀ 24/7",
    "book.subtitle": "Remplissez le formulaire et nous enverrons un camion à votre emplacement immédiatement.",
    "book.emergencyLine": "Ligne d'urgence",
    "book.hours": "Heures d'ouverture",
    "book.hoursValue": "24 Heures / 7 Jours sur 7",
    "book.serviceZone": "Zone de service",
    "book.serviceZoneValue": "Montréal et environs (50 km)",
    "book.fullName": "Nom complet",
    "book.phone": "Numéro de téléphone",
    "book.email": "Courriel (Optionnel)",
    "book.serviceType": "Type de service",
    "book.when": "Quand",
    "book.location": "Votre emplacement",
    "book.notes": "Notes additionnelles",
    "book.submit": "Envoyer la demande",
    "book.sending": "Envoi en cours...",
    "book.terms": "En soumettant ce formulaire, vous acceptez nos conditions de service.",
    "book.selectService": "Sélectionner un service",
    "book.selectWhen": "Quand avez-vous besoin",
    "book.namePlaceholder": "Jean Dupont",
    "book.phonePlaceholder": "(514) 123-4567",
    "book.emailPlaceholder": "jean@exemple.com",
    "book.locationPlaceholder": "Ex: Autoroute 40 Est, sortie Saint-Laurent",
    "book.notesPlaceholder": "Décrivez votre situation, type de véhicule, etc.",
    "book.serviceEmergency": "Remorquage d'urgence",
    "book.serviceFlatbed": "Remorquage plateau",
    "book.serviceBattery": "Survoltage batterie",
    "book.serviceRoadside": "Assistance routière",
    "book.serviceLockout": "Déverrouillage",
    "book.serviceRecovery": "Récupération de véhicule",
    "book.timeNow": "Maintenant (Urgence)",
    "book.time1Hour": "Dans 1 heure",
    "book.timeToday": "Aujourd'hui",
    "book.timeTomorrow": "Demain",
    "book.timeScheduled": "Planifié (Spécifier)",
    "book.toastTitle": "Demande envoyée!",
    "book.toastDesc": "Nous vous contacterons dans les 5 minutes pour confirmer votre demande de remorquage.",

    // Testimonials
    "testimonials.badge": "Avis",
    "testimonials.title1": "APPROUVÉ PAR",
    "testimonials.title2": "500+ CLIENTS",
    "testimonials.subtitle": "Ne nous croyez pas sur parole. Voici ce que nos clients ont à dire.",
    "testimonials.from": "de",
    "testimonials.reviews": "avis",
    "testimonials.1.text": "Pneu crevé à 2h du matin. Ils sont arrivés en 20 minutes et m'ont remis sur la route rapidement. Service incroyable!",
    "testimonials.1.service": "Assistance routière",
    "testimonials.2.text": "Ma voiture est tombée en panne sur l'autoroute. Le chauffeur était professionnel, courtois et a pris grand soin de mon véhicule.",
    "testimonials.2.service": "Remorquage d'urgence",
    "testimonials.3.text": "La meilleure compagnie de remorquage que j'ai utilisée. Prix justes, réponse rapide et excellente communication.",
    "testimonials.3.service": "Remorquage plateau",
    "testimonials.4.text": "Je me suis enfermée hors de ma voiture. Ils sont venus en 15 minutes et m'ont fait entrer sans aucun dommage. Sauveurs!",
    "testimonials.4.service": "Déverrouillage",

    // FAQ
    "faq.badge": "FAQ",
    "faq.title": "QUESTIONS FRÉQUENTES",
    "faq.subtitle": "Réponses rapides aux questions que vous pourriez avoir sur nos services.",
    "faq.moreQuestions": "Vous avez encore des questions? Nous sommes là pour vous aider 24/7.",
    "faq.callUs": "Appelez",
    "faq.q1": "En combien de temps pouvez-vous arriver?",
    "faq.a1": "Notre temps de réponse moyen est de 30 minutes ou moins dans notre zone de service. Pour les urgences, nous envoyons immédiatement et vous tenons informé de l'heure d'arrivée par téléphone ou texto.",
    "faq.q2": "Quelles zones desservez-vous?",
    "faq.a2": "Nous couvrons toute la région métropolitaine de Montréal plus un rayon de 50 kilomètres. Cela inclut toutes les autoroutes principales, le centre-ville et les banlieues environnantes. Appelez-nous pour confirmer si votre emplacement est dans notre zone de service.",
    "faq.q3": "Combien coûte le remorquage?",
    "faq.a3": "Les prix varient selon le type de service, la distance et l'heure. Le remorquage de base commence à 75$, le plateau à partir de 95$, et l'assistance routière à partir de 45$. Nous fournissons toujours un devis avant d'envoyer.",
    "faq.q4": "Acceptez-vous les réclamations d'assurance?",
    "faq.a4": "Oui, nous travaillons avec tous les principaux fournisseurs d'assurance et pouvons les facturer directement dans la plupart des cas. Nous vous aiderons avec tous les documents nécessaires pour votre réclamation.",
    "faq.q5": "Quels modes de paiement acceptez-vous?",
    "faq.a5": "Nous acceptons l'argent comptant, toutes les cartes de crédit principales (Visa, Mastercard, American Express), Interac et les paiements numériques comme Apple Pay et Google Pay. Le paiement est collecté au moment du service.",
    "faq.q6": "Que dois-je faire en attendant la dépanneuse?",
    "faq.a6": "Restez en sécurité! Allumez vos feux de détresse, déplacez-vous sur l'accotement si possible et restez à l'intérieur de votre véhicule si vous êtes sur une route achalandée. Nous vous tiendrons informé de notre heure d'arrivée.",

    // Gallery
    "gallery.badge": "Notre flotte",
    "gallery.title1": "ÉQUIPEMENT PROFESSIONNEL",
    "gallery.title2": "& ÉQUIPE EXPÉRIMENTÉE",
    "gallery.subtitle": "Découvrez notre flotte moderne de dépanneuses et notre équipe dévouée prête à vous servir 24/7.",

    // Footer
    "footer.description": "Service de remorquage professionnel et assistance routière desservant Montréal et ses environs 24/7.",
    "footer.quickLinks": "Liens rapides",
    "footer.services": "Services",
    "footer.contactUs": "Contactez-nous",
    "footer.emergency247": "Urgence 24/7",
    "footer.email": "Courriel",
    "footer.serviceZone": "Zone de service",
    "footer.hours": "Heures",
    "footer.hoursValue": "24/7 / 365 Jours",
    "footer.rights": "Tous droits réservés.",
    "footer.privacy": "Politique de confidentialité",
    "footer.terms": "Conditions d'utilisation",

    // Sticky Button
    "sticky.call": "Appeler",
    "sticky.text": "Texter",

    // Common
    "common.startingFrom": "À partir de",
  },
  en: {
    // Navbar
    "nav.services": "Services",
    "nav.estimator": "Estimate",
    "nav.howItWorks": "How It Works",
    "nav.testimonials": "Reviews",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.requestTow": "Request a Tow",
    "nav.new": "New",

    // Hero
    "hero.badge": "24/7 Emergency Service",
    "hero.title1": "FAST &",
    "hero.title2": "RELIABLE TOWING",
    "hero.subtitle": "Stuck on the road? We're here for you. Professional towing service and roadside assistance when you need it most.",
    "hero.callNow": "Call Now",
    "hero.onlineRequest": "Online Request",
    "hero.avgTime": "30 Min Avg Time",
    "hero.serviceArea": "Montreal & Surroundings",
    "hero.reviews": "500+ Positive Reviews",

    // Services
    "services.badge": "Our Services",
    "services.title1": "PROFESSIONAL TOWING",
    "services.title2": "& ROADSIDE ASSISTANCE",
    "services.subtitle": "From emergency towing to roadside assistance, we offer comprehensive services to keep you safe and moving.",
    "services.emergency": "Emergency Towing",
    "services.emergencyDesc": "Fast 24/7 response for breakdowns, accidents, and road emergencies.",
    "services.flatbed": "Flatbed Towing",
    "services.flatbedDesc": "Safe transport for luxury, classic, and low-clearance vehicles.",
    "services.battery": "Battery Jump Start",
    "services.batteryDesc": "Quick battery service to get you back on the road fast.",
    "services.roadside": "Roadside Assistance",
    "services.roadsideDesc": "Tire changes, fuel delivery, and minor on-site repairs.",
    "services.lockout": "Lockout Service",
    "services.lockoutDesc": "Professional lockout assistance without damaging your vehicle.",
    "services.recovery": "Vehicle Recovery",
    "services.recoveryDesc": "Expert extraction from ditches, mud, snow, or off-road situations.",
    "services.startingAt": "Starting at",
    "services.book": "Book",

    // Price Estimator
    "estimator.badge": "Price Estimator",
    "estimator.title1": "GET AN",
    "estimator.title2": "INSTANT ESTIMATE",
    "estimator.subtitle": "Calculate the approximate cost of your towing service in just a few clicks. Transparent pricing, no surprises.",
    "estimator.serviceType": "Service Type",
    "estimator.selectService": "Select a service",
    "estimator.vehicleType": "Vehicle Type",
    "estimator.selectVehicle": "Select your vehicle",
    "estimator.location": "Your Location",
    "estimator.distance": "Estimated Distance (km)",
    "estimator.distanceIncluded": "First 10 km included in base rate",
    "estimator.timeOfDay": "Time of Day",
    "estimator.selectTime": "Select time",
    "estimator.weekend": "Weekend or Holiday",
    "estimator.calculate": "Calculate Price",
    "estimator.result": "Price Estimate",
    "estimator.finalPrice": "Final price confirmed by dispatcher",
    "estimator.baseRate": "Base Rate",
    "estimator.distanceFee": "Distance",
    "estimator.vehicleAdjust": "Vehicle Adjustment",
    "estimator.included": "Included",
    "estimator.timeSurcharge": "Time Surcharge",
    "estimator.weekendSurcharge": "Weekend Surcharge",
    "estimator.callNow": "Call Now",
    "estimator.bookOnline": "Book Online",
    "estimator.disclaimer": "This estimate is for reference only. Final price may vary based on site conditions.",

    // How It Works
    "how.badge": "How It Works",
    "how.title1": "FROM BREAKDOWN TO SOLUTION",
    "how.title2": "IN 4 STEPS",
    "how.subtitle": "No stress, no complications. Our process is designed to get you back on the road quickly.",
    "how.step1Title": "Call Us",
    "how.step1Desc": "A simple call or online request is all it takes. Our team is available 24/7.",
    "how.step2Title": "We're On Our Way",
    "how.step2Desc": "The nearest tow truck is dispatched immediately to your location.",
    "how.step3Title": "Track Live",
    "how.step3Desc": "Receive a link to track your driver's arrival in real-time.",
    "how.step4Title": "All Done",
    "how.step4Desc": "Flexible payment on-site or online. Simple, fast, and transparent.",
    "how.stat1Value": "24/7",
    "how.stat1Label": "Availability",
    "how.stat2Value": "25 min",
    "how.stat2Label": "Average Time",
    "how.stat3Value": "50 km",
    "how.stat3Label": "Coverage Area",
    "how.stat4Value": "500+",
    "how.stat4Label": "Happy Customers",
    "how.ctaText": "Need help now?",
    "how.ctaButton": "Request a Tow",

    // Booking Form
    "book.badge": "Service Request",
    "book.title1": "NEED A TOW?",
    "book.title2": "WE'RE HERE 24/7",
    "book.subtitle": "Fill out the form and we'll dispatch a truck to your location immediately.",
    "book.emergencyLine": "Emergency Line",
    "book.hours": "Business Hours",
    "book.hoursValue": "24 Hours / 7 Days a Week",
    "book.serviceZone": "Service Area",
    "book.serviceZoneValue": "Montreal and surroundings (50 km)",
    "book.fullName": "Full Name",
    "book.phone": "Phone Number",
    "book.email": "Email (Optional)",
    "book.serviceType": "Service Type",
    "book.when": "When",
    "book.location": "Your Location",
    "book.notes": "Additional Notes",
    "book.submit": "Send Request",
    "book.sending": "Sending...",
    "book.terms": "By submitting this form, you agree to our terms of service.",
    "book.selectService": "Select a service",
    "book.selectWhen": "When do you need it",
    "book.namePlaceholder": "John Doe",
    "book.phonePlaceholder": "(514) 123-4567",
    "book.emailPlaceholder": "john@example.com",
    "book.locationPlaceholder": "Ex: Highway 40 East, Saint-Laurent exit",
    "book.notesPlaceholder": "Describe your situation, vehicle type, etc.",
    "book.serviceEmergency": "Emergency Towing",
    "book.serviceFlatbed": "Flatbed Towing",
    "book.serviceBattery": "Battery Jump Start",
    "book.serviceRoadside": "Roadside Assistance",
    "book.serviceLockout": "Lockout Service",
    "book.serviceRecovery": "Vehicle Recovery",
    "book.timeNow": "Now (Emergency)",
    "book.time1Hour": "In 1 hour",
    "book.timeToday": "Today",
    "book.timeTomorrow": "Tomorrow",
    "book.timeScheduled": "Scheduled (Specify)",
    "book.toastTitle": "Request Sent!",
    "book.toastDesc": "We will contact you within 5 minutes to confirm your tow request.",

    // Testimonials
    "testimonials.badge": "Reviews",
    "testimonials.title1": "TRUSTED BY",
    "testimonials.title2": "500+ CUSTOMERS",
    "testimonials.subtitle": "Don't just take our word for it. Here's what our customers have to say.",
    "testimonials.from": "from",
    "testimonials.reviews": "reviews",
    "testimonials.1.text": "Flat tire at 2 AM. They arrived in 20 minutes and got me back on the road quickly. Incredible service!",
    "testimonials.1.service": "Roadside Assistance",
    "testimonials.2.text": "My car broke down on the highway. The driver was professional, courteous, and took great care of my vehicle.",
    "testimonials.2.service": "Emergency Towing",
    "testimonials.3.text": "Best towing company I've ever used. Fair prices, quick response, and excellent communication.",
    "testimonials.3.service": "Flatbed Towing",
    "testimonials.4.text": "I locked myself out of my car. They came in 15 minutes and got me in without any damage. Lifesavers!",
    "testimonials.4.service": "Lockout Service",

    // FAQ
    "faq.badge": "FAQ",
    "faq.title": "FREQUENTLY ASKED QUESTIONS",
    "faq.subtitle": "Quick answers to questions you may have about our services.",
    "faq.moreQuestions": "Still have questions? We're here to help 24/7.",
    "faq.callUs": "Call",
    "faq.q1": "How quickly can you arrive?",
    "faq.a1": "Our average response time is 30 minutes or less within our service area. For emergencies, we dispatch immediately and keep you informed of arrival time via phone or text.",
    "faq.q2": "What areas do you serve?",
    "faq.a2": "We cover the entire Montreal metropolitan area plus a 50-kilometer radius. This includes all major highways, downtown, and surrounding suburbs. Call us to confirm if your location is within our service area.",
    "faq.q3": "How much does towing cost?",
    "faq.a3": "Prices vary based on service type, distance, and time. Basic towing starts at $75, flatbed from $95, and roadside assistance from $45. We always provide a quote before dispatching.",
    "faq.q4": "Do you accept insurance claims?",
    "faq.a4": "Yes, we work with all major insurance providers and can bill them directly in most cases. We'll help you with all necessary paperwork for your claim.",
    "faq.q5": "What payment methods do you accept?",
    "faq.a5": "We accept cash, all major credit cards (Visa, Mastercard, American Express), Interac, and digital payments like Apple Pay and Google Pay. Payment is collected at the time of service.",
    "faq.q6": "What should I do while waiting for the tow truck?",
    "faq.a6": "Stay safe! Turn on your hazard lights, move to the shoulder if possible, and stay inside your vehicle if you're on a busy road. We'll keep you informed of our arrival time.",

    // Gallery
    "gallery.badge": "Our Fleet",
    "gallery.title1": "PROFESSIONAL EQUIPMENT",
    "gallery.title2": "& EXPERIENCED TEAM",
    "gallery.subtitle": "Discover our modern fleet of tow trucks and our dedicated team ready to serve you 24/7.",

    // Footer
    "footer.description": "Professional towing service and roadside assistance serving Montreal and surroundings 24/7.",
    "footer.quickLinks": "Quick Links",
    "footer.services": "Services",
    "footer.contactUs": "Contact Us",
    "footer.emergency247": "24/7 Emergency",
    "footer.email": "Email",
    "footer.serviceZone": "Service Area",
    "footer.hours": "Hours",
    "footer.hoursValue": "24/7 / 365 Days",
    "footer.rights": "All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Use",

    // Sticky Button
    "sticky.call": "Call",
    "sticky.text": "Text",

    // Common
    "common.startingFrom": "Starting from",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");

  useEffect(() => {
    // Check localStorage first
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "fr" || saved === "en")) {
      setLanguageState(saved);
      return;
    }

    // Then check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("en")) {
      setLanguageState("en");
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
