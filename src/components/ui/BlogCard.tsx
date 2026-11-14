import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { BlogPost } from "@/types/content";

export function BlogCard({
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
      className="flex flex-wrap overflow-hidden rounded-2xl border border-line/20 bg-white transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)]"
    >
      <div className="min-w-[200px] w-[260px] shrink-0 overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          width={600}
          height={400}
          className="h-full min-h-[200px] w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 px-7 py-7">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            {post.category}
          </span>
          <h2 className="mt-2.5 mb-3 font-serif text-2xl font-medium leading-snug text-teal">
            {post.title}
          </h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            {post.excerpt}
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 border-b border-teal pb-1 text-teal">
          <span className="text-xs font-semibold uppercase tracking-[0.1em]">
            {ctaLabel}
          </span>
          <ArrowRight size={16} strokeWidth={2} />
        </div>
      </div>
    </Link>
  );
}
