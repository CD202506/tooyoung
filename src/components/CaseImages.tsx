"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "./Lightbox";

type Props = {
  images: string[];
};

export function CaseImages({ images }: Props) {
  const [index, setIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const lightboxImages = images.map((src) => ({ src }));

  return (
    <>
      <section className="space-y-3">
        {images.map((src, idx) => (
          <button
            key={src + idx}
            type="button"
            onClick={() => setIndex(idx)}
            className="block w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 transition hover:opacity-90 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <Image
              src={src}
              alt={`case-image-${idx}`}
              width={1600}
              height={900}
              className="h-auto w-full max-h-[70vh] object-contain bg-black"
            />
          </button>
        ))}
      </section>

      {index !== null && (
        <Lightbox
          isOpen={index !== null}
          images={lightboxImages}
          initialIndex={index}
          onClose={() => setIndex(null)}
        />
      )}
    </>
  );
}
