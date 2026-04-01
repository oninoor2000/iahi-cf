import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(web)/profile/membership")({
  beforeLoad: () => {
    throw redirect({
      to: "/profile",
      search: { section: "membership" },
    });
  },
});
