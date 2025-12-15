"use client";

import { publicContentItems } from "@/app/_public/content";

export default function PublicContentCarousel() {
  const items = publicContentItems.filter((c) => c.active);
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden border-b border-neutral-800 bg-neutral-900/80">
      <div className="relative h-10 flex items-center">
        <div className="absolute whitespace-nowrap animate-marquee text-neutral-200 text-base md:text-lg leading-loose">
          {items.map((item) => (
            <span key={item.id} className="mx-12">
              {item.title ? `${item.title}：${item.content}` : item.content}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
