"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { Recipe } from "@/types/content";

/** Ask Unsplash for a portrait crop so the photo stays sharp on a tall page. */
function bookPhoto(src: string) {
  try {
    const u = new URL(src);
    if (u.hostname === "images.unsplash.com") {
      u.searchParams.set("w", "1000");
      u.searchParams.set("h", "1350");
      u.searchParams.set("fit", "crop");
      u.searchParams.set("q", "80");
    }
    return u.toString();
  } catch {
    return src;
  }
}

type Moving = { order: Map<number, number>; dir: 1 | -1 };

/**
 * One book, many recipes.
 *
 * `s` = number of leaves turned.
 *  s = 0 → closed (cover only)
 *  s = k → open at recipe k (photo on the left page, write-up on the right)
 *
 * Leaf 0 is the cover. Leaf i (i ≥ 1) carries recipe i-1's write-up on its
 * front and recipe i's photo on its back. The last leaf is never turned.
 */
export function RecipeBook({ recipes }: { recipes: Recipe[] }) {
  const t = useTranslations("Recipes");
  const n = recipes.length;
  const [s, setS] = useState(0);
  const [moving, setMoving] = useState<Moving | null>(null);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touchX = useRef<number | null>(null);

  const goTo = useCallback(
    (target: number) => {
      if (busy.current || target === s || target < 0 || target > n) return;
      const dir: 1 | -1 = target > s ? 1 : -1;
      const order = new Map<number, number>();
      if (dir === 1) {
        for (let i = s; i < target; i++) order.set(i, i - s);
      } else {
        for (let i = s - 1; i >= target; i--) order.set(i, s - 1 - i);
      }
      busy.current = true;
      setMoving({ order, dir });
      setS(target);
      timer.current = setTimeout(
        () => {
          busy.current = false;
          setMoving(null);
        },
        1150 + order.size * 110
      );
    },
    [s, n]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goTo(s + 1);
      if (e.key === "ArrowLeft") goTo(s - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, s]);

  const locked = moving !== null;

  return (
    <div>
      <div
        className="rbook-stage"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (dx < -45) goTo(s + 1);
          else if (dx > 45) goTo(s - 1);
        }}
      >
        <div className="rbook" data-open={s > 0}>
          <span className="rbook-board rbook-board-l" aria-hidden />
          <span className="rbook-board rbook-board-r" aria-hidden />

          {Array.from({ length: n + 1 }, (_, i) => {
            const flipped = s > i;
            const m = moving?.order.get(i);
            const isMoving = m !== undefined;
            const z = isMoving
              ? 100 + (moving!.dir === 1 ? i : n - i)
              : flipped
                ? i + 1
                : n - i + 1;
            const recipe = i > 0 ? recipes[i - 1] : null;
            const nextRecipe = i < n ? recipes[i] : null;
            const frontVisible = s === i;
            const backVisible = s === i + 1;

            return (
              <div
                key={i}
                className="leaf"
                data-flipped={flipped}
                data-flipping={isMoving}
                data-static={i === n}
                data-seen={s >= i}
                style={{
                  zIndex: z,
                  transitionDelay: isMoving ? `${m * 0.11}s` : undefined,
                }}
              >
                {/* Front = right-hand page */}
                <div
                  className={`face face-front ${i === 0 ? "face-cover" : ""}`}
                  inert={!frontVisible}
                  aria-hidden={!frontVisible}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("a")) return;
                    if (i < n) goTo(i + 1);
                  }}
                >
                  {i === 0 ? (
                    <CoverFront />
                  ) : (
                    recipe && <WritePage recipe={recipe} index={i - 1} />
                  )}
                </div>

                {/* Back = left-hand page of the next spread */}
                {nextRecipe && (
                  <div
                    className="face face-back"
                    inert={!backVisible}
                    aria-hidden={!backVisible}
                    onClick={() => goTo(i)}
                  >
                    <PhotoPage recipe={nextRecipe} index={i} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => goTo(s - 1)}
          disabled={s === 0 || locked}
          aria-label={s === 1 ? t("close") : t("prev")}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-teal text-teal transition-colors hover:bg-teal hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>

        {s === 0 ? (
          <button
            type="button"
            onClick={() => goTo(1)}
            disabled={locked}
            className="btn-primary !rounded-full"
          >
            {t("open")}
          </button>
        ) : (
          <div className="flex min-w-[168px] flex-col items-center gap-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {t("progress", { s, n })}
            </span>
            <div className="flex gap-2">
              {recipes.map((r, k) => (
                <button
                  key={r.slug}
                  type="button"
                  onClick={() => goTo(k + 1)}
                  disabled={locked}
                  aria-label={t("goTo", { title: r.title })}
                  aria-current={s === k + 1}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === k + 1
                      ? "w-6 bg-teal"
                      : "w-2 bg-teal/25 hover:bg-teal/50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => goTo(s + 1)}
          disabled={s === n || locked}
          aria-label={s === 0 ? t("open") : t("next")}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-teal text-teal transition-colors hover:bg-teal hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function CoverFront() {
  const t = useTranslations("Recipes");
  return (
    <div className="cover-inner">
      <span className="text-[11px] font-semibold uppercase tracking-[0.4em] text-cream/70">
        Vairutya
      </span>

      <div className="flex flex-col items-center gap-5">
        <span className="h-px w-14 bg-cream/40" />
        <h2 className="text-center font-serif text-[clamp(26px,4.2vw,40px)] font-medium leading-[1.12] text-cream">
          {t("coverLine1")}
          <br />
          {t("coverLine2")}
        </h2>
        <span className="h-px w-14 bg-cream/40" />
        <p className="max-w-[210px] text-center text-[13px] leading-relaxed text-cream/70">
          {t("subtitle")}
        </p>
      </div>

      <span className="cover-cue flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/80">
        {t("coverOpen")}
        <ArrowRight size={14} strokeWidth={2} />
      </span>
    </div>
  );
}

function PhotoPage({ recipe, index }: { recipe: Recipe; index: number }) {
  const t = useTranslations("Recipes");
  return (
    <div className="pg-photo">
      <Image
        src={bookPhoto(recipe.image)}
        alt={recipe.title}
        fill
        sizes="430px"
        className="pg-img object-cover"
      />
      <div className="pg-caption">
        <span className="font-serif text-sm italic">
          {t("fig", { n: String(index + 1).padStart(2, "0"), title: recipe.title })}
        </span>
      </div>
    </div>
  );
}

function WritePage({ recipe, index }: { recipe: Recipe; index: number }) {
  const t = useTranslations("Recipes");
  const rv = (i: number) => ({ "--i": i }) as React.CSSProperties;
  return (
    <div className="pg-text">
      {/* Phones show one page at a time, so the photo rides on this page */}
      <div className="pg-photo-m">
        <Image
          src={bookPhoto(recipe.image)}
          alt={recipe.title}
          fill
          sizes="360px"
          className="object-cover"
        />
      </div>

      <div className="pg-body">
        <span className="pg-ribbon" aria-hidden />

        <div>
          <span
            className="rv block text-[11px] font-semibold uppercase tracking-[0.12em] text-clay"
            style={rv(0)}
          >
            {recipe.tag}
          </span>
          <h2
            className="rv pg-title mb-3 mt-3 font-serif font-medium leading-tight text-teal"
            style={rv(1)}
          >
            {recipe.title}
          </h2>
          <span
            className="rv mb-4 block h-px w-12 bg-clay/60"
            style={rv(2)}
          />
          <p
            className="rv text-sm leading-relaxed text-ink-muted"
            style={rv(3)}
          >
            {recipe.description}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <span
            className="rv flex items-center gap-2 text-xs font-medium text-ink-muted"
            style={rv(4)}
          >
            <Clock size={14} strokeWidth={1.75} />
            {recipe.time}
          </span>
          <Link
            href={`/recipes/${recipe.slug}`}
            className="rv pg-cta relative flex w-fit items-center gap-2 border-b border-teal pb-1 text-teal before:absolute before:-inset-y-3 before:inset-x-0 before:content-['']"
            style={rv(5)}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.1em]">
              {t("view")}
            </span>
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>

        <span
          className="rv absolute bottom-4 right-6 font-serif text-xs italic text-ink-muted/60"
          style={rv(6)}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
