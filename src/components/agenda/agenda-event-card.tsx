import { CalendarDaysIcon, ExternalLinkIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isExternalHref, type AgendaCard } from "@/lib/agenda-data";

type AgendaEventCardProps = {
  event: AgendaCard;
  /** Override DOM id (defaults to `event.slug`). */
  id?: string;
  className?: string;
};

export function AgendaEventCard({
  event,
  id: idProp,
  className,
}: AgendaEventCardProps) {
  const domId = idProp ?? event.slug;

  return (
    <article
      id={domId}
      className={cn(
        "group/card relative aspect-3/4 overflow-hidden",
        className,
      )}
    >
      <img
        src={event.image.src}
        alt=""
        className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
        loading="lazy"
        decoding="async"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10"
        aria-hidden
      />

      <div className="relative flex h-full min-h-0 flex-col justify-between p-6 sm:p-8">
        <h3 className="text-2xl leading-tight font-medium text-balance text-white sm:text-3xl">
          {event.title}
        </h3>

        <div className="mt-8 flex flex-col gap-4">
          <div>
            <p className="text-lg font-semibold text-white tabular-nums sm:text-xl">
              {event.stat}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/85">
              {event.subtext}
            </p>
          </div>
          {isExternalHref(event.href) ? (
            <Button
              asChild
              variant="outline"
              size="default"
              className="h-auto min-h-10 w-fit border-0 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-100 hover:text-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:hover:text-neutral-900 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-neutral-800 dark:[&_svg]:text-neutral-800"
            >
              <a
                href={event.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                {event.ctaLabel ?? "View details"}
                <ExternalLinkIcon className="shrink-0" aria-hidden />
              </a>
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              size="default"
              className="h-auto min-h-10 w-fit border-0 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-100 hover:text-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:hover:text-neutral-900 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-neutral-800 dark:[&_svg]:text-neutral-800"
            >
              <Link
                to="/agenda"
                hash={event.slug}
                className="inline-flex items-center gap-2"
              >
                {event.ctaLabel ?? "View details"}
                <CalendarDaysIcon className="shrink-0" aria-hidden />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
