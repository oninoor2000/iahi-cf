import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda | IAHI" },
      {
        name: "description",
        content:
          "View upcoming events, workshops, and forum activities by IAHI.",
      },
    ],
  }),
  component: AgendaPage,
});

function AgendaPage() {
  return (
    <main className="page-wrap px-4 pt-10 pb-12">
      <h1 className="text-3xl font-semibold text-foreground">Agenda</h1>
      <p className="mt-3 text-muted-foreground">
        This page is under development. Upcoming events, schedules, and
        participation details will be published soon.
      </p>
    </main>
  );
}
