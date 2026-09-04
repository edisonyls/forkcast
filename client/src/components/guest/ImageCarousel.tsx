"use client";

import { useState } from "react";

interface ImageCarouselProps {
  images: string[];
  itemName: string;
  className?: string;
}

export default function ImageCarousel({
  images,
  itemName,
  className = "",
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasImages = images && images.length > 0;
  const hasMultipleImages = images && images.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!hasImages) {
    // Show placeholder when no images
    return (
      <div
        className={`relative grid place-items-center bg-surface-muted ${className}`}
      >
        <p className="fc-stat-label m-0">No photo</p>
      </div>
    );
  }

  return (
    <div className={`group relative bg-surface-muted ${className}`}>
      {/* Main Image */}
      <div className="relative overflow-hidden h-full w-full">
        <img
          src={
            images[currentIndex].startsWith("http") ||
            images[currentIndex].startsWith("data:")
              ? images[currentIndex]
              : `${process.env.NEXT_PUBLIC_API_URL}${images[currentIndex]}`
          }
          alt={`${itemName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-contain"
        />

        {/* Navigation Arrows - Only show if multiple images */}
        {hasMultipleImages && (
          <>
            <button
              onClick={goToPrevious}
              className="fc-icon-button fc-icon-button-inverse absolute left-2 top-1/2 z-10 -translate-y-1/2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Previous image"
            >
              <svg
                className="w-4 h-4 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="fc-icon-button fc-icon-button-inverse absolute right-2 top-1/2 z-10 -translate-y-1/2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Next image"
            >
              <svg
                className="w-4 h-4 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator - Only show if multiple images */}
      {hasMultipleImages && (
        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="fc-carousel-dot"
              data-active={index === currentIndex}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter - Top right corner */}
      {hasMultipleImages && (
        <div className="fc-mono absolute right-2 top-2 z-10 rounded-full bg-ink/60 px-2 py-0.5 text-xs text-text-inverse backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
