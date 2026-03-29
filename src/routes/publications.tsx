import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/publications")({
  head: () => ({
    meta: [
      { title: "Publications | IAHI" },
      {
        name: "description",
        content: "Explore official publications and research outputs from IAHI.",
      },
    ],
  }),
  component: PublicationsPage,
});

function PublicationsPage() {
  return (
    <main className="page-wrap px-4 pb-12 pt-10">
      <h1 className="text-3xl font-semibold text-foreground">Publications</h1>
      <p className="mt-3 text-muted-foreground">
        This page is under development. Publications, reports, and downloadable
        resources will be available soon.
      </p>
    </main>
  );
}
