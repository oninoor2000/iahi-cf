import { ArrowRightIcon, Building2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@tanstack/react-router";

import { PartnerLogoMarquee } from "@/components/home/partner-logo-marquee";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

const PRIMARY_IMAGE = {
  src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  alt: "Healthcare professionals collaborating in a clinical setting",
};

const SECONDARY_IMAGE = {
  src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
  alt: "Team discussion at a health informatics workspace",
};

const STATS = [
  { value: "20+", label: "Years since 2005" },
  { value: "100+", label: "Members & institutions" },
  { value: "50+", label: "Events & initiatives" },
  { value: "30+", label: "Publications & outputs" },
] as const;

export default function AboutUs() {
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
    <section>
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:pt-14 sm:pb-12 md:pt-20">
        <motion.div
          className="flex flex-col"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            variants={fadeUp}
            className="mt-2 text-center font-open-sans text-3xl leading-tight font-medium text-balance text-foreground sm:mt-4 sm:text-4xl md:text-left lg:text-5xl lg:leading-tight"
          >
            Who We Are
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-center text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base md:text-left md:text-lg lg:max-w-3xl"
          >
            The{" "}
            <span className="font-medium text-foreground">
              Indonesian Association of Health Informatics (IAHI)
            </span>{" "}
            is a professional organization that connects people and institutions
            working in health informatics across Indonesia. Established on{" "}
            <time dateTime="2005-11-10">November 10, 2005</time> in{" "}
            <span className="whitespace-nowrap">Jakarta</span>, IAHI is
            independent and non-profit—dedicated to communication,
            collaboration, and scientific development among professionals in
            medicine, public health, information technology, social sciences,
            and related fields.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 sm:mt-10 lg:mt-12">
            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-8">
              <div className="lg:col-span-7">
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <img
                    src={PRIMARY_IMAGE.src}
                    alt={PRIMARY_IMAGE.alt}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="flex min-h-0 flex-col gap-4 sm:gap-5 lg:col-span-5 lg:h-full lg:min-h-0">
                <Card className="flex shrink-0 flex-col bg-muted/60 p-6! ring-0 transition-[box-shadow,background-color] duration-300 ease-out hover:bg-muted/55 hover:shadow-md sm:p-8! lg:p-10! dark:bg-muted/35 dark:hover:bg-muted/45">
                  <CardHeader className="flex flex-col gap-3 p-0 sm:gap-3.5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out group-hover/card:scale-105 group-hover/card:border-primary/40 group-hover/card:bg-primary/[0.07] group-hover/card:shadow-sm motion-reduce:transition-colors motion-reduce:group-hover/card:scale-100 dark:bg-muted/25 dark:group-hover/card:border-primary/35 dark:group-hover/card:bg-primary/10">
                      <Building2
                        className="size-5 text-muted-foreground transition-[transform,color] duration-300 ease-out group-hover/card:scale-110 group-hover/card:text-primary motion-reduce:transition-colors motion-reduce:group-hover/card:scale-100"
                        aria-hidden
                      />
                    </div>
                    <h3 className="font-heading text-base font-semibold text-card-foreground transition-colors duration-300 ease-out group-hover/card:text-foreground sm:text-lg">
                      Discover more
                    </h3>
                    <CardDescription className="text-sm leading-relaxed sm:text-base">
                      Read about IAHI&apos;s background and history, vision,
                      mission, values, and governance—how we serve members,
                      partners, and the public.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto p-0 pt-1">
                    <Button
                      variant="link"
                      className="h-auto min-h-11 w-full justify-start p-0 text-sm transition-colors duration-300 group-hover/card:text-primary sm:min-h-0 sm:w-auto"
                      asChild
                    >
                      <Link
                        to="/about"
                        className="inline-flex items-center gap-1 py-2 sm:py-0"
                      >
                        About IAHI
                        <ArrowRightIcon className="size-3.5 shrink-0 transition-transform duration-300 ease-out group-hover/card:translate-x-1 motion-reduce:transition-none" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <div className="aspect-4/3 min-h-44 shrink-0 overflow-hidden rounded-lg bg-muted sm:min-h-52 lg:aspect-auto lg:min-h-0 lg:flex-1">
                  <img
                    src={SECONDARY_IMAGE.src}
                    alt={SECONDARY_IMAGE.alt}
                    className="size-full min-h-0 object-cover lg:h-full"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <PartnerLogoMarquee />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 sm:mt-10 md:mt-12">
            <div className="bg-muted/60 px-5 py-8 sm:px-8 sm:py-12 md:px-10 md:py-14 lg:px-12 lg:py-16 dark:bg-muted/35">
              <h3 className="text-center text-xl font-semibold text-balance text-foreground sm:text-left sm:text-2xl md:text-3xl">
                Our Achievement in Numbers
              </h3>
              <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-left sm:text-base md:mt-5 md:max-w-2xl lg:max-w-3xl">
                IAHI contributes to national and international forums—including
                the Indonesian Health Informatics Forum (FIKI) in 2015 and
                2023—and supports regional branches across Indonesia to broaden
                outreach and impact.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-6 md:mt-8 md:grid-cols-4 md:gap-8">
                {STATS.map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <p className="font-open-sans text-2xl font-semibold text-primary tabular-nums sm:text-4xl md:text-5xl">
                      {stat.value}
                    </p>
                    <p className="mt-1.5 text-xs leading-snug text-muted-foreground sm:mt-2 sm:text-sm">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
