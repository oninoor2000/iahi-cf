import { AboutPage } from "@/components/about/about-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | IAHI" },
      {
        name: "description",
        content:
          "Background, vision, mission, membership, and governance of the Indonesian Association of Health Informatics (IAHI), established 2005 in Jakarta.",
      },
    ],
  }),
  component: AboutRoute,
});

function AboutRoute() {
  return <AboutPage />;
}
