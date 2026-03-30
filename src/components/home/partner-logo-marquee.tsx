import { useState } from "react";

/**
 * Partner logos: Wikimedia Commons / public sources for realistic mockups.
 * Replace later.
 */
type Partner = {
  id: string;
  name: string;
  initials: string;
  /** Direct image URL; falls back to initials if missing or on load error */
  logoUrl: string | null;
};

const PARTNERS: readonly Partner[] = [
  {
    id: "who",
    name: "World Health Organization",
    initials: "WHO",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/7a/World_Health_Organization_Logo.svg",
  },
  {
    id: "kemenkes",
    name: "Kementerian Kesehatan Republik Indonesia",
    initials: "Kemenkes",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Logo_Kementerian_Kesehatan_Republik_Indonesia_%282024_rev%29.png/330px-Logo_Kementerian_Kesehatan_Republik_Indonesia_%282024_rev%29.png",
  },
  {
    id: "world-bank",
    name: "World Bank Group",
    initials: "WBG",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/ca/World_Bank_Group_logo.svg",
  },
  {
    id: "un",
    name: "United Nations",
    initials: "UN",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/52/Emblem_of_the_United_Nations.svg",
  },
  {
    id: "ieee",
    name: "IEEE",
    initials: "IEEE",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/21/IEEE_logo.svg",
  },
  {
    id: "ifrc",
    name: "International Federation of Red Cross and Red Crescent Societies",
    initials: "IFRC",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/38/IFRC_logo_2020.svg",
  },
  {
    id: "unesco",
    name: "UNESCO",
    initials: "UNESCO",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/UNESCO_logo.svg",
  },
  {
    id: "eu",
    name: "European Union",
    initials: "EU",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg",
  },
] as const;

function PartnerLogoBox({
  partner,
  ariaHidden,
}: {
  partner: Partner;
  ariaHidden?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(partner.logoUrl) && !failed;

  return (
    <div
      className="flex h-10 w-29 shrink-0 items-center justify-center sm:h-11 sm:w-36"
      title={partner.name}
      aria-hidden={ariaHidden}
    >
      {showImage ? (
        <img
          src={partner.logoUrl!}
          alt=""
          className="max-h-9 w-full max-w-35 object-contain opacity-[0.85] grayscale transition duration-300 sm:max-h-10 dark:opacity-75 dark:contrast-125"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-center text-[10px] leading-tight font-semibold tracking-wide text-muted-foreground">
          {partner.initials}
        </span>
      )}
    </div>
  );
}

export function PartnerLogoMarquee() {
  return (
    <div className="mt-10 py-7 sm:mt-12 sm:py-9 md:py-10 lg:py-20">
      <p className="sr-only">Partner organizations</p>
      <div className="relative overflow-hidden">
        <div className="partner-marquee-track animate-partner-marquee flex w-max gap-10 sm:gap-14 md:gap-16">
          {PARTNERS.map((p) => (
            <PartnerLogoBox key={`a-${p.id}`} partner={p} />
          ))}
          {PARTNERS.map((p) => (
            <PartnerLogoBox key={`b-${p.id}`} partner={p} ariaHidden />
          ))}
        </div>
      </div>
    </div>
  );
}
