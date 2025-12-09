"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

// Album structure - each album has max 2 images
const albums = [
  {
    id: 1,
    name: "Flatbed Fleet",
    images: [
      {
        url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=800&fit=crop",
        alt: "Modern flatbed tow truck - Front view",
      },
      {
        url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&h=800&fit=crop",
        alt: "Modern flatbed tow truck - Side view",
      },
    ],
  },
  {
    id: 2,
    name: "Emergency Response",
    images: [
      {
        url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&h=800&fit=crop",
        alt: "Emergency towing in action",
      },
      {
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&h=800&fit=crop",
        alt: "24/7 emergency service",
      },
    ],
  },
  {
    id: 3,
    name: "Heavy Duty",
    images: [
      {
        url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&h=800&fit=crop",
        alt: "Heavy duty towing truck",
      },
      {
        url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=800&fit=crop",
        alt: "Professional equipment",
      },
    ],
  },
];

const PhotoGallery = () => {
  const { t } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentAlbum, setCurrentAlbum] = useState<typeof albums[0] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );

  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Auto-play carousel
  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  // Open lightbox with album
  const openLightbox = (albumId: number) => {
    const album = albums.find((a) => a.id === albumId);
    if (album) {
      setCurrentAlbum(album);
      setCurrentImageIndex(0);
      setIsLightboxOpen(true);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
  };

  // Close lightbox
  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setCurrentAlbum(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "unset";
  };

  // Navigate within album
  const nextImage = () => {
    if (currentAlbum && currentImageIndex < currentAlbum.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, currentImageIndex]);

  return (
    <section id="gallery" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-brand-navy text-white px-4 py-2 text-sm font-bold uppercase tracking-wider mb-4">
            {t("gallery.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-brand-navy">
            {t("gallery.title1")}
            <br />
            <span className="text-brand-red">{t("gallery.title2")}</span>
          </h2>
          <p className="text-brand-navy/70 max-w-2xl mx-auto">
            {t("gallery.subtitle")}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <div
                    className="relative aspect-[4/3] overflow-hidden border-4 border-brand-navy shadow-lg group cursor-pointer"
                    onClick={() => openLightbox(album.id)}
                  >
                    <img
                      src={album.images[0].url}
                      alt={album.images[0].alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/20 transition-colors duration-300" />

                    {/* Click hint overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-brand-red text-white px-4 py-2 text-sm font-bold uppercase tracking-wide">
                        Click to view album
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons - Smaller Size */}
          <Button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-brand-red hover:bg-brand-red-dark text-white border-2 border-white w-8 h-8 p-0 shadow-lg z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-red hover:bg-brand-red-dark text-white border-2 border-white w-8 h-8 p-0 shadow-lg z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? "bg-brand-red w-6"
                    : "bg-brand-navy/30 hover:bg-brand-navy/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-brand-gray border-2 border-brand-navy p-6 md:p-8 text-center">
            <p className="text-brand-navy/80 text-sm md:text-base">
              <span className="font-bold text-brand-red">Note:</span> Ces images sont des exemples.
              Elles seront remplacées par des photos réelles de nos camions et de notre équipe très bientôt!
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && currentAlbum && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-brand-red transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Album Title */}
            <h3 className="text-white text-2xl font-bold mb-4 text-center">
              {currentAlbum.name}
            </h3>

            {/* Image Grid - Shows all album images (max 2) */}
            <div className="grid md:grid-cols-2 gap-4">
              {currentAlbum.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative border-4 ${
                    index === currentImageIndex
                      ? "border-brand-red"
                      : "border-white/30"
                  } transition-all`}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-auto object-contain max-h-[70vh]"
                  />
                  {/* Image indicator */}
                  {currentAlbum.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-brand-navy text-white px-3 py-1 text-sm font-bold">
                      {index + 1} / {currentAlbum.images.length}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation hint */}
            <div className="text-center mt-6 text-white/70 text-sm">
              Press ESC to close • Use arrow keys or click images to navigate
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PhotoGallery;
