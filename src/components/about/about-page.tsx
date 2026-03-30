import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

/** Editable copy: aligns with docs-private/organization-profile.md; vision/mission/values are placeholders until official wording is provided. */
const ABOUT_COPY = {
  tagline:
    "Official profile of the Indonesian Association of Health Informatics—identity, programs, and public resources.",
  intro:
    "This platform communicates IAHI’s identity, governance, activities, and public resources in a professional, accessible format for members, partners, and the wider public.",
  overviewLead:
    "The Indonesian Association of Health Informatics (IAHI) is a professional organization that brings together individuals and institutions interested in Health Informatics in Indonesia.",
  history:
    "IAHI was established on November 10, 2005, in Jakarta as an independent and non-profit organization. All organizational income is dedicated to supporting work programs and institutional development activities.",
  disciplines: [
    "medicine",
    "public health",
    "information technology",
    "social sciences",
    "and other related disciplines",
  ] as const,
  membership:
    "Over time, IAHI has developed into a structured organization with institutional and individual membership models, including categories based on status and contribution to the advancement of Health Informatics.",
  vision:
    "A trusted national hub where health informatics professionals and institutions collaborate to improve care, policy, and population outcomes through responsible use of data and technology.",
  mission:
    "IAHI fosters communication, scientific development, and practical collaboration across disciplines; supports capacity building and standards-aware implementation; and represents Indonesian perspectives in national and global health informatics dialogues.",
  values: [
    {
      label: "Integrity",
      text: "Transparent, ethical stewardship of information and institutional trust.",
    },
    {
      label: "Collaboration",
      text: "Open partnership across medicine, public health, IT, and social sciences.",
    },
    {
      label: "Excellence",
      text: "Rigorous, evidence-informed approaches to education, research, and practice.",
    },
  ] as const,
  engagement:
    "IAHI actively contributes to national and international forums to strengthen global discourse in Health Informatics. Notable examples include participation in the Indonesian Health Informatics Forum (FIKI) in 2015 and 2023, which supports knowledge exchange, professional networking, and collaborative growth.",
  regional:
    "As a national organization, IAHI also supports the establishment of regional branches across provinces and other regions in Indonesia to broaden impact and outreach.",
  governance:
    "Governance structure, board oversight, committees, and working groups are organized to guide programs, membership, and partnerships. Detailed organizational charts and statutes may be published here as they are finalized.",
} as const;

function picsumWide(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1400/780`;
}

function picsumThumb(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/400`;
}

function PhilosophyRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 border-t border-border/60 py-8 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,11rem)_1fr] md:items-start md:gap-10",
      )}
    >
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="text-sm leading-relaxed text-muted-foreground md:text-base">
        {children}
      </div>
    </div>
  );
}

export function AboutPage() {
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

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 lg:px-0 lg:pt-14 lg:pb-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: brand + nav — sticky on large screens */}
          <aside className="lg:col-span-3">
            <div className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
              <div className="flex items-start gap-4">
                <div className="shrink-0 overflow-hidden rounded-xl bg-muted/50 p-2">
                  <img
                    src={picsumThumb("iahi-about-mark")}
                    alt=""
                    className="size-14 rounded-lg object-cover sm:size-16"
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    IAHI
                  </p>
                  <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {ABOUT_COPY.tagline}
                  </p>
                </div>
              </div>
              <Link
                to="/contact-us"
                className="group inline-flex min-h-10 w-fit items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
              >
                Contact us
                <ArrowUpRightIcon
                  className="size-4 shrink-0 transition-transform group-hover:translate-x-px group-hover:-translate-y-px motion-reduce:transition-none"
                  aria-hidden
                />
              </Link>
            </div>
          </aside>

          {/* Right: long-form content */}
          <div className="lg:col-span-9">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-48px" }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: reduceMotion ? 0 : 0.06,
                  },
                },
              }}
            >
              <motion.header variants={fadeUp}>
                <h1 className="font-open-sans text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                  About us
                </h1>
              </motion.header>

              <motion.div
                variants={fadeUp}
                className="mt-12 overflow-hidden border border-border/50"
              >
                <img
                  src={picsumWide("iahi-about-hero")}
                  alt=""
                  className="aspect-21/9 w-full object-cover grayscale-[0.2] sm:aspect-2/1 dark:grayscale-[0.35]"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 space-y-6 text-base leading-relaxed text-foreground"
              >
                <p className="text-muted-foreground">{ABOUT_COPY.intro}</p>
                <p>{ABOUT_COPY.overviewLead}</p>
              </motion.div>

              <motion.section
                variants={fadeUp}
                className="mt-14"
                aria-labelledby="about-history"
              >
                <h2
                  id="about-history"
                  className="font-open-sans text-2xl font-medium text-foreground sm:text-3xl"
                >
                  History &amp; legal form
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {ABOUT_COPY.history}
                </p>
              </motion.section>

              <motion.section
                variants={fadeUp}
                className="mt-14"
                aria-labelledby="about-who"
              >
                <h2
                  id="about-who"
                  className="font-open-sans text-2xl font-medium text-foreground sm:text-3xl"
                >
                  Who we unite
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  IAHI was formed as a platform for communication,
                  collaboration, and scientific development among professionals
                  from diverse backgrounds, including:
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-base text-foreground">
                  {ABOUT_COPY.disciplines.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </motion.section>

              <motion.section
                variants={fadeUp}
                className="mt-14"
                aria-labelledby="about-membership"
              >
                <h2
                  id="about-membership"
                  className="font-open-sans text-2xl font-medium text-foreground sm:text-3xl"
                >
                  Membership
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {ABOUT_COPY.membership}
                </p>
              </motion.section>

              <motion.section
                variants={fadeUp}
                className="mt-14"
                aria-labelledby="about-vision-mission"
              >
                <h2
                  id="about-vision-mission"
                  className="font-open-sans text-2xl font-medium text-foreground sm:text-3xl"
                >
                  Vision, mission &amp; values
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Replace with official IAHI wording when available.
                </p>
                <div className="mt-10 border-t border-border/60">
                  <PhilosophyRow label="Vision">
                    <p>{ABOUT_COPY.vision}</p>
                  </PhilosophyRow>
                  <PhilosophyRow label="Mission">
                    <p>{ABOUT_COPY.mission}</p>
                  </PhilosophyRow>
                  {ABOUT_COPY.values.map((v) => (
                    <PhilosophyRow key={v.label} label={v.label}>
                      <p>{v.text}</p>
                    </PhilosophyRow>
                  ))}
                </div>
              </motion.section>

              <motion.section
                variants={fadeUp}
                className="mt-14"
                aria-labelledby="about-engagement"
              >
                <h2
                  id="about-engagement"
                  className="font-open-sans text-2xl font-medium text-foreground sm:text-3xl"
                >
                  National &amp; international engagement
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {ABOUT_COPY.engagement}
                </p>
              </motion.section>

              <motion.section
                variants={fadeUp}
                className="mt-14"
                aria-labelledby="about-regional"
              >
                <h2
                  id="about-regional"
                  className="font-open-sans text-2xl font-medium text-foreground sm:text-3xl"
                >
                  Regional reach
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {ABOUT_COPY.regional}
                </p>
              </motion.section>

              <motion.section
                variants={fadeUp}
                className="mt-14"
                aria-labelledby="about-governance"
              >
                <h2
                  id="about-governance"
                  className="font-open-sans text-2xl font-medium text-foreground sm:text-3xl"
                >
                  Governance
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {ABOUT_COPY.governance}
                </p>
              </motion.section>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
