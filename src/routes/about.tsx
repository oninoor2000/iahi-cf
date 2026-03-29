import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | IAHI" },
      {
        name: "description",
        content:
          "Learn more about the Indonesian Association of Health Informatics (IAHI).",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="page-wrap px-4 pb-12 pt-10">
      <h1 className="text-3xl font-semibold text-foreground">About</h1>
      <p className="mt-3 text-muted-foreground">
        This page is under development. Organization background, vision, mission,
        and governance details will be added soon.
      </p>
    </main>
  );
}
