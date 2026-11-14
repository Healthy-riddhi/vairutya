"use client";

import { useState, useRef, Fragment, TouchEvent, MouseEvent } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export type HeroSlide = {
  image: string;
  /** Optional portrait version shown on phones (recommended 1080x1350). */
  mobileImage?: string;
  alt: string;
  headline?: string;
  subtext?: string;
  buttonLabel?: string;
  buttonLink?: string;
};

const DEFAULT_LINK = "/quiz";

// Used when Strapi has no slides yet (or is unreachable), so the hero is never empty.
const DEFAULT_SLIDES: HeroSlide[] = [
  { image: "https://picsum.photos/id/1080/1920/960", alt: "Botanical wellness scene" },
  { image: "https://picsum.photos/id/292/1920/960", alt: "Natural ingredients flat lay" },
  { image: "https://picsum.photos/id/1024/1920/960", alt: "Calm nature landscape" },
  { image: "https://picsum.photos/id/1040/1920/960", alt: "Forest wellness retreat" },
  { image: "https://picsum.photos/id/1043/1920/960", alt: "Serene outdoor setting" },
  { image: "https://picsum.photos/id/1047/1920/960", alt: "Organic textures" },
  { image: "https://picsum.photos/id/1067/1920/960", alt: "Earthy natural tones" },
];

const SWIPE_THRESHOLD = 50;
const VISIBLE_DOTS = 4;

export function HeroCarousel({ slides: cmsSlides = [] }: { slides?: HeroSlide[] }) {
  const t = useTranslations("Hero");
  const slides = cmsSlides.length > 0 ? cmsSlides : DEFAULT_SLIDES;
  // Portrait banner on phones only when every slide has a phone image (so the height never jumps between slides).
  const portraitOnPhone = slides.every((s) => !!s.mobileImage);
  const [index, setIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);
  const isDragging = useRef(false);
  const moved = useRef(false); // true when the last gesture was a swipe, so it must not open the link

  function goTo(i: number) {
    setIndex((i + slides.length) % slides.length);
  }

  // Touch handlers (mobile)
  function handleTouchStart(e: TouchEvent) {
    moved.current = false;
    dragStartX.current = e.touches[0].clientX;
    dragDeltaX.current = 0;
  }
  function handleTouchMove(e: TouchEvent) {
    if (dragStartX.current === null) return;
    dragDeltaX.current = e.touches[0].clientX - dragStartX.current;
  }
  function handleTouchEnd() {
    resolveDrag();
  }

  // Mouse handlers (desktop drag)
  function handleMouseDown(e: MouseEvent) {
    moved.current = false;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
  }
  function handleMouseMove(e: MouseEvent) {
    if (!isDragging.current || dragStartX.current === null) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
  }
  function handleMouseUp() {
    if (!isDragging.current) return;
    isDragging.current = false;
    resolveDrag();
  }
  function handleMouseLeave() {
    if (!isDragging.current) return;
    isDragging.current = false;
    resolveDrag();
  }

  function resolveDrag() {
    if (Math.abs(dragDeltaX.current) > 5) moved.current = true;
    if (dragDeltaX.current > SWIPE_THRESHOLD) {
      goTo(index - 1);
    } else if (dragDeltaX.current < -SWIPE_THRESHOLD) {
      goTo(index + 1);
    }
    dragStartX.current = null;
    dragDeltaX.current = 0;
  }

  // Windowed dot pagination
  const total = slides.length;
  const half = Math.floor(VISIBLE_DOTS / 2);
  let windowStart = index - half;
  if (windowStart < 0) windowStart = 0;
  if (windowStart > total - VISIBLE_DOTS) windowStart = Math.max(0, total - VISIBLE_DOTS);
  const windowEnd = Math.min(total, windowStart + VISIBLE_DOTS);

  const dotIndices = Array.from(
    { length: windowEnd - windowStart },
    (_, k) => windowStart + k
  );

  // The copy under the banner follows the active slide, with defaults for empty fields.
  const active = slides[index] ?? slides[0];
  const headline = active.headline || t("headline");
  const subtext = active.subtext || t("subtext");
  // The button's label and link go together: a slide supplies both, or the defaults (quiz) apply to both.
  // (The banner image itself still opens the slide's own link.)
  const hasOwnButton = !!(active.buttonLabel && active.buttonLink);
  const buttonLabel = hasOwnButton ? active.buttonLabel! : t("button");
  const buttonLink = hasOwnButton ? active.buttonLink! : DEFAULT_LINK;

  return (
    <div>
      {/* Full-bleed banner */}
      <div
        className={`relative ${portraitOnPhone ? "aspect-[4/5] sm:aspect-[16/8]" : "aspect-[16/8]"} max-h-[626px] w-full cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {slides.map((slide, i) => (
          <Fragment key={`${i}-${slide.image}`}>
            {slide.mobileImage && (
              <Image
                src={slide.mobileImage}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                draggable={false}
                className="object-cover transition-opacity duration-500 sm:hidden"
                style={{ opacity: index === i ? 1 : 0 }}
              />
            )}
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={i === 0 && !slide.mobileImage}
              sizes="100vw"
              draggable={false}
              className={`object-cover transition-opacity duration-500 ${slide.mobileImage ? "hidden sm:block" : ""}`}
              style={{ opacity: index === i ? 1 : 0 }}
            />
          </Fragment>
        ))}

        {/* The whole banner opens this slide's link (the buttons are part of the images) */}
        {active.buttonLink && (
          <Link
            href={active.buttonLink}
            aria-label={active.buttonLabel || active.alt}
            draggable={false}
            onClick={(e) => {
              if (moved.current) e.preventDefault();
              moved.current = false;
            }}
            className="absolute inset-0 z-10 cursor-pointer"
          />
        )}

        {/* Windowed dot navigation */}
        {total > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-2">
            {dotIndices.map((i) => {
              const isActive = i === index;
              const isEdgePeek =
                (i === windowStart && windowStart > 0) ||
                (i === windowEnd - 1 && windowEnd < total);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={t("goToSlide", { n: i + 1 })}
                  aria-current={isActive}
                  className={`pointer-events-auto relative shrink-0 rounded-full transition-all duration-300 before:absolute before:-inset-x-1 before:-inset-y-3 before:content-[''] ${
                    isActive
                      ? "h-2.5 w-7 bg-white"
                      : isEdgePeek
                      ? "h-1.5 w-1.5 bg-white/35"
                      : "h-2.5 w-2.5 bg-white/55 hover:bg-white/75"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Hero copy */}
      <section className="flex flex-col items-center gap-8 px-5 py-20 text-center">
        <div className="flex max-w-[720px] flex-col gap-5">
          <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-teal sm:text-[40px]">
            {headline}
          </h1>
          <p className="text-lg leading-relaxed text-ink-muted">{subtext}</p>
        </div>
        <Link href={buttonLink} className="btn-primary">
          {buttonLabel}
        </Link>
      </section>
    </div>
  );
}
