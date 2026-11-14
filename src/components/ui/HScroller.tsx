"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Sideways-scrolling row with snap points and prev/next buttons.
 * Wrap each child in an element with a fixed width (e.g. `w-[300px] shrink-0 snap-start`).
 */
export function HScroller({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  function scrollByCards(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full border-2 border-teal text-teal transition-colors hover:bg-teal hover:text-white disabled:pointer-events-none disabled:opacity-30";

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {label}
        </span>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            disabled={!canPrev}
            aria-label="Scroll left"
            className={btn}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            disabled={!canNext}
            aria-label="Scroll right"
            className={btn}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Bleeds to the screen edge so the next card peeks in */}
      <div
        ref={trackRef}
        onScroll={update}
        className="hide-scrollbar -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-2"
        style={{ scrollPaddingInline: "1.5rem" }}
      >
        {children}
      </div>
    </div>
  );
}
