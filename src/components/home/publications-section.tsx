import { ExternalLinkIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeaturedPublication = {
  title: string;
  summary: string;
  takeaways: readonly string[];
  authors: string;
  venue: string;
  image: { src: string; alt: string };
  href: string;
  readMoreLabel?: string;
};

function picsumCover(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/800`;
}

function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

const FEATURED: FeaturedPublication = {
  title:
    "Interoperability readiness of district hospitals in Indonesia: a FHIR-based readiness assessment",
  summary:
    "A cross-site look at EMR exchange readiness before national digital health scale-up.",
  takeaways: [
    "FHIR profiling surfaces vendor gaps early—before regional go-live locks you in.",
    "Leadership and staffing predict successful document exchange more than licenses alone.",
    "A phased readiness score helps prioritize training, terminologies, and consent workflows.",
  ],
  authors: "A. Wijaya, S. Hartono, et al.",
  venue: "Indonesian Journal of Health Informatics & Policy",
  image: {
    src: picsumCover("iahi-publication-fhir-readiness-2024"),
    alt: "Abstract cover art for health informatics publication",
  },
  href: "/publications",
  readMoreLabel: "Read more",
};

export function PublicationsSection() {
  const reduceMotion = useReducedMotion();
  const pub = FEATURED;

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
    <section className="bg-background" aria-labelledby="publications-heading">
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:pt-14 sm:pb-12 md:pt-20">
        <motion.div
          className="flex flex-col"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          <motion.p
            variants={fadeUp}
            className="text-center text-sm font-medium text-muted-foreground"
          >
            30+ publications &amp; technical reports
          </motion.p>
          <motion.h2
            id="publications-heading"
            variants={fadeUp}
            className="mt-3 text-center font-open-sans text-3xl leading-tight font-medium text-balance text-foreground sm:text-4xl lg:text-5xl"
          >
            From our members&apos; research
          </motion.h2>

          <motion.article
            variants={fadeUp}
            className="mt-10 rounded-xl border border-border/60 bg-card/30 p-6 sm:p-8 lg:p-10"
          >
            <div
              className={cn(
                "grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10",
              )}
            >
              <div className="lg:col-span-3 lg:self-start">
                <div className="rounded-xl bg-muted/50 p-4">
                  <img
                    src={pub.image.src}
                    alt={pub.image.alt}
                    className="aspect-square w-full rounded-lg object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              <div className="lg:col-span-4">
                <h3 className="text-lg leading-snug font-semibold text-foreground sm:text-xl">
                  {pub.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {pub.summary}
                </p>
                <div className="mt-6 border-t border-border/60 pt-6">
                  <p className="font-semibold text-foreground">{pub.authors}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pub.venue}
                  </p>
                </div>
                {isExternalHref(pub.href) ? (
                  <Button
                    asChild
                    variant="outline"
                    className="mt-6 min-h-10 rounded-none"
                  >
                    <a
                      href={pub.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      {pub.readMoreLabel ?? "Read more"}
                      <ExternalLinkIcon
                        className="size-4 shrink-0"
                        aria-hidden
                      />
                    </a>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="mt-6 min-h-10 rounded-none"
                  >
                    <Link
                      to={pub.href}
                      className="inline-flex items-center gap-2"
                    >
                      {pub.readMoreLabel ?? "Read more"}
                    </Link>
                  </Button>
                )}
              </div>

              <div
                className="hidden h-full min-h-px w-px shrink-0 self-stretch bg-border lg:col-span-1 lg:block"
                aria-hidden
              />

              <div className="border-t border-border pt-8 lg:col-span-4 lg:border-t-0 lg:pt-0">
                <h4 className="text-base font-semibold text-foreground">
                  Key takeaways
                </h4>
                <ul
                  className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-foreground sm:text-base"
                  aria-label="Key takeaways from this publication"
                >
                  {pub.takeaways.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.article>

          <motion.div variants={fadeUp} className="mt-10 flex justify-center">
            <Button
              asChild
              variant="ghost"
              className="min-h-10 text-muted-foreground hover:text-foreground"
            >
              <Link to="/publications">View all publications</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
