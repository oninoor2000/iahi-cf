import { CalendarDaysIcon, ExternalLinkIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AgendaCard = {
  title: string;
  stat: string;
  subtext: string;
  image: { src: string; alt: string };
  href: string;
  ctaLabel?: string;
};

/** Portrait tiles (≈3:4). Picsum is free, no API key; seed keeps each card stable. */
function picsumAgendaImage(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/1600`;
}

const AGENDA_EVENTS: AgendaCard[] = [
  {
    title: "MEDINFO 2025",
    stat: "Aug 9–13, 2025",
    subtext: 'Taipei, Taiwan · Theme: "Healthcare Smart × Medicine Deep"',
    image: {
      src: picsumAgendaImage("iahi-medinfo-2025"),
      alt: "Conference and event imagery",
    },
    href: "https://medinfo2025.tw/",
    ctaLabel: "View details",
  },
  {
    title: "IAHI National Symposium 2024",
    stat: "Nov 14–15, 2024",
    subtext: "Jakarta · Digital transformation in Indonesian hospitals",
    image: {
      src: picsumAgendaImage("iahi-national-symposium-2024"),
      alt: "Large venue and architecture",
    },
    href: "/agenda",
    ctaLabel: "View details",
  },
  {
    title: "Digital Health Workshop Series",
    stat: "Mar–Jun, 2024",
    subtext: "Hybrid · FHIR, interoperability, and clinical data standards",
    image: {
      src: picsumAgendaImage("iahi-digital-health-workshop"),
      alt: "Technology and workspace",
    },
    href: "/agenda",
    ctaLabel: "View details",
  },
  {
    title: "Regional FHIR Connectathon",
    stat: "Sep 6–8, 2024",
    subtext: "Bandung · Developer and implementer meetup (placeholder)",
    image: {
      src: picsumAgendaImage("iahi-fhir-connectathon"),
      alt: "Collaboration and meeting",
    },
    href: "/agenda",
    ctaLabel: "View details",
  },
  {
    title: "Public Health Informatics Forum",
    stat: "Jul 20, 2024",
    subtext:
      "Online · Population health and surveillance systems (placeholder)",
    image: {
      src: picsumAgendaImage("iahi-public-health-forum"),
      alt: "Urban and modern buildings",
    },
    href: "/agenda",
    ctaLabel: "View details",
  },
  {
    title: "Annual Members Meeting",
    stat: "Dec 7, 2024",
    subtext: "Jakarta · Governance, reports, and 2025 priorities (placeholder)",
    image: {
      src: picsumAgendaImage("iahi-annual-members-2024"),
      alt: "Indoor professional gathering",
    },
    href: "/agenda",
    ctaLabel: "View details",
  },
];

function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function AgendaSection() {
  const reduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.42,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  const stagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.07,
        delayChildren: reduceMotion ? 0 : 0.04,
      },
    },
  };

  return (
    <section aria-labelledby="agenda-heading">
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:pt-14 sm:pb-12 md:pt-20">
        <motion.div
          className="flex flex-col"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          <motion.div variants={fadeUp}>
            <h2
              id="agenda-heading"
              className="text-center font-open-sans text-3xl leading-tight font-medium text-balance text-foreground sm:text-4xl md:text-left lg:text-5xl"
            >
              Agenda
            </h2>
            <p className="mt-3 text-center text-sm text-muted-foreground sm:text-base md:text-left">
              Upcoming and past highlights — conferences, workshops, and member
              gatherings.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {AGENDA_EVENTS.map((event, index) => (
              <motion.div
                key={event.title}
                variants={fadeUp}
                className={cn("min-w-0", index >= 3 && "max-sm:hidden")}
              >
                <article
                  className={cn(
                    "group/card relative aspect-3/4 overflow-hidden",
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
                            <ExternalLinkIcon
                              className="shrink-0"
                              aria-hidden
                            />
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
                            to={event.href}
                            className="inline-flex items-center gap-2"
                          >
                            {event.ctaLabel ?? "View details"}
                            <CalendarDaysIcon
                              className="shrink-0"
                              aria-hidden
                            />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
