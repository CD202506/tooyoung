"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type LightboxImage = { src: string; caption?: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImage[];
  initialIndex: number;
};

export default function Lightbox({
  isOpen,
  onClose,
  images,
  initialIndex,
}: Props) {
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images : []),
    [images],
  );
  const [current, setCurrent] = useState(initialIndex);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCurrent(initialIndex);
  }, [initialIndex, isOpen]);

  const total = safeImages.length;

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, next, onClose, prev]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (delta > 40) prev();
      if (delta < -40) next();
      setTouchStartX(null);
    },
    [next, prev, touchStartX],
  );

  if (!isOpen || safeImages.length === 0) return null;

  const active = safeImages[current] ?? safeImages[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-full max-w-5xl flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={active.src}
          alt={active.caption ?? `lightbox-${current}`}
          width={1600}
          height={900}
          className="h-full max-h-[80vh] w-full rounded-lg object-contain"
          priority
        />
        {active.caption && (
          <div className="rounded-md bg-neutral-900/80 px-3 py-2 text-xs text-neutral-200">
            {active.caption}
          </div>
        )}
        <button
          type="button"
          aria-label="Close"
          className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-lg text-white hover:bg-black"
          onClick={onClose}
        >
          ✕
        </button>
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black"
              onClick={prev}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black"
              onClick={next}
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}
