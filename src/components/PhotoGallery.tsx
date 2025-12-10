"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "@/components/Lightbox";

type PhotoItem = { file: string; caption?: string };

type Props = {
  photos: PhotoItem[];
  photoBase: string;
  title: string;
};

export function PhotoGallery({ photos, photoBase, title }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const lightboxImages = photos.map((p) => ({
    src: `/photos/${photoBase}/${p.file}`,
    caption: p.caption ?? title,
  }));

  const handleOpen = (idx: number) => {
    setActiveIndex(idx);
    setIsOpen(true);
  };

  return (
    <>
      <section className="mb-6 space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          圖片
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {photos.map((photo, idx) => (
            <button
              key={photo.file + idx}
              type="button"
              onClick={() => handleOpen(idx)}
              className="group w-full overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 transition hover:-translate-y-[1px] hover:border-blue-500"
            >
              <Image
                src={`/photos/${photoBase}/${photo.file}`}
                alt={photo.caption ?? title}
                width={1600}
                height={900}
                className="h-full w-full object-cover"
              />
              {photo.caption && (
                <div className="px-3 py-2 text-xs text-gray-400">
                  {photo.caption}
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      <Lightbox
        isOpen={isOpen}
        initialIndex={activeIndex}
        images={lightboxImages}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
