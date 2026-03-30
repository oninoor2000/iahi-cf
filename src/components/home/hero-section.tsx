import { CalendarDaysIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  const avatars = [
    {
      src: "https://github.com/shadcn.png",
      fallback: "CN",
      alt: "Representative member avatar (shadcn)",
    },
    {
      src: "https://github.com/vercel.png",
      fallback: "VC",
      alt: "Representative member avatar (Vercel)",
    },
    {
      src: "https://github.com/t3-oss.png",
      fallback: "T3",
      alt: "Representative member avatar (T3 OSS)",
    },
  ] as const;

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
    <section className="px-4 pt-10 pb-10 sm:pt-14 sm:pb-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="flex flex-col"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <div className="flex justify-center md:justify-start">
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-muted/30 px-3 py-2"
            >
              <div className="flex items-center">
                {avatars.map((avatar, index) => (
                  <Avatar
                    key={avatar.src}
                    className="-ml-1.5 size-7 ring-2 ring-background first:ml-0"
                    style={{ zIndex: avatars.length - index }}
                  >
                    <AvatarImage src={avatar.src} alt={avatar.alt} />
                    <AvatarFallback className="text-[10px]">
                      {avatar.fallback}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <p className="text-xs font-medium text-foreground sm:text-sm">
                100+ members joined
              </p>
            </motion.div>
          </div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-center font-open-sans text-4xl leading-tight font-medium text-foreground sm:mt-8 sm:text-5xl md:text-left lg:text-6xl lg:leading-16"
          >
            Shaping Indonesia&apos;s{" "}
            <span className="text-primary">
              Health <br className="hidden sm:block" /> Informatics
            </span>{" "}
            Since 2005
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-center text-sm text-foreground sm:mt-6 sm:text-base md:text-left"
          >
            A professional organization dedicated to communication,
            collaboration, and <br className="hidden sm:block" /> scientific
            development across medicine, public health, and information
            technology.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col justify-center gap-2 sm:mt-10 sm:flex-row md:justify-start"
          >
            <Button
              size="lg"
              className="group/button h-11 w-full cursor-pointer px-4 text-sm font-normal sm:h-12 sm:w-auto sm:text-base"
            >
              Check Our Events
              <CalendarDaysIcon
                className="ml-2 size-4 shrink-0 transition-transform duration-300 group-hover/button:scale-110 motion-reduce:group-hover/button:scale-100"
                aria-hidden
              />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full cursor-pointer px-4 text-sm font-normal sm:h-12 sm:w-auto sm:text-base"
            >
              Contact Us
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
