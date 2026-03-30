export type AgendaFormat = "in-person" | "hybrid" | "online";
export type AgendaCategory =
  | "conference"
  | "workshop"
  | "forum"
  | "meetup"
  | "meeting";

export const agendaFormatLabel: Record<AgendaFormat, string> = {
  "in-person": "In person",
  hybrid: "Hybrid",
  online: "Online",
};

export const agendaCategoryLabel: Record<AgendaCategory, string> = {
  conference: "Conference",
  workshop: "Workshop",
  forum: "Forum",
  meetup: "Meetup",
  meeting: "Meeting",
};

export type AgendaCard = {
  slug: string;
  title: string;
  stat: string;
  subtext: string;
  image: { src: string; alt: string };
  /** External https URL or internal `/agenda` deep link; internal entries use `/agenda#<slug>`. */
  href: string;
  ctaLabel?: string;
  /** Primary calendar year for filtering */
  year: number;
  format: AgendaFormat;
  category: AgendaCategory;
};

export function agendaYearsFromEvents(events: readonly AgendaCard[]): number[] {
  return [...new Set(events.map((e) => e.year))].sort((a, b) => b - a);
}

/** Portrait tiles (≈3:4). Picsum is free, no API key; seed keeps each card stable. */
export function picsumAgendaImage(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/1600`;
}

export function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

export const AGENDA_EVENTS: AgendaCard[] = [
  {
    slug: "medinfo-2025",
    title: "MEDINFO 2025",
    stat: "Aug 9–13, 2025",
    subtext: 'Taipei, Taiwan · Theme: "Healthcare Smart × Medicine Deep"',
    image: {
      src: picsumAgendaImage("iahi-medinfo-2025"),
      alt: "Conference and event imagery",
    },
    href: "https://medinfo2025.tw/",
    ctaLabel: "View details",
    year: 2025,
    format: "in-person",
    category: "conference",
  },
  {
    slug: "national-symposium-2024",
    title: "IAHI National Symposium 2024",
    stat: "Nov 14–15, 2024",
    subtext: "Jakarta · Digital transformation in Indonesian hospitals",
    image: {
      src: picsumAgendaImage("iahi-national-symposium-2024"),
      alt: "Large venue and architecture",
    },
    href: "/agenda#national-symposium-2024",
    ctaLabel: "View details",
    year: 2024,
    format: "in-person",
    category: "conference",
  },
  {
    slug: "digital-health-workshop",
    title: "Digital Health Workshop Series",
    stat: "Mar–Jun, 2024",
    subtext: "Hybrid · FHIR, interoperability, and clinical data standards",
    image: {
      src: picsumAgendaImage("iahi-digital-health-workshop"),
      alt: "Technology and workspace",
    },
    href: "/agenda#digital-health-workshop",
    ctaLabel: "View details",
    year: 2024,
    format: "hybrid",
    category: "workshop",
  },
  {
    slug: "fhir-connectathon",
    title: "Regional FHIR Connectathon",
    stat: "Sep 6–8, 2024",
    subtext: "Bandung · Developer and implementer meetup (placeholder)",
    image: {
      src: picsumAgendaImage("iahi-fhir-connectathon"),
      alt: "Collaboration and meeting",
    },
    href: "/agenda#fhir-connectathon",
    ctaLabel: "View details",
    year: 2024,
    format: "in-person",
    category: "meetup",
  },
  {
    slug: "public-health-forum",
    title: "Public Health Informatics Forum",
    stat: "Jul 20, 2024",
    subtext:
      "Online · Population health and surveillance systems (placeholder)",
    image: {
      src: picsumAgendaImage("iahi-public-health-forum"),
      alt: "Urban and modern buildings",
    },
    href: "/agenda#public-health-forum",
    ctaLabel: "View details",
    year: 2024,
    format: "online",
    category: "forum",
  },
  {
    slug: "annual-members-2024",
    title: "Annual Members Meeting",
    stat: "Dec 7, 2024",
    subtext: "Jakarta · Governance, reports, and 2025 priorities (placeholder)",
    image: {
      src: picsumAgendaImage("iahi-annual-members-2024"),
      alt: "Indoor professional gathering",
    },
    href: "/agenda#annual-members-2024",
    ctaLabel: "View details",
    year: 2024,
    format: "in-person",
    category: "meeting",
  },
];
