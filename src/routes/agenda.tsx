import { AgendaListPage } from "@/components/agenda/agenda-list-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda | IAHI" },
      {
        name: "description",
        content:
          "IAHI event calendar: conferences, workshops, forums, and member gatherings—with dates, locations, and links to learn more or register.",
      },
    ],
  }),
  component: AgendaRoute,
});

function AgendaRoute() {
  return <AgendaListPage />;
}
