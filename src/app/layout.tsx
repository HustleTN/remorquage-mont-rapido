import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "Remorquage Mont Rapido - Service de Remorquage 24/7 Montréal",
  description:
    "Service de remorquage rapide et fiable 24/7 à Montréal et ses environs. Remorquage d'urgence, plateau, survoltage, déverrouillage et assistance routière. Appelez maintenant!",
  keywords:
    "remorquage, dépanneuse, assistance routière, remorquage Montréal, dépannage 24/7, remorquage urgence, survoltage batterie, déverrouillage auto",
  openGraph: {
    title: "Remorquage Mont Rapido - Service de Remorquage 24/7 Montréal",
    description:
      "Service de remorquage rapide et fiable 24/7 à Montréal. Appelez maintenant pour une assistance immédiate!",
    type: "website",
    locale: "fr_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remorquage Mont Rapido - Remorquage 24/7",
    description:
      "Service de remorquage rapide et fiable 24/7 à Montréal. Appelez maintenant!",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Remorquage Mont Rapido",
              description:
                "Service de remorquage et assistance routière 24/7 à Montréal",
              telephone: "+1 (514) 000-0000",
              email: "info@remorquagemontrapido.ca",
              openingHours: "Mo-Su 00:00-24:00",
              priceRange: "$$",
              address: {
                "@type": "PostalAddress",
                streetAddress: "123 Rue Principale",
                addressLocality: "Montréal",
                addressRegion: "QC",
                postalCode: "H1A 1A1",
                addressCountry: "CA",
              },
              serviceType: [
                "Remorquage d'urgence",
                "Remorquage plateau",
                "Assistance routière",
                "Survoltage batterie",
                "Déverrouillage",
                "Récupération de véhicule",
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "500",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'Space Grotesk', sans-serif",
              },
              className: "toast-custom",
              duration: 5000,
            }}
            richColors={false}
          />
        </LanguageProvider>
      </body>
    </html>
  );
}
