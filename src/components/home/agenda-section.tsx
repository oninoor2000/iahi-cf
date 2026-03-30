import { motion, useReducedMotion } from "framer-motion";

import { AgendaEventCard } from "@/components/agenda/agenda-event-card";
import { AGENDA_EVENTS } from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

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
                key={event.slug}
                variants={fadeUp}
                className={cn("min-w-0", index >= 3 && "max-sm:hidden")}
              >
                <AgendaEventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
