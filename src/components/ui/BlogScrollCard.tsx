import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { BlogPost } from "@/types/content";

/** Tall card for sideways-scrolling rows (image on top, text below). */
export function BlogScrollCard({
  post,
  basePath = "/blog",
  ctaLabel = "Read article",
}: {
  post: BlogPost;
  basePath?: string;
  ctaLabel?: string;
}) {
  return (
    <Link
      href={`${basePath}/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/20 bg-white transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)]"
    >
      <div className="relative aspect-[3/2] overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(min-width: 640px) 340px, 300px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-5 px-6 py-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            {post.category}
          </span>
          <h2 className="mb-3 mt-2.5 font-serif text-[22px] font-medium leading-snug text-teal">
            {post.title}
          </h2>
          <p className="line-clamp-4 text-sm leading-relaxed text-ink-muted">
            {post.excerpt}
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 border-b border-teal pb-1 text-teal">
          <span className="text-xs font-semibold uppercase tracking-[0.1em]">
            {ctaLabel}
          </span>
          <ArrowRight
            size={16}
            strokeWidth={2}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}
