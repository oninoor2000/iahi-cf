import { AgendaSection } from "@/components/home/agenda-section";
import { ExpertsCarousel } from "@/components/home/experts-carousel";
import { HeroSection } from "@/components/home/hero-section";
import { PublicationsSection } from "@/components/home/publications-section";
import AboutUs from "@/components/home/about-us";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(web)/")({
  head: () => ({
    meta: [
      { title: "IAHI – Perhimpunan Informatika Kesehatan Indonesia" },
      {
        name: "description",
        content:
          "Forum komunikasi, kolaborasi, dan pengembangan ilmiah di bidang Informatika Kesehatan Indonesia. Bergabung bersama para profesional dari kedokteran, kesehatan masyarakat, dan teknologi informasi.",
      },
    ],
  }),
  component: App,
});

function App() {
  return (
    <main>
      <HeroSection />
      <ExpertsCarousel />
      <AgendaSection />
      <AboutUs />
      <PublicationsSection />
    </main>
  );
}
