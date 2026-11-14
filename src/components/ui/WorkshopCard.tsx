import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Workshop } from "@/types/content";

export function WorkshopCard({ workshop }: { workshop: Workshop }) {
  return (
    <div className="flex w-[clamp(280px,35vw,360px)] shrink-0 flex-col">
      <Link
        href={`/workshops/${workshop.slug}`}
        className="mb-6 block aspect-video overflow-hidden rounded-2xl bg-[#d0cdc5]"
      >
        <Image
          src={workshop.image}
          alt={workshop.title}
          width={680}
          height={380}
          className="h-full w-full object-cover grayscale transition-all duration-700 hover:scale-105 hover:grayscale-0"
        />
      </Link>
      <div className="flex flex-col gap-3 text-center">
        <h3 className="font-display text-[17px] font-bold uppercase tracking-[0.08em] text-teal">
          {workshop.title}
        </h3>
        <p className="text-[15px] leading-snug text-ink-muted">
          {workshop.description}
        </p>
        <div className="flex flex-col items-center gap-3 pt-2">
          <span className="text-[13px] font-medium text-ink-muted">
            {workshop.schedule}
          </span>
          <Link
            href={`/workshops/${workshop.slug}`}
            className="link-underline"
          >
            {workshop.ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
