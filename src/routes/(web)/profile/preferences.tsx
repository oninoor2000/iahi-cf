import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(web)/profile/preferences")({
  beforeLoad: () => {
    throw redirect({
      to: "/profile",
      search: { section: "preferences" },
    });
  },
});
