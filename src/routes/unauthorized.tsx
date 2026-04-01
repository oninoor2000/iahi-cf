import { UnauthorizedView } from "@/components/system/route-fallbacks";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({
    meta: [
      { title: "Unauthorized | IAHI" },
      {
        name: "description",
        content: "You do not have permission to access this page.",
      },
    ],
  }),
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  return <UnauthorizedView />;
}
