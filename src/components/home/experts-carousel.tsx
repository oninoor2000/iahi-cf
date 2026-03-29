import { MicroscopeIcon } from "lucide-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { motion, useReducedMotion } from "framer-motion";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type ExpertCard = {
  id: string;
  name: string;
  role: string;
  specialization: string;
  imageUrl: string;
  cardClassName: string;
};

const EXPERTS: readonly ExpertCard[] = [
  {
    id: "expert-1",
    name: "Dr. Arif Pratama",
    role: "Health Data Scientist",
    specialization: "Health Data Governance",
    imageUrl:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=900&q=80",
    cardClassName: "bg-slate-700",
  },
  {
    id: "expert-2",
    name: "Dr. Naya Kusuma",
    role: "Interoperability Lead",
    specialization: "HL7 FHIR Implementation",
    imageUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80",
    cardClassName: "bg-sky-700",
  },
  {
    id: "expert-3",
    name: "Dr. Fajar Ramadhan",
    role: "Clinical AI Researcher",
    specialization: "Clinical Decision Support",
    imageUrl:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=900&q=80",
    cardClassName: "bg-zinc-700",
  },
  {
    id: "expert-4",
    name: "Dr. Vida Lestari",
    role: "Public Health Informatician",
    specialization: "Epidemiology Analytics",
    imageUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80",
    cardClassName: "bg-neutral-700",
  },
  {
    id: "expert-5",
    name: "Dr. Bima Hartono",
    role: "Digital Health Strategist",
    specialization: "Health Information Systems",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
    cardClassName: "bg-indigo-700",
  },
  {
    id: "expert-6",
    name: "Dr. Rani Wibowo",
    role: "Biomedical Informatics Analyst",
    specialization: "Clinical Data Integration",
    imageUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    cardClassName: "bg-emerald-700",
  },
  {
    id: "expert-7",
    name: "Dr. Yusuf Akbar",
    role: "Population Health Researcher",
    specialization: "Disease Surveillance",
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    cardClassName: "bg-rose-700",
  },
  {
    id: "expert-8",
    name: "Dr. Intan Prameswari",
    role: "Health Policy Informatics Lead",
    specialization: "Evidence-Based Policy",
    imageUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=80",
    cardClassName: "bg-amber-700",
  },
] as const;

export function ExpertsCarousel() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="pb-12 pt-2 sm:pb-16"
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: reduceMotion ? 0 : 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <div className="flex justify-center">
        <div className="w-full max-w-[1600px]">
          <Carousel
            opts={{ align: "start", loop: true, dragFree: true }}
            plugins={[
              AutoScroll({
                playOnInit: true,
                speed: 0.8,
                stopOnMouseEnter: true,
                stopOnInteraction: false,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {EXPERTS.map((expert) => (
                <CarouselItem
                  key={expert.id}
                  className="pl-8 basis-[84%] sm:basis-[58%] md:basis-[42%] lg:basis-[27.5%]"
                >
                  <article
                    className={`group relative h-[400px] md:h-[440px] overflow-hidden ${expert.cardClassName}`}
                  >
                    <img
                      src={expert.imageUrl}
                      alt={expert.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    <div className="absolute inset-x-0 top-0 p-3">
                      <div className="inline-flex max-w-[92%] flex-col rounded-md bg-black/60 px-2.5 py-2 text-xs text-white backdrop-blur-sm">
                        <p className="font-semibold leading-tight">
                          {expert.name}
                        </p>
                        <p className="text-white/90">{expert.role}</p>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/95 px-3 py-1.5 dark:bg-black/60 text-xs font-semibold text-foreground shadow-sm">
                      <MicroscopeIcon className="size-3.5 text-primary" />
                      {expert.specialization}
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </motion.section>
  );
}
