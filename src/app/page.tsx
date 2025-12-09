import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import PriceEstimator from "@/components/PriceEstimator";
import BookingForm from "@/components/BookingForm";
import Testimonials from "@/components/Testimonials";
import PhotoGallery from "@/components/PhotoGallery";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StickyCallButton from "@/components/StickyCallButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Mobile app layout with header spacing */}
      <main className="md:pt-20 pt-14">
        <Hero />
        <Services />
        <PriceEstimator />
        <HowItWorks />
        <BookingForm />
        <Testimonials />
        <PhotoGallery />
        <FAQ />
      </main>
      <Footer />
      <StickyCallButton />
    </div>
  );
}
